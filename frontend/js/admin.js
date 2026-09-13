// admin.js — powers every admin-*.html page (dashboard, complaints, requests, students, notices, events, analytics)

const statusColors = { Pending: "#f79009", "In Progress": "#2563eb", Resolved: "#12b76a", Rejected: "#f04438" };

// ============================================================
// ADMIN DASHBOARD (admin-dashboard.html)
// ============================================================
async function loadAdminDashboard() {
  try {
    const [stats, analytics, complaints, activity] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/analytics"),
      api.get("/complaints"),
      api.get("/admin/activity"),
    ]);

    renderAdminStats(stats);
    renderCategoryChart(analytics.complaintsByCategory);
    renderStatusDoughnut(analytics.complaintsByStatus);
    renderMonthlyTrend(analytics.complaintsMonthly);
    renderAdminRecentComplaints(complaints.slice(0, 6));
    renderAdminActivityFeed(activity);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function renderAdminStats(stats) {
  const grid = document.getElementById("admin-stats-grid");
  if (!grid) return;
  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: "fa-users", color: "linear-gradient(135deg,#2563eb,#0f2244)" },
    { label: "Total Complaints", value: stats.totalComplaints, icon: "fa-comment-dots", color: "linear-gradient(135deg,#7c3aed,#2563eb)" },
    { label: "Pending Complaints", value: stats.pendingComplaints, icon: "fa-hourglass-half", color: "linear-gradient(135deg,#f79009,#f04438)" },
    { label: "Resolved Complaints", value: stats.resolvedComplaints, icon: "fa-circle-check", color: "linear-gradient(135deg,#12b76a,#0f766e)" },
    { label: "Service Requests", value: stats.totalRequests, icon: "fa-file-circle-check", color: "linear-gradient(135deg,#06b6d4,#2563eb)" },
    { label: "Active Events", value: stats.activeEvents, icon: "fa-calendar-days", color: "linear-gradient(135deg,#0f2244,#7c3aed)" },
  ];
  grid.innerHTML = cards.map((c) => `
    <div class="card stat-card">
      <div class="stat-top"><div class="stat-icon" style="background:${c.color}"><i class="fa-solid ${c.icon}"></i></div></div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>`).join("");
}

