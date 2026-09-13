// notices.js — handles the student notices page

let allNotices = [];

async function loadNotices() {
  const grid = document.getElementById("notices-grid");
  try {
    allNotices = await api.get("/notices");
    renderNoticesGrid(allNotices);
  } catch (error) {
    if (grid) grid.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load notices</h4><p>${error.message}</p></div>`;
  }
}

function renderNoticesGrid(list) {
  const grid = document.getElementById("notices-grid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div class="state-box" style="grid-column:1/-1;"><i class="fa-regular fa-bell-slash"></i><h4>No notices found</h4></div>`;
    return;
  }

  grid.innerHTML = list.map((n) => `
        <div class="card js-notice-card" data-id="${n._id}" style="padding:20px; cursor:pointer;">
      <div class="flex-between mb-8">
        <span class="badge badge-progress">${escapeHtml(n.category)}</span>
        ${n.pinned ? '<i class="fa-solid fa-thumbtack" style="color:var(--warning);" title="Pinned"></i>' : ""}
      </div>
      <h3 style="font-size:16px; margin-bottom:8px;">${escapeHtml(n.title)}</h3>
      <p class="text-secondary" style="font-size:14px; margin-bottom:12px;">${escapeHtml(n.description)}</p>
      <div class="text-muted" style="font-size:12.5px;"><i class="fa-regular fa-clock"></i> ${formatDate(n.createdAt)}</div>
    </div>`).join("");

      document.querySelectorAll(".js-notice-card").forEach((card) => {
    card.addEventListener("click", () => openNoticeViewModal(card.dataset.id));
  });
}

function applyNoticeFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const category = document.getElementById("category-filter")?.value || "";

  const filtered = allNotices.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search) || n.description.toLowerCase().includes(search);
    const matchesCategory = !category || n.category === category;
    return matchesSearch && matchesCategory;
  });

  renderNoticesGrid(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("notices-grid") && !document.body.dataset.adminPage) {
    loadNotices();
    document.getElementById("search-input")?.addEventListener("input", applyNoticeFilters);
    document.getElementById("category-filter")?.addEventListener("change", applyNoticeFilters);
  }
});
