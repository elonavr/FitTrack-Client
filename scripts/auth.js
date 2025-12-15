import { apiCall } from "./api.js";

export function redirectToDashboard() {
  window.location.href = "dashboard.html";
}
export function redirectToLogin() {
  window.location.href = "login.html";
}

export function logout() {
  console.log("LOGOUT: Clearing authToken.");
  localStorage.removeItem("authToken");

  redirectToLogin();
}

export async function handleLogin(email, password, displayError) {
  try {
    const response = await apiCall("/users/login", "POST", { email, password });
    const token = response.token;
    const userName = response.user.username;

    if (token && userName) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", userName);
      redirectToDashboard();
    } else {
      displayError("Login failed: Missing authentication token.");
    }
  } catch (error) {
    displayError(error.message);
  }
}

export async function handleSignup(username, email, password, displayError) {
  try {
    const response = await apiCall("/users/signup", "POST", {
      username,
      email,
      password,
    });
    alert("Sign Up Successful! Redirecting to Log In page.");
    redirectToLogin();
  } catch (error) {
    displayError(error.message);
  }
}

export function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("Authentication token not found. Redirecting to login.");
    redirectToLogin();
    return false;
  }
  return true;
}