function renderCategoryChart(data) {
  const el = document.getElementById("chart-complaints-category");
  if (!el || !window.Chart) return;
  new Chart(el, {
    type: "bar",
    data: {
      labels: data.map((d) => d._id),
      datasets: [{ label: "Complaints", data: data.map((d) => d.count), backgroundColor: "#2563eb", borderRadius: 6 }],
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}

function renderStatusDoughnut(data) {
  const el = document.getElementById("chart-status-doughnut");
  if (!el || !window.Chart) return;
  new Chart(el, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d._id),
      datasets: [{ data: data.map((d) => d.count), backgroundColor: data.map((d) => statusColors[d._id] || "#94a3b8") }],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });
}

function renderMonthlyTrend(data) {
  const el = document.getElementById("chart-monthly-trend");
  if (!el || !window.Chart) return;
  new Chart(el, {
    type: "line",
    data: {
      labels: data.map((d) => d._id),
      datasets: [{ label: "Complaints", data: data.map((d) => d.count), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.12)", tension: 0.35, fill: true }],
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
  });
}

function renderAdminRecentComplaints(list) {
  const container = document.getElementById("admin-recent-complaints");
  if (!container) return;
  if (list.length === 0) { container.innerHTML = `<div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No complaints yet</h4></div>`; return; }
  container.innerHTML = list.map((c) => `
    <div class="timeline-item">
      <div class="timeline-dot"><i class="fa-solid fa-comment-dots"></i></div>
      <div class="timeline-content">
        <div class="t-title">${escapeHtml(c.subject)} <span class="badge ${statusBadgeClass(c.status)}" style="margin-left:6px;">${c.status}</span></div>
        <div class="t-time">${c.userId ? escapeHtml(c.userId.name) : "Unknown"} · ${timeAgo(c.createdAt)}</div>
      </div>
    </div>`).join("");
}

function renderAdminActivityFeed(list) {
  const container = document.getElementById("admin-activity-feed");
  if (!container) return;
  if (list.length === 0) { container.innerHTML = `<div class="state-box"><i class="fa-regular fa-clock"></i><h4>No recent activity</h4></div>`; return; }
  container.innerHTML = list.map((a) => `
    <div class="timeline-item">
      <div class="timeline-dot"><i class="fa-solid fa-clock-rotate-left"></i></div>
      <div class="timeline-content">
        <div class="t-title">${escapeHtml(a.action)}</div>
        <div class="t-time">${a.userId ? escapeHtml(a.userId.name) : "System"} · ${timeAgo(a.createdAt)}</div>
      </div>
    </div>`).join("");
}

// ============================================================
// ADMIN COMPLAINTS (admin-complaints.html)
// ============================================================
let adminAllComplaints = [];

async function loadAdminComplaints() {
  const tbody = document.getElementById("admin-complaints-tbody");
  try {
    adminAllComplaints = await api.get("/complaints");
    renderAdminComplaintsTable(adminAllComplaints);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load complaints</h4></div></td></tr>`;
  }
}

function renderAdminComplaintsTable(list) {
  const tbody = document.getElementById("admin-complaints-tbody");
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No complaints found</h4></div></td></tr>`; return; }

  tbody.innerHTML = list.map((c) => `
    <tr>
      <td data-label="Student">${c.userId ? escapeHtml(c.userId.name) : "Unknown"}<br><span class="text-muted" style="font-size:12px;">${c.userId ? escapeHtml(c.userId.studentId) : ""}</span></td>
      <td data-label="Subject">${escapeHtml(c.subject)}</td>
      <td data-label="Category">${escapeHtml(c.category)}</td>
      <td data-label="Priority"><span class="badge ${priorityBadgeClass(c.priority)}">${c.priority}</span></td>
      <td data-label="Status"><span class="badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td data-label="Action"><button class="btn btn-secondary btn-sm js-manage-complaint" data-id="${c._id}">Manage</button></td>
    </tr>`).join("");

  document.querySelectorAll(".js-manage-complaint").forEach((btn) => {
    btn.addEventListener("click", () => openComplaintManageModal(btn.dataset.id));
  });
}

function applyAdminComplaintFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const status = document.getElementById("status-filter")?.value || "";
  const category = document.getElementById("category-filter")?.value || "";
  const priority = document.getElementById("priority-filter")?.value || "";

  const filtered = adminAllComplaints.filter((c) => {
    const matchesSearch = c.subject.toLowerCase().includes(search) || (c.userId && c.userId.name.toLowerCase().includes(search));
    return matchesSearch && (!status || c.status === status) && (!category || c.category === category) && (!priority || c.priority === priority);
  });
  renderAdminComplaintsTable(filtered);
}

function openComplaintManageModal(id) {
  const complaint = adminAllComplaints.find((c) => c._id === id);
  if (!complaint) return;
  const modal = document.getElementById("manage-modal");
  document.getElementById("manage-title").textContent = complaint.subject;
  document.getElementById("manage-description").textContent = complaint.description;
  document.getElementById("manage-student").textContent = complaint.userId ? `${complaint.userId.name} (${complaint.userId.studentId})` : "Unknown";
  document.getElementById("manage-status").value = complaint.status;
  document.getElementById("manage-response").value = complaint.adminResponse || "";
  modal.dataset.currentId = id;
  modal.dataset.type = "complaint";
  modal.classList.add("active");
}

// ============================================================
// ADMIN SERVICE REQUESTS (admin-requests.html)
// ============================================================
let adminAllRequests = [];

async function loadAdminRequests() {
  const tbody = document.getElementById("admin-requests-tbody");
  try {
    adminAllRequests = await api.get("/requests");
    renderAdminRequestsTable(adminAllRequests);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load requests</h4></div></td></tr>`;
  }
}

function renderAdminRequestsTable(list) {
  const tbody = document.getElementById("admin-requests-tbody");
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No requests found</h4></div></td></tr>`; return; }

  tbody.innerHTML = list.map((r) => `
    <tr>
      <td data-label="Student">${r.userId ? escapeHtml(r.userId.name) : "Unknown"}</td>
      <td data-label="Category">${escapeHtml(r.category)}</td>
      <td data-label="Priority"><span class="badge ${priorityBadgeClass(r.priority)}">${r.priority}</span></td>
      <td data-label="Status"><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
      <td data-label="Action"><button class="btn btn-secondary btn-sm js-manage-request" data-id="${r._id}">Manage</button></td>
    </tr>`).join("");

  document.querySelectorAll(".js-manage-request").forEach((btn) => {
    btn.addEventListener("click", () => openRequestManageModal(btn.dataset.id));
  });
}

function applyAdminRequestFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const status = document.getElementById("status-filter")?.value || "";
  const filtered = adminAllRequests.filter((r) => {
    const matchesSearch = r.category.toLowerCase().includes(search) || (r.userId && r.userId.name.toLowerCase().includes(search));
    return matchesSearch && (!status || r.status === status);
  });
  renderAdminRequestsTable(filtered);
}

function openRequestManageModal(id) {
  const request = adminAllRequests.find((r) => r._id === id);
  if (!request) return;
  const modal = document.getElementById("manage-modal");
  document.getElementById("manage-title").textContent = request.category;
  document.getElementById("manage-description").textContent = request.description;
  document.getElementById("manage-student").textContent = request.userId ? `${request.userId.name} (${request.userId.studentId})` : "Unknown";
  document.getElementById("manage-status").value = request.status;
  document.getElementById("manage-response").value = request.adminResponse || "";
  modal.dataset.currentId = id;
  modal.dataset.type = "request";
  modal.classList.add("active");
}

// ---------- Shared Manage Modal submit handler (complaints + requests) ----------
function initManageModal() {
  const modal = document.getElementById("manage-modal");
  if (!modal) return;
  document.getElementById("close-manage-modal").addEventListener("click", () => modal.classList.remove("active"));
  document.getElementById("cancel-manage").addEventListener("click", () => modal.classList.remove("active"));

  document.getElementById("save-manage").addEventListener("click", async () => {
    const id = modal.dataset.currentId;
    const type = modal.dataset.type;
    const status = document.getElementById("manage-status").value;
    const adminResponse = document.getElementById("manage-response").value.trim();
    const endpoint = type === "complaint" ? `/complaints/${id}` : `/requests/${id}`;

    try {
      await api.put(endpoint, { status, adminResponse });
      showToast("Updated successfully!", "success");
      modal.classList.remove("active");
      if (type === "complaint") loadAdminComplaints(); else loadAdminRequests();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// ============================================================
// ADMIN STUDENTS (admin-students.html)
// ============================================================
let adminAllStudents = [];

async function loadAdminStudents() {
  const tbody = document.getElementById("admin-students-tbody");
  try {
    adminAllStudents = await api.get("/admin/students");
    renderAdminStudentsTable(adminAllStudents);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load students</h4></div></td></tr>`;
  }
}

function renderAdminStudentsTable(list) {
  const tbody = document.getElementById("admin-students-tbody");
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-regular fa-user"></i><h4>No students found</h4></div></td></tr>`; return; }

  tbody.innerHTML = list.map((s) => `
    <tr>
      <td data-label="Name">${escapeHtml(s.name)}</td>
      <td data-label="Student ID">${escapeHtml(s.studentId)}</td>
      <td data-label="Email">${escapeHtml(s.email)}</td>
      <td data-label="Department">${escapeHtml(s.department)}</td>
      <td data-label="Status"><span class="badge ${s.isActive ? "badge-resolved" : "badge-rejected"}">${s.isActive ? "Active" : "Inactive"}</span></td>
      <td data-label="Action"><button class="btn btn-secondary btn-sm js-toggle-student" data-id="${s._id}">${s.isActive ? "Deactivate" : "Activate"}</button></td>
    </tr>`).join("");

  document.querySelectorAll(".js-toggle-student").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = await confirmModal("Change Student Status", "Are you sure you want to change this student's account status?");
      if (!confirmed) return;
      try {
        await api.put(`/admin/students/${btn.dataset.id}/status`, {});
        showToast("Student status updated!", "success");
        loadAdminStudents();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

function applyAdminStudentFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const department = document.getElementById("department-filter")?.value || "";
  const filtered = adminAllStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search) || s.studentId.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
    return matchesSearch && (!department || s.department === department);
  });
  renderAdminStudentsTable(filtered);
}

// ============================================================
// ADMIN NOTICES (admin-notices.html)
// ============================================================
let adminAllNotices = [];

async function loadAdminNotices() {
  const tbody = document.getElementById("admin-notices-tbody");
  try {
    adminAllNotices = await api.get("/notices");
    renderAdminNoticesTable(adminAllNotices);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load notices</h4></div></td></tr>`;
  }
}

function renderAdminNoticesTable(list) {
  const tbody = document.getElementById("admin-notices-tbody");
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-regular fa-bell"></i><h4>No notices yet</h4></div></td></tr>`; return; }

  tbody.innerHTML = list.map((n) => `
    <tr>
      <td data-label="Title">${escapeHtml(n.title)} ${n.pinned ? '<i class="fa-solid fa-thumbtack" style="color:var(--warning);"></i>' : ""}</td>
      <td data-label="Category">${escapeHtml(n.category)}</td>
      <td data-label="Priority"><span class="badge ${priorityBadgeClass(n.priority)}">${n.priority}</span></td>
      <td data-label="Date">${formatDate(n.createdAt)}</td>
      <td data-label="Actions">
        <button class="btn btn-secondary btn-sm js-edit-notice" data-id="${n._id}">Edit</button>
        <button class="btn btn-danger btn-sm js-delete-notice" data-id="${n._id}">Delete</button>
      </td>
    </tr>`).join("");

  document.querySelectorAll(".js-edit-notice").forEach((btn) => btn.addEventListener("click", () => openNoticeModal(btn.dataset.id)));
  document.querySelectorAll(".js-delete-notice").forEach((btn) => btn.addEventListener("click", async () => {
    const confirmed = await confirmModal("Delete Notice", "This notice will be permanently deleted. Continue?");
    if (!confirmed) return;
    try {
      await api.delete(`/notices/${btn.dataset.id}`);
      showToast("Notice deleted successfully!", "success");
      loadAdminNotices();
    } catch (error) { showToast(error.message, "error"); }
  }));
}

function openNoticeModal(id = null) {
  const modal = document.getElementById("notice-modal");
  const form = document.getElementById("notice-form");
  form.reset();
  if (id) {
    const notice = adminAllNotices.find((n) => n._id === id);
    document.getElementById("notice-modal-title").textContent = "Edit Notice";
    document.getElementById("notice-title-input").value = notice.title;
    document.getElementById("notice-description-input").value = notice.description;
    document.getElementById("notice-category-input").value = notice.category;
    document.getElementById("notice-priority-input").value = notice.priority;
    document.getElementById("notice-pinned-input").checked = notice.pinned;
        document.getElementById("notice-attachment-input").value = notice.attachmentUrl || "";
    modal.dataset.editId = id;
  } else {
    document.getElementById("notice-modal-title").textContent = "Create Notice";
    modal.dataset.editId = "";
  }
  modal.classList.add("active");
}

function initNoticeForm() {
  const form = document.getElementById("notice-form");
  if (!form) return;
  document.getElementById("open-notice-modal")?.addEventListener("click", () => openNoticeModal());
  document.getElementById("close-notice-modal").addEventListener("click", () => document.getElementById("notice-modal").classList.remove("active"));
  document.getElementById("cancel-notice").addEventListener("click", () => document.getElementById("notice-modal").classList.remove("active"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const modal = document.getElementById("notice-modal");
    const editId = modal.dataset.editId;
    const payload = {
      title: document.getElementById("notice-title-input").value.trim(),
      description: document.getElementById("notice-description-input").value.trim(),
      category: document.getElementById("notice-category-input").value,
      priority: document.getElementById("notice-priority-input").value,
      pinned: document.getElementById("notice-pinned-input").checked,
      attachmentUrl: document.getElementById("notice-attachment-input").value.trim(),
    };
    try {
      if (editId) { await api.put(`/notices/${editId}`, payload); showToast("Notice updated!", "success"); }
      else { await api.post("/notices", payload); showToast("Notice published!", "success"); }
      modal.classList.remove("active");
      loadAdminNotices();
    } catch (error) { showToast(error.message, "error"); }
  });
}

// ============================================================
// ADMIN EVENTS (admin-events.html)
// ============================================================
let adminAllEvents = [];

async function loadAdminEvents() {
  const tbody = document.getElementById("admin-events-tbody");
  try {
    adminAllEvents = await api.get("/events");
    renderAdminEventsTable(adminAllEvents);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load events</h4></div></td></tr>`;
  }
}

function renderAdminEventsTable(list) {
  const tbody = document.getElementById("admin-events-tbody");
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="6"><div class="state-box"><i class="fa-regular fa-calendar"></i><h4>No events yet</h4></div></td></tr>`; return; }

  tbody.innerHTML = list.map((e) => `
    <tr>
      <td data-label="Title">${escapeHtml(e.title)}</td>
      <td data-label="Category">${escapeHtml(e.category)}</td>
      <td data-label="Date">${e.date}</td>
      <td data-label="Time">${e.time}</td>
      <td data-label="Location">${escapeHtml(e.location)}</td>
           <td data-label="Actions">
        <button class="btn btn-secondary btn-sm js-view-registrations" data-id="${e._id}" data-title="${escapeHtml(e.title)}">Registrations</button>
        <button class="btn btn-secondary btn-sm js-edit-event" data-id="${e._id}">Edit</button>
        <button class="btn btn-danger btn-sm js-delete-event" data-id="${e._id}">Delete</button>
      </td>
    </tr>`).join("");

    document.querySelectorAll(".js-view-registrations").forEach((btn) => {
    btn.addEventListener("click", () => openRegistrationsModal(btn.dataset.id, btn.dataset.title));
  });
  document.querySelectorAll(".js-delete-event").forEach((btn) => btn.addEventListener("click", async () => {
    const confirmed = await confirmModal("Delete Event", "This event will be permanently deleted. Continue?");
    if (!confirmed) return;
    try {
      await api.delete(`/events/${btn.dataset.id}`);
      showToast("Event deleted successfully!", "success");
      loadAdminEvents();
    } catch (error) { showToast(error.message, "error"); }
  }));
}

function openEventModal(id = null) {
  const modal = document.getElementById("event-modal");
  const form = document.getElementById("event-form");
  form.reset();
  if (id) {
    const event = adminAllEvents.find((e) => e._id === id);
    document.getElementById("event-modal-title").textContent = "Edit Event";
    document.getElementById("event-title-input").value = event.title;
    document.getElementById("event-description-input").value = event.description;
    document.getElementById("event-date-input").value = event.date;
    document.getElementById("event-time-input").value = event.time;
    document.getElementById("event-location-input").value = event.location;
    document.getElementById("event-category-input").value = event.category;
    modal.dataset.editId = id;
  } else {
    document.getElementById("event-modal-title").textContent = "Create Event";
    modal.dataset.editId = "";
  }
  modal.classList.add("active");
}

function initEventForm() {
  const form = document.getElementById("event-form");
  if (!form) return;
  document.getElementById("open-event-modal")?.addEventListener("click", () => openEventModal());
  document.getElementById("close-event-modal").addEventListener("click", () => document.getElementById("event-modal").classList.remove("active"));
  document.getElementById("cancel-event").addEventListener("click", () => document.getElementById("event-modal").classList.remove("active"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const modal = document.getElementById("event-modal");
    const editId = modal.dataset.editId;
    const payload = {
      title: document.getElementById("event-title-input").value.trim(),
      description: document.getElementById("event-description-input").value.trim(),
      date: document.getElementById("event-date-input").value,
      time: document.getElementById("event-time-input").value,
      location: document.getElementById("event-location-input").value.trim(),
      category: document.getElementById("event-category-input").value,
    };
    try {
      if (editId) { await api.put(`/events/${editId}`, payload); showToast("Event updated!", "success"); }
      else { await api.post("/events", payload); showToast("Event created!", "success"); }
      modal.classList.remove("active");
      loadAdminEvents();
    } catch (error) { showToast(error.message, "error"); }
  });
}

// ============================================================
// ADMIN ANALYTICS (admin-analytics.html)
// ============================================================
async function loadAdminAnalytics() {
  try {
    const analytics = await api.get("/admin/analytics");
    renderAnalyticsCategoryChart(analytics.complaintsByCategory);
    renderAnalyticsStatusChart(analytics.complaintsByStatus);
    renderAnalyticsRequestChart(analytics.requestsByCategory);
    renderAnalyticsDeptChart(analytics.studentsByDepartment);
    renderAnalyticsTrendChart(analytics.complaintsMonthly);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function renderAnalyticsCategoryChart(data) {
  const el = document.getElementById("analytics-category-chart");
  if (!el) return;
  new Chart(el, { type: "bar", data: { labels: data.map((d) => d._id), datasets: [{ label: "Complaints", data: data.map((d) => d.count), backgroundColor: "#2563eb", borderRadius: 6 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
}
function renderAnalyticsStatusChart(data) {
  const el = document.getElementById("analytics-status-chart");
  if (!el) return;
  new Chart(el, { type: "doughnut", data: { labels: data.map((d) => d._id), datasets: [{ data: data.map((d) => d.count), backgroundColor: data.map((d) => statusColors[d._id] || "#94a3b8") }] }, options: { plugins: { legend: { position: "bottom" } } } });
}
function renderAnalyticsRequestChart(data) {
  const el = document.getElementById("analytics-request-chart");
  if (!el) return;
  new Chart(el, { type: "bar", data: { labels: data.map((d) => d._id), datasets: [{ label: "Requests", data: data.map((d) => d.count), backgroundColor: "#06b6d4", borderRadius: 6 }] }, options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } } });
}
function renderAnalyticsDeptChart(data) {
  const el = document.getElementById("analytics-dept-chart");
  if (!el) return;
  new Chart(el, { type: "pie", data: { labels: data.map((d) => d._id), datasets: [{ data: data.map((d) => d.count), backgroundColor: ["#2563eb","#06b6d4","#7c3aed","#12b76a","#f79009"] }] }, options: { plugins: { legend: { position: "bottom" } } } });
}
function renderAnalyticsTrendChart(data) {
  const el = document.getElementById("analytics-trend-chart");
  if (!el) return;
  new Chart(el, { type: "line", data: { labels: data.map((d) => d._id), datasets: [{ label: "Complaints", data: data.map((d) => d.count), borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.12)", tension: 0.35, fill: true }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
}

async function openRegistrationsModal(eventId, eventTitle) {
  const modal = document.getElementById("registrations-modal");
  document.getElementById("registrations-modal-title").textContent = `Registrations — ${eventTitle}`;
  const listEl = document.getElementById("registrations-list");
  listEl.innerHTML = '<div class="spinner"></div>';
  modal.classList.add("active");

  try {
    const registrations = await api.get(`/events/${eventId}/registrations`);
    if (registrations.length === 0) {
      listEl.innerHTML = `<div class="state-box"><i class="fa-regular fa-user"></i><h4>No registrations yet</h4></div>`;
      return;
    }
    listEl.innerHTML = registrations.map((r) => `
      <div class="timeline-item">
        <div class="timeline-dot"><i class="fa-solid fa-user"></i></div>
        <div class="timeline-content">
          <div class="t-title">${r.userId ? escapeHtml(r.userId.name) : "Unknown"} (${r.userId ? escapeHtml(r.userId.studentId) : "-"})</div>
          <div class="t-time">📞 ${escapeHtml(r.phone)} · Guests: ${r.guests} · ${timeAgo(r.createdAt)}</div>
        </div>
      </div>`).join("");
  } catch (error) {
    listEl.innerHTML = `<div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load registrations</h4></div>`;
  }
}

function initRegistrationsModal() {
  const modal = document.getElementById("registrations-modal");
  if (!modal) return;
  document.getElementById("close-registrations-modal").addEventListener("click", () => modal.classList.remove("active"));
}

// ============================================================
// PAGE INIT — decides which loaders to run based on what's on the page
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initManageModal();
  initNoticeForm();
  initEventForm();
  initRegistrationsModal();

  if (document.getElementById("admin-complaints-tbody")) {
    loadAdminComplaints();
    document.getElementById("search-input")?.addEventListener("input", applyAdminComplaintFilters);
    document.getElementById("status-filter")?.addEventListener("change", applyAdminComplaintFilters);
    document.getElementById("category-filter")?.addEventListener("change", applyAdminComplaintFilters);
    document.getElementById("priority-filter")?.addEventListener("change", applyAdminComplaintFilters);
  }
  if (document.getElementById("admin-requests-tbody")) {
    loadAdminRequests();
    document.getElementById("search-input")?.addEventListener("input", applyAdminRequestFilters);
    document.getElementById("status-filter")?.addEventListener("change", applyAdminRequestFilters);
  }
  if (document.getElementById("admin-students-tbody")) {
    loadAdminStudents();
    document.getElementById("search-input")?.addEventListener("input", applyAdminStudentFilters);
    document.getElementById("department-filter")?.addEventListener("change", applyAdminStudentFilters);
  }
  if (document.getElementById("admin-notices-tbody")) loadAdminNotices();
  if (document.getElementById("admin-events-tbody")) loadAdminEvents();
  if (document.getElementById("analytics-category-chart")) loadAdminAnalytics();
});
