import feather from "feather-icons"

document.addEventListener("DOMContentLoaded", () => {
  feather.replace()

  // Elements
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarOpen = document.getElementById("sidebar-open")
  const sessionsContainer = document.getElementById("sessions-container")
  const emptyState = document.getElementById("empty-state")
  const dateFilter = document.getElementById("date-filter")
  const sortFilter = document.getElementById("sort-filter")
  const searchSessions = document.getElementById("search-sessions")

  let sidebarCollapsed = false
  let allSessions = []
  let filteredSessions = []

  // Initialize
  initializeHistory()

  function initializeHistory() {
    loadSessions()
    setupEventListeners()
    updateHistoryStats()
    updateMainContentMargins()
  }

  function setupEventListeners() {
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar)
    if (sidebarOpen) sidebarOpen.addEventListener("click", openSidebar)
    if (dateFilter) dateFilter.addEventListener("change", filterSessions)
    if (sortFilter) sortFilter.addEventListener("change", filterSessions)
    if (searchSessions) searchSessions.addEventListener("input", filterSessions)

    const exportHistoryBtn = document.getElementById("export-history")
    const clearAllHistoryBtn = document.getElementById("clear-all-history")

    if (exportHistoryBtn) exportHistoryBtn.addEventListener("click", exportHistory)
    if (clearAllHistoryBtn) clearAllHistoryBtn.addEventListener("click", clearAllHistory)

    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.getAttribute("data-page")
        if (page && page !== "history.html") {
          window.location.href = page
        }
      })
    })
  }

  function loadSessions() {
    allSessions = JSON.parse(localStorage.getItem("savedSessions") || "[]")
    filteredSessions = [...allSessions]
    displaySessions()
  }

  function displaySessions() {
    if (filteredSessions.length === 0) {
      sessionsContainer.classList.add("hidden")
      emptyState.classList.remove("hidden")
      return
    }

    sessionsContainer.classList.remove("hidden")
    emptyState.classList.add("hidden")

    sessionsContainer.innerHTML = ""

    filteredSessions.forEach((session, index) => {
      const sessionElement = createSessionElement(session, index)
      sessionsContainer.appendChild(sessionElement)
    })
  }

  function createSessionElement(session, index) {
    const sessionDiv = document.createElement("div")
    sessionDiv.className = "session-item fade-in"
    sessionDiv.style.animationDelay = `${index * 100}ms`

    const date = new Date(session.timestamp)
    const duration = formatDuration(session.duration || 0)
    const preview = session.summary
      ? session.summary.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
      : "No summary available"

    sessionDiv.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-violet-500/20 rounded-lg">
                        <i data-feather="message-circle" class="w-5 h-5 text-violet-400"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-white">Session ${allSessions.length - allSessions.indexOf(session)}</h3>
                        <p class="text-sm text-gray-400">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-violet-300 bg-violet-500/20 px-2 py-1 rounded">${duration}</span>
                    <button class="p-2 hover:bg-white/10 rounded-lg transition-colors" onclick="deleteSession('${session.id}')">
                        <i data-feather="trash-2" class="w-4 h-4 text-red-400"></i>
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-300 text-sm leading-relaxed">${preview}</p>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-400">
                    <span><i data-feather="help-circle" class="w-4 h-4 inline mr-1"></i>${session.questions ? session.questions.length : 0} questions</span>
                    <span><i data-feather="type" class="w-4 h-4 inline mr-1"></i>${session.originalText ? session.originalText.split(" ").length : 0} words</span>
                </div>
                <button class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-sm" onclick="viewSession('${session.id}')">
                    View Details
                </button>
            </div>
        `

    return sessionDiv
  }

  function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  function filterSessions() {
    const dateFilterValue = dateFilter.value
    const sortFilterValue = sortFilter.value
    const searchValue = searchSessions.value.toLowerCase()

    // Filter by date
    let filtered = [...allSessions]

    if (dateFilterValue !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.timestamp)

        switch (dateFilterValue) {
          case "today":
            return sessionDate >= today
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return sessionDate >= weekAgo
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return sessionDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filter by search
    if (searchValue) {
      filtered = filtered.filter((session) => {
        const searchableText = (session.summary || "").toLowerCase() + (session.originalText || "").toLowerCase()
        return searchableText.includes(searchValue)
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortFilterValue) {
        case "newest":
          return new Date(b.timestamp) - new Date(a.timestamp)
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp)
        case "duration":
          return (b.duration || 0) - (a.duration || 0)
        default:
          return 0
      }
    })

    filteredSessions = filtered
    displaySessions()
  }

  function updateHistoryStats() {
    const totalSessionsEl = document.getElementById("total-sessions-history")
    const weekSessionsEl = document.getElementById("week-sessions")
    const monthSessionsEl = document.getElementById("month-sessions")

    if (totalSessionsEl) totalSessionsEl.textContent = allSessions.length

    // Calculate week sessions
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekSessions = allSessions.filter((session) => new Date(session.timestamp) >= weekAgo).length
    if (weekSessionsEl) weekSessionsEl.textContent = weekSessions

    // Calculate month sessions
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const monthSessions = allSessions.filter((session) => new Date(session.timestamp) >= monthAgo).length
    if (monthSessionsEl) monthSessionsEl.textContent = monthSessions
  }

  // Global functions for session actions
  window.deleteSession = (sessionId) => {
    if (confirm("Are you sure you want to delete this session?")) {
      allSessions = allSessions.filter((session) => session.id != sessionId)
      localStorage.setItem("savedSessions", JSON.stringify(allSessions))
      loadSessions()
      updateHistoryStats()
      showNotification("Session deleted successfully", "success")
    }
  }

  window.viewSession = (sessionId) => {
    const session = allSessions.find((s) => s.id == sessionId)
    if (session) {
      showSessionModal(session)
    }
  }

  function showSessionModal(session) {
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    modal.innerHTML = `
            <div class="glass-card rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white">Session Details</h2>
                    <button onclick="closeModal()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <i data-feather="x" class="w-6 h-6 text-gray-400"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="stat-card">
                            <div class="text-sm text-gray-400 mb-1">Date</div>
                            <div class="text-white font-semibold">${new Date(session.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div class="stat-card">
                            <div class="text-sm text-gray-400 mb-1">Duration</div>
                            <div class="text-white font-semibold">${formatDuration(session.duration || 0)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="text-sm text-gray-400 mb-1">Questions</div>
                            <div class="text-white font-semibold">${session.questions ? session.questions.length : 0}</div>
                        </div>
                    </div>
                    
                    ${
                      session.originalText
                        ? `
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-3">Original Recording</h3>
                        <div class="bg-black/20 p-4 rounded-lg text-gray-300 text-sm leading-relaxed">
                            ${session.originalText}
                        </div>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      session.questions && session.questions.length > 0
                        ? `
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-3">Questions Asked</h3>
                        <div class="space-y-2">
                            ${session.questions
                              .map(
                                (q, i) => `
                                <div class="bg-black/20 p-3 rounded-lg text-gray-300 text-sm">
                                    ${i + 1}. ${q}
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      session.summary
                        ? `
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-3">Summary</h3>
                        <div class="bg-black/20 p-4 rounded-lg text-gray-300 text-sm leading-relaxed">
                            ${session.summary}
                        </div>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `

    document.body.appendChild(modal)
    feather.replace()

    window.closeModal = () => {
      document.body.removeChild(modal)
      delete window.closeModal
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeModal()
      }
    })
  }

  function exportHistory() {
    const dataStr = JSON.stringify(allSessions, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `therapy-connect-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    showNotification("History exported successfully!", "success")
  }

  function clearAllHistory() {
    if (confirm("Are you sure you want to clear all session history? This action cannot be undone.")) {
      localStorage.removeItem("savedSessions")
      allSessions = []
      filteredSessions = []
      displaySessions()
      updateHistoryStats()
      showNotification("All history cleared", "info")
    }
  }

  // Sidebar controls
  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed
    if (sidebarCollapsed) {
      sidebar.classList.add("sidebar-collapsed")
    } else {
      sidebar.classList.remove("sidebar-collapsed")
    }
    updateMainContentMargins()
  }

  function openSidebar() {
    sidebarCollapsed = false
    sidebar.classList.remove("sidebar-collapsed")
    updateMainContentMargins()
  }

  function updateMainContentMargins() {
    const leftMargin = sidebarCollapsed ? "0" : "320px"
    mainContent.style.marginLeft = leftMargin
  }

  // Notification System
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
            <div class="flex items-center">
                <i data-feather="${type === "success" ? "check-circle" : type === "error" ? "x-circle" : "info"}" class="w-5 h-5 mr-3"></i>
                <span>${message}</span>
            </div>
        `

    document.body.appendChild(notification)
    feather.replace()

    setTimeout(() => notification.classList.add("show"), 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 3000)
  }

  // Mobile responsiveness
  function handleResize() {
    if (window.innerWidth < 768) {
      sidebarCollapsed = true
      sidebar.classList.add("sidebar-collapsed")
      updateMainContentMargins()
    }
  }

  window.addEventListener("resize", handleResize)
  handleResize()
})
