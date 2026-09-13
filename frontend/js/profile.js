// profile.js — handles loading and updating the student's profile

async function loadProfile() {
  try {
    const user = await api.get("/auth/me");
    document.getElementById("profile-name").value = user.name;
    document.getElementById("profile-email").value = user.email;
    document.getElementById("profile-department").value = user.department;
    document.getElementById("profile-year").value = user.year;
    document.getElementById("profile-studentid").textContent = `Student ID: ${user.studentId}`;
    document.getElementById("profile-created").value = formatDate(user.createdAt);
  } catch (error) {
    showToast(error.message, "error");
  }
}

function initProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type=submit]");
    const payload = {
      name: document.getElementById("profile-name").value.trim(),
      department: document.getElementById("profile-department").value,
      year: document.getElementById("profile-year").value,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      const data = await api.put("/auth/profile", payload);
      // keep localStorage in sync so the sidebar name updates immediately
      const currentUser = getCurrentUser();
      const updated = { ...currentUser, ...payload };
      localStorage.setItem("cc_user", JSON.stringify(updated));
      showToast("Profile updated successfully!", "success");
      document.querySelectorAll(".js-user-name").forEach((el) => (el.textContent = updated.name));
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Save Changes";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-form")) {
    loadProfile();
    initProfileForm();
  }
});
