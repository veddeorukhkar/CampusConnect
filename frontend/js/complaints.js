// complaints.js — handles the student complaints page (and is reused/extended by admin-complaints.js)

let allComplaints = [];

async function loadComplaints() {
  const tbody = document.getElementById("complaints-tbody");
  try {
    allComplaints = await api.get("/complaints");
    renderComplaintsTable(allComplaints);
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-solid fa-triangle-exclamation"></i><h4>Could not load complaints</h4><p>${error.message}</p></div></td></tr>`;
  }
}

function renderComplaintsTable(list) {
  const tbody = document.getElementById("complaints-tbody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state-box"><i class="fa-regular fa-folder-open"></i><h4>No complaints found</h4><p>Try adjusting your filters or submit a new complaint.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((c) => `
    <tr>
      <td data-label="Subject"><strong>${escapeHtml(c.subject)}</strong><br><span class="text-muted" style="font-size:12px;">${escapeHtml(c.description.slice(0, 50))}${c.description.length > 50 ? "..." : ""}</span></td>
      <td data-label="Category">${escapeHtml(c.category)}</td>
      <td data-label="Priority"><span class="badge ${priorityBadgeClass(c.priority)}">${c.priority}</span></td>
      <td data-label="Status"><span class="badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td data-label="Date">${formatDate(c.createdAt)}</td>
    </tr>`).join("");
}

function applyComplaintFilters() {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const status = document.getElementById("status-filter")?.value || "";
  const category = document.getElementById("category-filter")?.value || "";

  const filtered = allComplaints.filter((c) => {
    const matchesSearch = c.subject.toLowerCase().includes(search) || c.description.toLowerCase().includes(search);
    const matchesStatus = !status || c.status === status;
    const matchesCategory = !category || c.category === category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  renderComplaintsTable(filtered);
}

function initComplaintModal() {
  const modal = document.getElementById("complaint-modal");
  const openBtn = document.getElementById("open-complaint-modal");
  const closeBtn = document.getElementById("close-complaint-modal");
  const cancelBtn = document.getElementById("cancel-complaint");
  const form = document.getElementById("complaint-form");
  if (!modal || !form) return;

  openBtn.addEventListener("click", () => modal.classList.add("active"));
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    const payload = {
      category: document.getElementById("complaint-category").value,
      subject: document.getElementById("complaint-subject").value.trim(),
      description: document.getElementById("complaint-description").value.trim(),
      priority: document.getElementById("complaint-priority").value,
      location: document.getElementById("complaint-location").value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
      await api.post("/complaints", payload);
      showToast("Complaint submitted successfully!", "success");
      modal.classList.remove("active");
      form.reset();
      loadComplaints();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Submit Complaint";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("complaints-tbody") && !document.body.dataset.adminPage) {
    loadComplaints();
    initComplaintModal();
    document.getElementById("search-input")?.addEventListener("input", applyComplaintFilters);
    document.getElementById("status-filter")?.addEventListener("change", applyComplaintFilters);
    document.getElementById("category-filter")?.addEventListener("change", applyComplaintFilters);
  }
});
