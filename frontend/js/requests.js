// requests.js — handles the student service-requests page

let allRequests = [];

async function loadRequests() {
  const tbody = document.getElementById("requests-tbody");
  try {
    allRequests = await api.get("/requests");
    renderRequestsTable(allRequests);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load requests</h4><p>${error.message}</p></div></td></tr>`;
  }
}

function renderRequestsTable(list) {
  const tbody = document.getElementById("requests-tbody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No service requests found</h4></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((r) => `
    <tr>
      <td data-label="Category">${escapeHtml(r.category)}</td>
      <td data-label="Description">${escapeHtml(r.description.slice(0, 60))}${r.description.length > 60 ? "..." : ""}</td>
      <td data-label="Priority"><span class="badge ${priorityBadgeClass(r.priority)}">${r.priority}</span></td>
      <td data-label="Status"><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
      <td data-label="Date">${formatDate(r.createdAt)}</td>
    </tr>`).join("");
}

function applyRequestFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const status = document.getElementById("status-filter")?.value || "";

  const filtered = allRequests.filter((r) => {
    const matchesSearch = r.category.toLowerCase().includes(search) || r.description.toLowerCase().includes(search);
    const matchesStatus = !status || r.status === status;
    return matchesSearch && matchesStatus;
  });

  renderRequestsTable(filtered);
}

function initRequestModal() {
  const modal = document.getElementById("request-modal");
  const openBtn = document.getElementById("open-request-modal");
  const closeBtn = document.getElementById("close-request-modal");
  const cancelBtn = document.getElementById("cancel-request");
  const form = document.getElementById("request-form");
  if (!modal || !form) return;

  openBtn.addEventListener("click", () => modal.classList.add("active"));
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    const payload = {
      category: document.getElementById("request-category").value,
      description: document.getElementById("request-description").value.trim(),
      priority: document.getElementById("request-priority").value,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
      await api.post("/requests", payload);
      showToast("Service request submitted successfully!", "success");
      modal.classList.remove("active");
      form.reset();
      loadRequests();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Request";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("requests-tbody") && !document.body.dataset.adminPage) {
    loadRequests();
    initRequestModal();
    document.getElementById("search-input")?.addEventListener("input", applyRequestFilters);
    document.getElementById("status-filter")?.addEventListener("change", applyRequestFilters);
  }
});
