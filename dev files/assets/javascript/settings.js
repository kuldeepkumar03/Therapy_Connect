document.addEventListener("DOMContentLoaded", () => {
  const feather = window.feather // Declare the feather variable
  feather.replace()

  // Elements
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarOpen = document.getElementById("sidebar-open")

  let sidebarCollapsed = false

  // Initialize
  initializeSettings()

  function initializeSettings() {
    loadSettings()
    setupEventListeners()
    updateStorageUsage()
    updateMainContentMargins()
  }

  function setupEventListeners() {
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar)
    if (sidebarOpen) sidebarOpen.addEventListener("click", openSidebar)

    // Settings toggles
    setupToggleListeners()
    setupButtonListeners()
    setupThemeSelection()
    setupSliderListeners()

    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.getAttribute("data-page")
        if (page && page !== "settings.html") {
          window.location.href = page
        }
      })
    })
  }

  function setupToggleListeners() {
    const toggles = [
      "auto-save",
      "reminders",
      "local-storage",
      "analytics-tracking",
      "noise-reduction",
      "reduced-motion",
    ]

    toggles.forEach((toggleId) => {
      const toggle = document.getElementById(toggleId)
      if (toggle) {
        toggle.addEventListener("change", () => {
          saveSettings()
          showNotification(`${toggleId.replace("-", " ")} ${toggle.checked ? "enabled" : "disabled"}`, "info")
        })
      }
    })

    // Sidebar quick toggles
    const autoSaveToggle = document.getElementById("auto-save-toggle")
    const notificationsToggle = document.getElementById("notifications-toggle")

    if (autoSaveToggle) {
      autoSaveToggle.addEventListener("change", () => {
        const mainToggle = document.getElementById("auto-save")
        if (mainToggle) mainToggle.checked = autoSaveToggle.checked
        saveSettings()
      })
    }

    if (notificationsToggle) {
      notificationsToggle.addEventListener("change", () => {
        const mainToggle = document.getElementById("reminders")
        if (mainToggle) mainToggle.checked = notificationsToggle.checked
        saveSettings()
      })
    }
  }

  function setupButtonListeners() {
    const resetSettingsBtn = document.getElementById("reset-settings")
    const exportAllDataBtn = document.getElementById("export-all-data")
    const importDataBtn = document.getElementById("import-data")
    const clearAllDataBtn = document.getElementById("clear-all-data")

    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener("click", resetAllSettings)
    }

    if (exportAllDataBtn) {
      exportAllDataBtn.addEventListener("click", exportAllData)
    }

    if (importDataBtn) {
      importDataBtn.addEventListener("click", () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".json"
        input.onchange = importData
        input.click()
      })
    }

    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener("click", clearAllData)
    }
  }

  function setupThemeSelection() {
    document.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.querySelectorAll(".theme-option").forEach((opt) => opt.classList.remove("active"))
        option.classList.add("active")

        const theme = option.getAttribute("data-theme")
        applyTheme(theme)
        saveSettings()
        showNotification(`${theme} theme applied`, "success")
      })
    })
  }

  function setupSliderListeners() {
    const micSensitivity = document.getElementById("mic-sensitivity")
    const animationSpeed = document.getElementById("animation-speed")

    if (micSensitivity) {
      micSensitivity.addEventListener("input", () => {
        saveSettings()
      })
    }

    if (animationSpeed) {
      animationSpeed.addEventListener("input", () => {
        const speed = animationSpeed.value
        document.documentElement.style.setProperty("--animation-speed", `${6 - speed}s`)
        saveSettings()
      })
    }
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("therapyConnectSettings") || "{}")

    // Apply saved settings
    Object.keys(settings).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        if (element.type === "checkbox") {
          element.checked = settings[key]
        } else if (element.type === "range") {
          element.value = settings[key]
        } else if (element.tagName === "SELECT") {
          element.value = settings[key]
        }
      }
    })

    // Apply theme
    if (settings.theme) {
      applyTheme(settings.theme)
      document.querySelector(`[data-theme="${settings.theme}"]`)?.classList.add("active")
    }

    // Apply animation speed
    if (settings["animation-speed"]) {
      document.documentElement.style.setProperty("--animation-speed", `${6 - settings["animation-speed"]}s`)
    }
  }

  function saveSettings() {
    const settings = {}

    // Save all form inputs
    const inputs = document.querySelectorAll("input, select")
    inputs.forEach((input) => {
      if (input.id) {
        if (input.type === "checkbox") {
          settings[input.id] = input.checked
        } else if (input.type === "range") {
          settings[input.id] = input.value
        } else if (input.tagName === "SELECT") {
          settings[input.id] = input.value
        }
      }
    })

    // Save active theme
    const activeTheme = document.querySelector(".theme-option.active")
    if (activeTheme) {
      settings.theme = activeTheme.getAttribute("data-theme")
    }

    localStorage.setItem("therapyConnectSettings", JSON.stringify(settings))
  }

  function applyTheme(theme) {
    const root = document.documentElement

    switch (theme) {
      case "blue":
        root.style.setProperty("--primary-gradient", "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)")
        root.style.setProperty("--secondary-gradient", "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)")
        break
      case "green":
        root.style.setProperty("--primary-gradient", "linear-gradient(135deg, #10b981 0%, #047857 100%)")
        root.style.setProperty("--secondary-gradient", "linear-gradient(135deg, #34d399 0%, #059669 100%)")
        break
      default:
        root.style.setProperty("--primary-gradient", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
        root.style.setProperty("--secondary-gradient", "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)")
    }
  }

  function resetAllSettings() {
    if (confirm("Are you sure you want to reset all settings to default? This action cannot be undone.")) {
      localStorage.removeItem("therapyConnectSettings")
      location.reload()
    }
  }

  function exportAllData() {
    const allData = {
      sessions: JSON.parse(localStorage.getItem("savedSessions") || "[]"),
      settings: JSON.parse(localStorage.getItem("therapyConnectSettings") || "{}"),
      stats: {
        totalSessions: localStorage.getItem("totalSessions") || "0",
        avgResponseTime: localStorage.getItem("avgResponseTime") || "--",
      },
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `therapy-connect-complete-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    showNotification("Complete data backup exported successfully!", "success")
  }

  function importData(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (confirm("This will overwrite your current data. Are you sure you want to continue?")) {
          // Import sessions
          if (data.sessions) {
            localStorage.setItem("savedSessions", JSON.stringify(data.sessions))
          }

          // Import settings
          if (data.settings) {
            localStorage.setItem("therapyConnectSettings", JSON.stringify(data.settings))
          }

          // Import stats
          if (data.stats) {
            if (data.stats.totalSessions) {
              localStorage.setItem("totalSessions", data.stats.totalSessions)
            }
            if (data.stats.avgResponseTime) {
              localStorage.setItem("avgResponseTime", data.stats.avgResponseTime)
            }
          }

          showNotification("Data imported successfully! Reloading page...", "success")
          setTimeout(() => location.reload(), 2000)
        }
      } catch (error) {
        showNotification("Invalid file format. Please select a valid backup file.", "error")
      }
    }
    reader.readAsText(file)
  }

  function clearAllData() {
    if (
      confirm(
        "Are you sure you want to clear ALL data? This includes sessions, settings, and statistics. This action cannot be undone.",
      )
    ) {
      if (confirm("This is your final warning. All data will be permanently deleted. Continue?")) {
        localStorage.clear()
        showNotification("All data cleared successfully! Reloading page...", "info")
        setTimeout(() => location.reload(), 2000)
      }
    }
  }

  function updateStorageUsage() {
    const sessions = localStorage.getItem("savedSessions") || "[]"
    const settings = localStorage.getItem("therapyConnectSettings") || "{}"
    const stats = (localStorage.getItem("totalSessions") || "") + (localStorage.getItem("avgResponseTime") || "")

    const totalSize = new Blob([sessions, settings, stats]).size
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)

    const storageUsedEl = document.getElementById("storage-used")
    if (storageUsedEl) {
      storageUsedEl.textContent = `${sizeInMB} MB`
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
