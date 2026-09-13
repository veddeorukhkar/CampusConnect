// api.js — every single request to our backend goes through this file.
// Keeping it in one place means we only have to write "fetch" logic once.

const API_BASE = "/api"; // because Express serves the frontend, this works on any host/port

// Reads the saved login token from localStorage
function getToken() {
  return localStorage.getItem("cc_token");
}

// Reads the saved logged-in user object from localStorage
function getCurrentUser() {
  const raw = localStorage.getItem("cc_user");
  return raw ? JSON.parse(raw) : null;
}

// Main request helper used by every API call in the app
async function apiRequest(endpoint, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(API_BASE + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      // If the token is invalid/expired, send the user back to login
      if (response.status === 401) {
        localStorage.removeItem("cc_token");
        localStorage.removeItem("cc_user");
        if (!window.location.pathname.includes("login.html") && !window.location.pathname.endsWith("/")) {
          window.location.href = "login.html";
        }
      }
      throw new Error(data.message || "Something went wrong. Please try again.");
    }

    return data;
  } catch (error) {
    // Network errors (server down, no internet, etc.) land here too
    throw new Error(error.message || "Unable to reach the server. Please check your connection.");
  }
}

// Shortcut helpers
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) => apiRequest(endpoint, { method: "POST", body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: "PUT", body }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};
