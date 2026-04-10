import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let checked = false;

onAuthStateChanged(auth, (user) => {
  if (checked) return;
  checked = true;

  if (!user) {
    window.location.replace("../../login.html");
  }
});