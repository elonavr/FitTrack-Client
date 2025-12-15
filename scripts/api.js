const API_BASE_URL = "http://localhost:5000/api";

export async function apiCall(
  endpoint,
  method = "GET",
  body = null,
  requireAuth = false
) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (requireAuth) {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      throw new Error("Authentication required. Please log in.");
    }
  }

  const config = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  };
  try {
    console.log(`[API START] Sending ${method} to: ${url}`);
    console.log("[API START] Config:", config);
    const response = await fetch(url, config);
    console.log(
      `[API RESPONSE] Status: ${response.status}, OK: ${response.ok}, URL: ${response.url}`
    );
    const contentType = response.headers.get("content-type");
    let data = {};

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data.message =
        response.statusText ||
        "Server returned an unexpected non-JSON response.";
    }
    if (!response.ok) {
      const errorMessage =
        data.message ||
        `API Error (${response.status}): ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (
      error.name === "TypeError" ||
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Connection failed. Please ensure the server is running."
      );
    }
    throw error;
  }
}
