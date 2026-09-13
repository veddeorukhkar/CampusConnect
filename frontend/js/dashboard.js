// dashboard.js — powers student-dashboard.html

async function loadStudentDashboard() {
  const greetingEl = document.getElementById("greeting-time");
  if (greetingEl) {
    const hour = new Date().getHours();
    greetingEl.textContent = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  }

  try {
    const [complaints, requests, notices, events] = await Promise.all([
      api.get("/complaints"),
      api.get("/requests"),
      api.get("/notices"),
      api.get("/events"),
    ]);

    const all = [...complaints, ...requests];
    const pending = all.filter((r) => r.status === "Pending").length;
    const inProgress = all.filter((r) => r.status === "In Progress").length;
    const resolved = all.filter((r) => r.status === "Resolved").length;

    renderStatCards([
      { label: "Total Requests", value: all.length, icon: "fa-layer-group", color: "linear-gradient(135deg,#2563eb,#0f2244)" },
      { label: "Pending", value: pending, icon: "fa-hourglass-half", color: "linear-gradient(135deg,#f79009,#f04438)" },
      { label: "In Progress", value: inProgress, icon: "fa-spinner", color: "linear-gradient(135deg,#06b6d4,#2563eb)" },
      { label: "Resolved", value: resolved, icon: "fa-circle-check", color: "linear-gradient(135deg,#12b76a,#0f766e)" },
    ]);

    renderRecentRequestsTable(all);
    renderDashNotices(notices.slice(0, 4));
    renderDashEvents(events.slice(0, 3));
    loadActivityTimeline();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function renderStatCards(cards) {
  const grid = document.getElementById("stats-grid");
  if (!grid) return;
  grid.innerHTML = cards.map((c) => `
    <div class="card stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:${c.color}"><i class="fa-solid ${c.icon}"></i></div>
      </div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join("");
}

function renderRecentRequestsTable(items) {
  const tbody = document.querySelector("#recent-requests-table tbody");
  if (!tbody) return;
  const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No requests yet</h4><p>Submit your first complaint or request to see it here.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map((item) => `
    <tr>
      <td data-label="Subject">${escapeHtml(item.subject || item.category)}</td>
      <td data-label="Type">${item.subject ? "Complaint" : "Service Request"}</td>
      <td data-label="Status"><span class="badge ${statusBadgeClass(item.status)}">${item.status}</span></td>
      <td data-label="Date">${formatDate(item.createdAt)}</td>
    </tr>`).join("");
}

function renderDashNotices(notices) {
  const container = document.getElementById("dash-notices");
  if (!container) return;
  if (notices.length === 0) {
    container.innerHTML = `<div class="state-box"><i class="fa-regular fa-bell"></i><h4>No notices yet</h4></div>`;
    return;
  }
  container.innerHTML = notices.map((n) => `
    <div class="timeline-item">
      <div class="timeline-dot"><i class="fa-solid ${n.pinned ? "fa-thumbtack" : "fa-bullhorn"}"></i></div>
      <div class="timeline-content">
        <div class="t-title">${escapeHtml(n.title)}</div>
        <div class="t-time">${n.category} · ${timeAgo(n.createdAt)}</div>
      </div>
    </div>`).join("");
}

function renderDashEvents(events) {
  const container = document.getElementById("dash-events");
  if (!container) return;
  if (events.length === 0) {
    container.innerHTML = `<div class="state-box"><i class="fa-regular fa-calendar"></i><h4>No upcoming events</h4></div>`;
    return;
  }
  container.innerHTML = events.map((e) => `
    <div class="timeline-item">
      <div class="timeline-dot"><i class="fa-solid fa-calendar-day"></i></div>
      <div class="timeline-content">
        <div class="t-title">${escapeHtml(e.title)}</div>
        <div class="t-time">${e.date} · ${e.location}</div>
      </div>
    </div>`).join("");
}

async function loadActivityTimeline() {
  const container = document.getElementById("activity-timeline");
  if (!container) return;
  // Students see their own recent submissions as a simple activity feed
  try {
    const [complaints, requests] = await Promise.all([api.get("/complaints"), api.get("/requests")]);
    const combined = [...complaints, ...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (combined.length === 0) {
      container.innerHTML = `<div class="state-box"><i class="fa-regular fa-clock"></i><h4>No activity yet</h4></div>`;
      return;
    }

    container.innerHTML = combined.map((item) => `
      <div class="timeline-item">
        <div class="timeline-dot"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <div class="timeline-content">
          <div class="t-title">${item.subject ? "Complaint" : "Request"}: ${escapeHtml(item.subject || item.category)}</div>
          <div class="t-time">${timeAgo(item.createdAt)}</div>
        </div>
      </div>`).join("");
  } catch (error) {
    container.innerHTML = `<div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load activity</h4></div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("stats-grid")) loadStudentDashboard();
});
