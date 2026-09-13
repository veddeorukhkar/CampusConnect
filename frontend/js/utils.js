// utils.js — small reusable helper functions used across every page.

// ---------- Toast Notifications ----------
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", warning: "fa-triangle-exclamation", info: "fa-circle-info" };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ---------- Confirmation Modal ----------
// Returns a Promise<boolean> - true if the user confirmed, false if cancelled.
function confirmModal(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>${title}</h3>
          <span class="modal-close"><i class="fa-solid fa-xmark"></i></span>
        </div>
        <p class="text-secondary">${message}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn-danger" id="modal-confirm-btn">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const cleanup = (result) => { overlay.remove(); resolve(result); };
    overlay.querySelector(".modal-close").onclick = () => cleanup(false);
    overlay.querySelector("#modal-cancel-btn").onclick = () => cleanup(false);
    overlay.querySelector("#modal-confirm-btn").onclick = () => cleanup(true);
    overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
  });
}

// ---------- Formatting Helpers ----------
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, secs] of intervals) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function statusBadgeClass(status) {
  return { Pending: "badge-pending", "In Progress": "badge-progress", Resolved: "badge-resolved", Rejected: "badge-rejected" }[status] || "badge-pending";
}

function priorityBadgeClass(priority) {
  return { Low: "badge-low", Medium: "badge-medium", High: "badge-high" }[priority] || "badge-medium";
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

// ---------- Theme (Dark Mode) ----------
function initTheme() {
  const saved = localStorage.getItem("cc_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("cc_theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

// ---------- Mobile Sidebar Toggle ----------
function initSidebarToggle() {
  const hamburger = document.getElementById("hamburger-btn");
  const sidebar = document.getElementById("sidebar");
  if (!hamburger || !sidebar) return;

  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  document.body.appendChild(backdrop);

  hamburger.addEventListener("click", () => {
    sidebar.classList.add("open");
    backdrop.classList.add("active");
  });
  backdrop.addEventListener("click", () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("active");
  });
}

// Run theme init immediately on every page
initTheme();
