// events.js — handles the student events page

let allEventsList = [];
let myRegisteredIds = [];

async function loadEvents() {
  const grid = document.getElementById("events-grid");
  try {
    const [events, registeredIds] = await Promise.all([
      api.get("/events"),
      api.get("/events/my-registrations"),
    ]);
    allEventsList = events;
    myRegisteredIds = registeredIds;
    renderEventsGrid(allEventsList);
    renderRegisteredEvents();
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
        ${myRegisteredIds.includes(e._id)
          ? `<button class="btn btn-secondary btn-sm btn-block" disabled><i class="fa-solid fa-check"></i> Registered</button>`
          : `<button class="btn btn-primary btn-sm btn-block js-register-btn" data-title="${escapeHtml(e.title)}" data-id="${e._id}">Register</button>`}
      </div>
    </div>`).join("");

  document.querySelectorAll(".js-register-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("register-event-title").textContent = btn.dataset.title;
      document.getElementById("register-event-modal").dataset.eventId = btn.dataset.id;
      document.getElementById("register-event-modal").classList.add("active");
    });
  });
}

function renderRegisteredEvents() {
  const wrap = document.getElementById("registered-events-wrap");
  const grid = document.getElementById("registered-events-grid");
  if (!wrap || !grid) return;

  const registeredEvents = allEventsList.filter((e) => myRegisteredIds.includes(e._id));

  if (registeredEvents.length === 0) {
    wrap.classList.add("hidden");
    return;
  }

  wrap.classList.remove("hidden");
  grid.innerHTML = registeredEvents.map((e) => `
    <div class="card" style="overflow:hidden; border-color:var(--success);">
      <div style="height:70px; background:${eventCategoryColors[e.category] || eventCategoryColors.Technical}; display:flex; align-items:center; justify-content:center;">
        <i class="fa-solid fa-circle-check" style="color:#fff; font-size:24px;"></i>
      </div>
      <div style="padding:16px;">
        <h3 style="font-size:15px; margin-bottom:6px;">${escapeHtml(e.title)}</h3>
        <div class="text-muted" style="font-size:12.5px;"><i class="fa-regular fa-calendar"></i> ${e.date} · ${e.time}</div>
      </div>
    </div>`).join("");
}

function initEventRegisterModal() {
  const modal = document.getElementById("register-event-modal");
  const form = document.getElementById("event-register-form");
  if (!modal || !form) return;

  document.getElementById("close-register-modal").addEventListener("click", () => modal.classList.remove("active"));
  document.getElementById("cancel-register-event").addEventListener("click", () => modal.classList.remove("active"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const eventId = modal.dataset.eventId;
    const submitBtn = form.querySelector("button[type=submit]");
    const payload = {
      phone: document.getElementById("register-phone").value.trim(),
      guests: Number(document.getElementById("register-guests").value) || 1,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

    try {
      await api.post(`/events/${eventId}/register`, payload);
      modal.classList.remove("active");
      form.reset();
      showToast("You're registered for this event! 🎉", "success");
      myRegisteredIds.push(eventId);
      renderRegisteredEvents();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Confirm Registration";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("events-grid") && !document.body.dataset.adminPage) {
    loadEvents();
    initEventRegisterModal();
  }
});