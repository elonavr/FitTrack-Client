// C:\Users\elona\Desktop\FitTrack\FitTrack-Client\scripts\dashboard.js

import { logout, checkAuth } from "./auth.js";
import { apiCall } from "./api.js";

const goalsListContainer = document.getElementById("goals-list");

// --- 1. יצירת רכיב HTML ליעד יחיד (מתוקן לאינטראקטיביות) ---
function createGoalItemHTML(goal) {
  const name = goal.goalName;
  const calories = goal.calorieGoal;
  const protein = goal.proteinGoal;
  const carbs = goal.carbGoal;
  const fat = goal.fatGoal;

  // קריטי: יש להניח שיש לנו את סטטוס COMPLETED בעתיד, אבל כרגע נטפל ב-ACTIVE מול שאר הסטטוסים (PAUSED/DRAFT)
  const isCurrentlyActive = goal.status === "ACTIVE";
  const goalStatus = goal.status; // 'ACTIVE', 'PAUSED', 'DRAFT', וכו'

  let statusDisplayHTML = "";
  let actionButtonHTML = "";
  let goalClass = "";

  // --- לוגיקה לקביעת מלל, צבע ומחלקות ---
  if (isCurrentlyActive) {
    // מצב: ACTIVE (היעד הנוכחי)
    goalClass = " active-goal";
    // הצגת הסטטוס: ירוק
    statusDisplayHTML = `<span class="goal-status status-active">${goalStatus}</span>`;
    // כפתור: אדום, כדי להשהות
    actionButtonHTML = `
            <button class="small-button activate-goal-btn status-btn status-paused-btn" 
                    data-goal-id="${goal.id}" 
                    data-is-active="true">
                SET PAUSED
            </button>`;
  } else {
    // מצב: PAUSED / DRAFT (יעד לא פעיל)
    goalClass = "";
    // הצגת הסטטוס: אדום
    statusDisplayHTML = `<span class="goal-status status-paused">${goalStatus}</span>`;
    // כפתור: ירוק, כדי להפעיל
    actionButtonHTML = `
            <button class="small-button activate-goal-btn status-btn status-active-btn" 
                    data-goal-id="${goal.id}" 
                    data-is-active="false">
                SET ACTIVE
            </button>`;
  }
  // --------------------------------------------------

  return `
        <div class="goal-item${goalClass}" data-goal-id="${goal.id}">
            <div class="goal-name">${name}</div>
            
            <div class="goal-status-text">
                ${statusDisplayHTML}
            </div> 
            
            <div class="goal-data-point goal-calories-target">
                ${calories} kcal
            </div>
            
            <div class="goal-data-point goal-macros">
                <div>P: ${protein}g</div> 
                <div>C: ${carbs}g</div>
                <div>F: ${fat}g</div>
            </div>
            
            <div class="goal-actions">
                ${actionButtonHTML} 
                <button class="small-button delete-goal-btn danger" data-goal-id="${goal.id}">
                    Delete
                </button>
            </div>
        </div>
    `;
}

// --- 2. טעינה והצגת רשימת היעדים מהשרת (כולל תיקון מבנה הנתונים) ---
async function loadGoalPlans() {
  if (!goalsListContainer) return;
  goalsListContainer.innerHTML = "<p>Loading goals...</p>";

  try {
    const response = await apiCall("/goals", "GET");

    // ** התיקון לשגיאת forEach is not a function: **
    // מנסה לחלץ את המערך מהשדה 'goals' בתגובה, אם קיים,
    // או משתמש בתגובה כולה אם היא כבר מערך.
    const goalPlans = Array.isArray(response) ? response : response.goals;

    if (!goalPlans || goalPlans.length === 0) {
      goalsListContainer.innerHTML =
        "<p>No goals found. Please add a new goal below.</p>";
      return;
    }

    if (!Array.isArray(goalPlans)) {
      goalsListContainer.innerHTML =
        '<p class="error-message">Error: Server response is not a valid list format. Please check API structure.</p>';
      console.error(
        "API format error. Expected Array or {goals: Array}, received:",
        response
      );
      return;
    }

    goalsListContainer.innerHTML = "";

    goalPlans.forEach((goal) => {
      const goalItemHTML = createGoalItemHTML(goal);
      goalsListContainer.insertAdjacentHTML("beforeend", goalItemHTML);
    });
  } catch (error) {
    goalsListContainer.innerHTML = `<p class="error-message">Error loading goals: ${error.message}</p>`;
    console.error("Load Goals Error:", error);
  }
}
async function handleGoalAction(target) {
  const goalId = target.dataset.goalId;
  if (!goalId) return;

  try {
    if (target.classList.contains("delete-goal-btn")) {
      if (confirm("Are you sure you want to delete this goal plan?")) {
        await apiCall(`/goals/${goalId}`, "DELETE");
        alert("Goal deleted successfully!");
        loadGoalPlans();
      }
    } else if (target.classList.contains("activate-goal-btn")) {
      const currentlyActive = target.dataset.isActive === "true";

      let endpoint;
      let actionMessage;

      if (currentlyActive) {
        endpoint = `/goals/${goalId}/pause`;
        actionMessage = "paused";
      } else {
        endpoint = `/goals/${goalId}/activate`;
        actionMessage = "activated";
      }

      await apiCall(endpoint, "PUT");

      alert(`Goal successfully ${actionMessage}.`);
      loadGoalPlans();
    }
  } catch (error) {
    alert(`Operation failed: ${error.message}`);
    console.error("Goal Action Error:", error);
  }
}

function attachGoalActionListeners() {
  if (!goalsListContainer) return;

  goalsListContainer.addEventListener("click", async (e) => {
    const target = e.target;
    if (
      target.classList.contains("delete-goal-btn") ||
      target.classList.contains("activate-goal-btn")
    ) {
      await handleGoalAction(target);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) {
    return;
  }

  // טוען את רשימת היעדים ומפעיל את ה-listeners
  loadGoalPlans();
  attachGoalActionListeners();

  const welcomeMessageElement = document.getElementById("welcome-message");
  const storedUserName = localStorage.getItem("userName");
  if (welcomeMessageElement && storedUserName) {
    welcomeMessageElement.textContent = `Hello, ${storedUserName}!`;
  } else if (welcomeMessageElement) {
    welcomeMessageElement.textContent = "Hello!";
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  const goalForm = document.getElementById("add-goal-form");
  const goalMessage = document.getElementById("goal-message");

  goalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    goalMessage.textContent = "";

    const name = document.getElementById("goal-name").value;
    const targetCalories = parseInt(
      document.getElementById("target-calories").value,
      10
    );
    const targetProtein = parseInt(
      document.getElementById("target-protein").value,
      10
    );
    const targetCarbs = parseInt(
      document.getElementById("target-carbs").value,
      10
    );
    const targetFat = parseInt(document.getElementById("target-fat").value, 10);

    if (targetCalories < 1000) {
      goalMessage.textContent = "Calorie target must be at least 1000.";
      return;
    }

    try {
      const response = await apiCall("/goals", "POST", {
        name,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
      });

      goalMessage.textContent = `Goal "${response.name}" added successfully!`;
      goalForm.reset();
      loadGoalPlans();
    } catch (error) {
      goalMessage.textContent = `Error adding goal: ${error.message}`;
      console.error("Add Goal Error:", error);
    }
  });
});
