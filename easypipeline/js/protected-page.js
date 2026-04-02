import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

await setPersistence(auth, browserLocalPersistence);


const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;
let authResolved = false;
const readyResolvers = [];

function resolveReady(user) {
  while (readyResolvers.length) {
    const resolve = readyResolvers.shift();
    resolve(user);
  }
}

function getBestUserName(user) {
  const displayName = user?.displayName?.trim();
  if (displayName) return displayName;

  const emailPrefix = user?.email?.split("@")[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return "User";
}

function renderUser(user) {
  if (userNameEl) {
    userNameEl.textContent = getBestUserName(user);
  }

  if (userEmailEl) {
    userEmailEl.textContent = user?.email || "";
  }
}

function redirectToLogin() {
  window.location.replace("../../login.html");
}

onAuthStateChanged(auth, (user) => {
  authResolved = true;

  // ⛔ wait a moment before deciding
  setTimeout(() => {
    if (!auth.currentUser) {
      redirectToLogin();
      return;
    }

    currentUser = auth.currentUser;
    renderUser(currentUser);
    resolveReady(currentUser);
  }, 300);
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    redirectToLogin();
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Could not log out. Please try again.");
  }
});

export function getCurrentUser() {
  return currentUser;
}

export function waitForUser() {
  if (currentUser) return Promise.resolve(currentUser);

  if (authResolved && !currentUser) {
    return Promise.reject(new Error("No authenticated user."));
  }

  return new Promise((resolve, reject) => {
    readyResolvers.push((user) => {
      if (user) {
        resolve(user);
      } else {
        reject(new Error("No authenticated user."));
      }
    });
  });
}