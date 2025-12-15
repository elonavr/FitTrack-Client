import { handleLogin, redirectToDashboard } from "./auth.js";

function displayError(msg) {
  alert(`Login Error: ${msg}`);
  console.error("Login Error:", msg);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("toggle-password");

  if (localStorage.getItem("authToken")) {
    redirectToDashboard();
    return;
  }

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      togglePasswordBtn.textContent = type === "password" ? "👁️" : "🔒";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        displayError("You must fill all fields.");
        return;
      }

      handleLogin(email, password, displayError);
    });
  }
});
