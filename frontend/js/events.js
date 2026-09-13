// events.js — handles the student events page

async function loadEvents() {
  const grid = document.getElementById("events-grid");
  try {
    const events = await api.get("/events");
    renderEventsGrid(events);
  } catch (error) {
    if (grid) grid.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load events</h4><p>${error.message}</p></div>`;
  }
}

const eventCategoryColors = {
  Technical: "linear-gradient(135deg,#2563eb,#0f2244)",
  Cultural: "linear-gradient(135deg,#7c3aed,#2563eb)",
  Sports: "linear-gradient(135deg,#12b76a,#0f766e)",
  Workshop: "linear-gradient(135deg,#06b6d4,#2563eb)",
  Career: "linear-gradient(135deg,#f79009,#f04438)",
  Networking: "linear-gradient(135deg,#0f2244,#7c3aed)",
};

function renderEventsGrid(list) {
  const grid = document.getElementById("events-grid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><i class="fa-regular fa-calendar-xmark"></i><h4>No upcoming events</h4></div>`;
    return;
  }

  grid.innerHTML = list.map((e) => `
    <div class="card" style="overflow:hidden;">
      <div style="height:90px; background:${eventCategoryColors[e.category] || eventCategoryColors.Technical}; display:flex; align-items:center; justify-content:center;">
        <i class="fa-solid fa-calendar-days" style="color:#fff; font-size:30px; opacity:0.85;"></i>
      </div>
      <div style="padding:18px;">
        <span class="badge badge-progress mb-8" style="display:inline-block;">${escapeHtml(e.category)}</span>
        <h3 style="font-size:16px; margin-bottom:8px;">${escapeHtml(e.title)}</h3>
        <p class="text-secondary" style="font-size:13.5px; margin-bottom:12px;">${escapeHtml(e.description.slice(0, 80))}${e.description.length > 80 ? "..." : ""}</p>
        <div class="text-muted" style="font-size:12.5px; margin-bottom:4px;"><i class="fa-regular fa-calendar"></i> ${e.date} · ${e.time}</div>
        <div class="text-muted" style="font-size:12.5px; margin-bottom:14px;"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(e.location)}</div>
        <button class="btn btn-primary btn-sm btn-block js-register-btn" data-title="${escapeHtml(e.title)}">Register</button>
      </div>
    </div>`).join("");

  document.querySelectorAll(".js-register-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("register-event-title").textContent = btn.dataset.title;
      document.getElementById("register-event-modal").classList.add("active");
    });
  });
}

function initEventRegisterModal() {
  const modal = document.getElementById("register-event-modal");
  if (!modal) return;
  document.getElementById("close-register-modal").addEventListener("click", () => modal.classList.remove("active"));
  document.getElementById("cancel-register-event").addEventListener("click", () => modal.classList.remove("active"));
  document.getElementById("confirm-register-event").addEventListener("click", () => {
    modal.classList.remove("active");
    showToast("You're registered for this event! 🎉", "success");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("events-grid") && !document.body.dataset.adminPage) {
    loadEvents();
    initEventRegisterModal();
  }
});
