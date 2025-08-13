import { Chart } from "@/components/ui/chart"
import feather from "feather-icons"

document.addEventListener("DOMContentLoaded", () => {
  feather.replace()

  // Elements
  const mainContainer = document.getElementById("main-container")
  const recorderState = document.getElementById("recorder-state")
  const loadingState = document.getElementById("loading-state")
  const qaState = document.getElementById("qa-state")
  const summaryState = document.getElementById("summary-state")

  const recordButton = document.getElementById("recordButton")
  const statusDiv = document.getElementById("status")
  const loadingStatusDiv = document.getElementById("loading-status")
  const questionContainer = document.getElementById("question-container")
  const submitAnswersButton = document.getElementById("submit-answers-button")
  const summaryText = document.getElementById("summary-text")
  const restartButton = document.getElementById("restart-button")

  // Sidebar and Response Sheet
  const sidebar = document.getElementById("sidebar")
  const responseSheet = document.getElementById("response-sheet")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarOpen = document.getElementById("sidebar-open")
  const responseSheetToggle = document.getElementById("response-sheet-toggle")
  const responseSheetClose = document.getElementById("response-sheet-close")

  // Timer elements
  const recordingTimeEl = document.getElementById("recording-time")
  const processingTimeEl = document.getElementById("processing-time")
  const sessionTimerEl = document.getElementById("session-timer")
  const currentSessionTimeEl = document.getElementById("current-session-time")

  // Variables
  let mediaRecorder
  let audioChunks = []
  let isRecording = false
  let sessionData = {}
  let recordingStartTime = 0
  let processingStartTime = 0
  const sessionStartTime = Date.now()
  let recordingTimer = null
  const processingTimer = null
  let sessionTimer = null
  let sidebarCollapsed = false
  let responseSheetCollapsed = true

  // Initialize
  initializeApp()

  function initializeApp() {
    startSessionTimer()
    initializeChart()
    loadSessionStats()
    setupNavigation()

    // Set initial state
    updateMainContentMargins()
  }

  function startSessionTimer() {
    sessionTimer = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime
      const formatted = formatTime(elapsed)
      sessionTimerEl.textContent = formatted
      if (currentSessionTimeEl) {
        currentSessionTimeEl.textContent = formatTime(elapsed, false)
      }
    }, 1000)
  }

  function formatTime(ms, includeHours = true) {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (includeHours) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
  }

  function updateRecordingTimer() {
    if (isRecording) {
      const elapsed = Date.now() - recordingStartTime
      recordingTimeEl.textContent = formatTime(elapsed, false)
    }
  }

  function updateProcessingTimer() {
    const elapsed = Date.now() - processingStartTime
    processingTimeEl.textContent = formatTime(elapsed, false)
  }

  // Sidebar and Response Sheet Controls
  if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar)
  if (sidebarOpen) sidebarOpen.addEventListener("click", openSidebar)
  if (responseSheetToggle) responseSheetToggle.addEventListener("click", toggleResponseSheet)
  if (responseSheetClose) responseSheetClose.addEventListener("click", closeResponseSheet)

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

  function toggleResponseSheet() {
    responseSheetCollapsed = !responseSheetCollapsed
    if (responseSheetCollapsed) {
      responseSheet.classList.add("response-sheet-collapsed")
    } else {
      responseSheet.classList.remove("response-sheet-collapsed")
    }
    updateMainContentMargins()
  }

  function closeResponseSheet() {
    responseSheetCollapsed = true
    responseSheet.classList.add("response-sheet-collapsed")
    updateMainContentMargins()
  }

  function updateMainContentMargins() {
    const leftMargin = sidebarCollapsed ? "0" : "320px"
    const rightMargin = responseSheetCollapsed ? "0" : "384px"
    mainContent.style.marginLeft = leftMargin
    mainContent.style.marginRight = rightMargin
  }

  // Navigation
  function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.getAttribute("data-page")
        if (page && page !== window.location.pathname.split("/").pop()) {
          window.location.href = page
        }
      })
    })
  }

  function showState(stateToShow) {
    const states = [recorderState, loadingState, qaState, summaryState]

    const currentState = states.find((s) => !s.classList.contains("hidden"))
    if (currentState && currentState !== stateToShow) {
      currentState.classList.add("fade-out")
      setTimeout(() => {
        currentState.classList.add("hidden")
        currentState.classList.remove("fade-out")

        stateToShow.classList.remove("hidden")
        stateToShow.classList.add("fade-in")
      }, 500)
    } else {
      states.forEach((s) => s.classList.add("hidden"))
      stateToShow.classList.remove("hidden")
      stateToShow.classList.add("fade-in")
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []
      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data)
      mediaRecorder.onstop = handleRecordingStop
      mediaRecorder.start()
      isRecording = true
      recordingStartTime = Date.now()
      updateUIAfterRecordingStart()

      // Start recording timer
      recordingTimer = setInterval(updateRecordingTimer, 100)
    } catch (err) {
      statusDiv.textContent = "Microphone access denied."
      showNotification("Microphone access denied", "error")
    }
  }

  function stopRecording() {
    if (mediaRecorder) mediaRecorder.stop()
    isRecording = false
    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }
    updateUIAfterRecordingStop()
  }

  function updateUIAfterRecordingStart() {
    recordButton.classList.add("recording")
    recordButton.querySelector("i").classList.add("animate-pulse")
    const recordingViz = document.getElementById("recording-viz")
    if (recordingViz) recordingViz.classList.remove("hidden")
    statusDiv.textContent = "Recording in progress... Click to stop."
  }

  function updateUIAfterRecordingStop() {
    recordButton.classList.remove("recording")
    recordButton.querySelector("i").classList.remove("animate-pulse")
    const recordingViz = document.getElementById("recording-viz")
    if (recordingViz) recordingViz.classList.add("hidden")
    statusDiv.textContent = "Processing your recording..."
  }

  async function handleRecordingStop() {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
    const formData = new FormData()
    formData.append("file", audioBlob, "recording.webm")

    showState(loadingState)
    processingStartTime = Date.now()

    // Start processing timer
    const processingTimerInterval = setInterval(updateProcessingTimer, 100)

    // Update progress steps
    updateProgressStep(1, true)
    loadingStatusDiv.textContent = "Transcribing your audio..."

    try {
      const response = await fetch("http://127.0.0.1:8000/start_session", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to start session.")
      }

      updateProgressStep(2, true)
      loadingStatusDiv.textContent = "Analyzing your thoughts..."

      sessionData = await response.json()

      updateProgressStep(3, true)
      loadingStatusDiv.textContent = "Generating personalized questions..."

      // Update word count
      const wordCount = sessionData.original_text ? sessionData.original_text.split(" ").length : 0
      const wordsCountEl = document.getElementById("words-count")
      if (wordsCountEl) wordsCountEl.textContent = wordCount

      setTimeout(() => {
        clearInterval(processingTimerInterval)
        displayQuestions(sessionData.questions)
        showState(qaState)
        addResponseToHistory("Questions Generated", "success")
        showNotification("Questions generated successfully!", "success")
      }, 1000)
    } catch (error) {
      clearInterval(processingTimerInterval)
      console.error("Error starting session:", error)
      statusDiv.textContent = `Error: ${error.message}`
      showState(recorderState)
      addResponseToHistory("Session Failed", "error")
      showNotification("Session failed. Please try again.", "error")
    }
  }

  function updateProgressStep(step, active) {
    const stepEl = document.getElementById(`step-${step}`)
    if (stepEl) {
      if (active) {
        stepEl.classList.remove("bg-gray-600")
        stepEl.classList.add("bg-violet-400")
      }
    }
  }

  if (recordButton) {
    recordButton.addEventListener("click", () => {
      isRecording ? stopRecording() : startRecording()
    })
  }

  function displayQuestions(questions) {
    questionContainer.innerHTML = ""
    questions.forEach((q, index) => {
      const questionElement = document.createElement("div")
      questionElement.className = "question-item fade-in"
      questionElement.style.animationDelay = `${index * 150}ms`
      questionElement.innerHTML = `
                <label for="question-${index}" class="block text-lg font-medium text-gray-200 mb-6">${q}</label>
                <div class="flex items-center gap-6">
                    <span class="text-sm text-gray-400 w-12">Low</span>
                    <input type="range" id="question-${index}" name="question-${index}" min="1" max="10" value="5" class="flex-1">
                    <span class="text-sm text-gray-400 w-12">High</span>
                    <div class="text-center text-2xl font-bold text-violet-300 w-12 h-12 flex items-center justify-center bg-violet-500/20 rounded-full border border-violet-400/30">
                        <span id="q-val-${index}">5</span>
                    </div>
                </div>
            `
      questionContainer.appendChild(questionElement)

      const slider = document.getElementById(`question-${index}`)
      const valueDisplay = document.getElementById(`q-val-${index}`)

      slider.addEventListener("input", (e) => {
        valueDisplay.textContent = e.target.value
        const percentage = ((e.target.value - 1) / 9) * 100
        e.target.style.background = `linear-gradient(to right, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.8) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`
      })

      // Initialize slider background
      const percentage = ((5 - 1) / 9) * 100
      slider.style.background = `linear-gradient(to right, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0.8) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`
    })
  }

  if (submitAnswersButton) {
    submitAnswersButton.addEventListener("click", async () => {
      const answers = sessionData.questions.map((q, index) => {
        return { question: q, answer: document.getElementById(`question-${index}`).value }
      })

      showState(loadingState)
      processingStartTime = Date.now()
      const processingTimerInterval = setInterval(updateProcessingTimer, 100)

      updateProgressStep(1, true)
      updateProgressStep(2, true)
      updateProgressStep(3, true)
      loadingStatusDiv.textContent = "Generating your personalized summary..."

      const payload = { original_text: sessionData.original_text, answers: answers }

      try {
        const response = await fetch("http://127.0.0.1:8000/get_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || "Failed to get summary.")
        }

        const result = await response.json()
        clearInterval(processingTimerInterval)
        summaryText.innerHTML = result.summary.replace(/\n/g, '<p class="my-4"></p>')
        showState(summaryState)
        addResponseToHistory("Summary Generated", "success")
        updateSessionStats()
        showNotification("Summary generated successfully!", "success")
      } catch (error) {
        clearInterval(processingTimerInterval)
        console.error("Error getting summary:", error)
        statusDiv.textContent = `Error: ${error.message}`
        showState(recorderState)
        addResponseToHistory("Summary Failed", "error")
        showNotification("Failed to generate summary. Please try again.", "error")
      }
    })
  }

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      sessionData = {}
      statusDiv.textContent = "Click to begin your session"

      // Reset timers
      recordingTimeEl.textContent = "00:00"
      processingTimeEl.textContent = "00:00"

      // Reset progress steps
      for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step-${i}`)
        if (stepEl) {
          stepEl.classList.remove("bg-violet-400")
          stepEl.classList.add("bg-gray-600")
        }
      }

      showState(recorderState)
      addResponseToHistory("New Session Started", "info")
      showNotification("New session started", "info")
    })
  }

  // Response History Functions
  function addResponseToHistory(message, type) {
    const historyContainer = document.getElementById("response-history")
    if (!historyContainer) return

    const timestamp = new Date().toLocaleTimeString()

    const responseItem = document.createElement("div")
    responseItem.className = "response-item fade-in"

    const typeColors = {
      success: "text-green-300",
      error: "text-red-300",
      info: "text-blue-300",
    }

    responseItem.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm ${typeColors[type]} font-medium">${message}</div>
                <div class="text-xs text-gray-500">${timestamp}</div>
            </div>
        `

    if (
      historyContainer.children.length > 0 &&
      historyContainer.children[0].textContent.includes("No previous responses")
    ) {
      historyContainer.innerHTML = ""
    }

    historyContainer.insertBefore(responseItem, historyContainer.firstChild)

    // Keep only last 10 responses
    while (historyContainer.children.length > 10) {
      historyContainer.removeChild(historyContainer.lastChild)
    }
  }

  // Session Stats Functions
  function loadSessionStats() {
    const totalSessions = localStorage.getItem("totalSessions") || 0
    const avgResponseTime = localStorage.getItem("avgResponseTime") || "--"

    const totalSessionsEl = document.getElementById("total-sessions")
    const avgResponseTimeEl = document.getElementById("avg-response-time")

    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions
    if (avgResponseTimeEl) avgResponseTimeEl.textContent = avgResponseTime
  }

  function updateSessionStats() {
    const totalSessions = Number.parseInt(localStorage.getItem("totalSessions") || 0) + 1
    localStorage.setItem("totalSessions", totalSessions)

    const totalSessionsEl = document.getElementById("total-sessions")
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions

    // Calculate average response time (simplified)
    const currentResponseTime = Date.now() - sessionStartTime
    const avgResponseTime = Math.floor(currentResponseTime / 1000) + "s"
    localStorage.setItem("avgResponseTime", avgResponseTime)

    const avgResponseTimeEl = document.getElementById("avg-response-time")
    if (avgResponseTimeEl) avgResponseTimeEl.textContent = avgResponseTime
  }

  // Chart Initialization
  function initializeChart() {
    const ctx = document.getElementById("sessionChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Sessions",
            data: [2, 1, 3, 2, 4, 1, 2],
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#9ca3af",
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#9ca3af",
            },
          },
        },
      },
    })
  }

  // Save Session Function
  const saveSessionBtn = document.getElementById("save-session")
  if (saveSessionBtn) {
    saveSessionBtn.addEventListener("click", () => {
      const sessionToSave = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        summary: summaryText.innerHTML,
        questions: sessionData.questions,
        originalText: sessionData.original_text,
        duration: Date.now() - sessionStartTime,
      }

      const savedSessions = JSON.parse(localStorage.getItem("savedSessions") || "[]")
      savedSessions.push(sessionToSave)
      localStorage.setItem("savedSessions", JSON.stringify(savedSessions))

      addResponseToHistory("Session Saved", "success")
      showNotification("Session saved successfully!", "success")
    })
  }

  // Quick Actions
  const exportDataBtn = document.getElementById("export-data")
  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", exportSessionData)
  }

  const clearHistoryBtn = document.getElementById("clear-history")
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearSessionHistory)
  }

  function exportSessionData() {
    const sessions = JSON.parse(localStorage.getItem("savedSessions") || "[]")
    const dataStr = JSON.stringify(sessions, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `therapy-connect-sessions-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    showNotification("Session data exported successfully!", "success")
  }

  function clearSessionHistory() {
    if (confirm("Are you sure you want to clear all session history? This action cannot be undone.")) {
      localStorage.removeItem("savedSessions")
      localStorage.removeItem("totalSessions")
      localStorage.removeItem("avgResponseTime")

      // Reset UI
      loadSessionStats()
      const historyContainer = document.getElementById("response-history")
      if (historyContainer) {
        historyContainer.innerHTML =
          '<div class="response-item"><div class="text-sm text-gray-400">No previous responses</div></div>'
      }

      showNotification("Session history cleared", "info")
    }
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
      responseSheetCollapsed = true
      sidebar.classList.add("sidebar-collapsed")
      if (responseSheet) responseSheet.classList.add("response-sheet-collapsed")
      updateMainContentMargins()
    }
  }

  window.addEventListener("resize", handleResize)
  handleResize() // Initial check
})

