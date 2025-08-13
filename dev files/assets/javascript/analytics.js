import { Chart } from "@/components/ui/chart"
import feather from "feather-icons"

document.addEventListener("DOMContentLoaded", () => {
  feather.replace()

  // Elements
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarOpen = document.getElementById("sidebar-open")
  const timeRange = document.getElementById("time-range")

  let sidebarCollapsed = false
  let sessions = []
  const charts = {}

  // Initialize
  initializeAnalytics()

  function initializeAnalytics() {
    loadSessionData()
    setupEventListeners()
    updateAnalyticsStats()
    initializeCharts()
    generateInsights()
    updateMainContentMargins()
  }

  function setupEventListeners() {
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar)
    if (sidebarOpen) sidebarOpen.addEventListener("click", openSidebar)
    if (timeRange) timeRange.addEventListener("change", updateAnalytics)

    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.getAttribute("data-page")
        if (page && page !== "analytics.html") {
          window.location.href = page
        }
      })
    })
  }

  function loadSessionData() {
    sessions = JSON.parse(localStorage.getItem("savedSessions") || "[]")
  }

  function updateAnalytics() {
    updateAnalyticsStats()
    updateCharts()
    generateInsights()
  }

  function updateAnalyticsStats() {
    const days = Number.parseInt(timeRange.value)
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const filteredSessions = sessions.filter((session) => new Date(session.timestamp) >= cutoffDate)

    // Total Sessions
    const totalSessionsEl = document.getElementById("total-sessions-analytics")
    if (totalSessionsEl) totalSessionsEl.textContent = filteredSessions.length

    // Total Time
    const totalTime = filteredSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const totalTimeEl = document.getElementById("total-time")
    if (totalTimeEl) totalTimeEl.textContent = formatDuration(totalTime)

    // Average Rating (simulated)
    const avgRating = filteredSessions.length > 0 ? (7.5 + Math.random() * 1.5).toFixed(1) : "0.0"
    const avgRatingEl = document.getElementById("avg-rating")
    if (avgRatingEl) avgRatingEl.textContent = avgRating

    // Current Streak
    const streak = calculateStreak()
    const currentStreakEl = document.getElementById("current-streak")
    if (currentStreakEl) currentStreakEl.textContent = streak

    // Sidebar stats
    updateSidebarStats(filteredSessions)
  }

  function updateSidebarStats(filteredSessions) {
    // Average session length
    const avgLength =
      filteredSessions.length > 0
        ? filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / filteredSessions.length
        : 0
    const avgSessionLengthEl = document.getElementById("avg-session-length")
    if (avgSessionLengthEl) avgSessionLengthEl.textContent = formatDuration(avgLength)

    // Most active day
    const dayCount = {}
    filteredSessions.forEach((session) => {
      const day = new Date(session.timestamp).toLocaleDateString("en-US", { weekday: "long" })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const mostActiveDay = Object.keys(dayCount).reduce((a, b) => (dayCount[a] > dayCount[b] ? a : b), "--")
    const mostActiveDayEl = document.getElementById("most-active-day")
    if (mostActiveDayEl) mostActiveDayEl.textContent = mostActiveDay

    // Improvement score (simulated)
    const improvementScore = filteredSessions.length > 0 ? Math.floor(65 + Math.random() * 30) + "%" : "--"
    const improvementScoreEl = document.getElementById("improvement-score")
    if (improvementScoreEl) improvementScoreEl.textContent = improvementScore
  }

  function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  function calculateStreak() {
    if (sessions.length === 0) return 0

    const sortedSessions = sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp)
      sessionDate.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24))

      if (dayDiff === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (dayDiff > streak) {
        break
      }
    }

    return streak
  }

  function initializeCharts() {
    initializeFrequencyChart()
    initializeMoodChart()
    initializeDurationChart()
    updateWeeklyPattern()
  }

  function initializeFrequencyChart() {
    const ctx = document.getElementById("frequencyChart")
    if (!ctx) return

    const days = Number.parseInt(timeRange.value)
    const labels = []
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const sessionsOnDay = sessions.filter((session) => {
        const sessionDate = new Date(session.timestamp)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      }).length

      data.push(sessionsOnDay)
    }

    charts.frequency = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sessions",
            data: data,
            backgroundColor: "rgba(139, 92, 246, 0.6)",
            borderColor: "#8b5cf6",
            borderWidth: 1,
            borderRadius: 4,
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
              stepSize: 1,
            },
          },
        },
      },
    })
  }

  function initializeMoodChart() {
    const ctx = document.getElementById("moodChart")
    if (!ctx) return

    // Simulated mood data
    const days = Math.min(Number.parseInt(timeRange.value), 30)
    const labels = []
    const moodData = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
      moodData.push(5 + Math.random() * 3 + Math.sin(i * 0.1) * 1.5) // Simulated mood trend
    }

    charts.mood = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Mood Score",
            data: moodData,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
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
            min: 0,
            max: 10,
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

  function initializeDurationChart() {
    const ctx = document.getElementById("durationChart")
    if (!ctx) return

    const durations = sessions.map((session) => Math.floor((session.duration || 0) / 60000)) // Convert to minutes
    const durationRanges = ["0-5", "5-10", "10-15", "15-20", "20+"]
    const durationCounts = [0, 0, 0, 0, 0]

    durations.forEach((duration) => {
      if (duration <= 5) durationCounts[0]++
      else if (duration <= 10) durationCounts[1]++
      else if (duration <= 15) durationCounts[2]++
      else if (duration <= 20) durationCounts[3]++
      else durationCounts[4]++
    })

    charts.duration = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: durationRanges,
        datasets: [
          {
            data: durationCounts,
            backgroundColor: [
              "rgba(239, 68, 68, 0.6)",
              "rgba(245, 158, 11, 0.6)",
              "rgba(34, 197, 94, 0.6)",
              "rgba(59, 130, 246, 0.6)",
              "rgba(139, 92, 246, 0.6)",
            ],
            borderColor: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#9ca3af",
              padding: 20,
            },
          },
        },
      },
    })
  }

  function updateWeeklyPattern() {
    const weeklyPatternEl = document.getElementById("weekly-pattern")
    if (!weeklyPatternEl) return

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayCounts = new Array(7).fill(0)

    sessions.forEach((session) => {
      const dayOfWeek = new Date(session.timestamp).getDay()
      dayCounts[dayOfWeek]++
    })

    const maxCount = Math.max(...dayCounts)

    weeklyPatternEl.innerHTML = ""
    dayNames.forEach((day, index) => {
      const percentage = maxCount > 0 ? (dayCounts[index] / maxCount) * 100 : 0
      const dayElement = document.createElement("div")
      dayElement.className = "flex items-center justify-between p-3 bg-black/20 rounded-lg"
      dayElement.innerHTML = `
                <span class="text-sm text-gray-300">${day}</span>
                <div class="flex items-center space-x-2">
                    <div class="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-violet-500 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-sm text-violet-300 w-6">${dayCounts[index]}</span>
                </div>
            `
      weeklyPatternEl.appendChild(dayElement)
    })
  }

  function generateInsights() {
    const insightsContainer = document.getElementById("insights-container")
    if (!insightsContainer) return

    const insights = []

    // Session frequency insight
    if (sessions.length > 0) {
      const avgSessionsPerWeek = (
        sessions.length /
        Math.max(1, Math.ceil((Date.now() - new Date(sessions[0].timestamp)) / (7 * 24 * 60 * 60 * 1000)))
      ).toFixed(1)
      insights.push({
        icon: "calendar",
        title: "Session Frequency",
        description: `You average ${avgSessionsPerWeek} sessions per week. Consistency is key to progress!`,
        type: "info",
      })
    }

    // Duration insight
    if (sessions.length > 0) {
      const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
      const avgMinutes = Math.floor(avgDuration / 60000)
      insights.push({
        icon: "clock",
        title: "Session Length",
        description: `Your average session is ${avgMinutes} minutes. ${avgMinutes > 15 ? "Great depth!" : "Consider longer sessions for deeper reflection."}`,
        type: avgMinutes > 15 ? "success" : "warning",
      })
    }

    // Streak insight
    const streak = calculateStreak()
    if (streak > 0) {
      insights.push({
        icon: "zap",
        title: "Current Streak",
        description: `${streak} day${streak > 1 ? "s" : ""} in a row! Keep up the momentum.`,
        type: "success",
      })
    }

    // Growth insight
    if (sessions.length >= 5) {
      insights.push({
        icon: "trending-up",
        title: "Progress Tracking",
        description: "Your session data shows consistent engagement with self-reflection.",
        type: "info",
      })
    }

    insightsContainer.innerHTML = ""
    insights.forEach((insight) => {
      const insightElement = document.createElement("div")
      insightElement.className = "response-item"
      insightElement.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="p-2 bg-${insight.type === "success" ? "green" : insight.type === "warning" ? "yellow" : "blue"}-500/20 rounded-lg">
                        <i data-feather="${insight.icon}" class="w-4 h-4 text-${insight.type === "success" ? "green" : insight.type === "warning" ? "yellow" : "blue"}-400"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-white">${insight.title}</div>
                        <div class="text-sm text-gray-300 mt-1">${insight.description}</div>
                    </div>
                </div>
            `
      insightsContainer.appendChild(insightElement)
    })

    feather.replace()
  }

  function updateCharts() {
    // Destroy existing charts
    Object.values(charts).forEach((chart) => {
      if (chart) chart.destroy()
    })

    // Reinitialize charts
    initializeCharts()
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
