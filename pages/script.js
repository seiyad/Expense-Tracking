import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWfXbLyYQKrWfnZPdpo25WOr7n9N4M78c",
  authDomain: "expense-trakker.firebaseapp.com",
  projectId: "expense-trakker",
  storageBucket: "expense-trakker.firebasestorage.app",
  messagingSenderId: "654573857096",
  appId: "1:654573857096:web:a07423978542be8a086b7d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login');
const registerBtn = document.getElementById('register');

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./pages/dashborard.html";
  }
});

loginBtn.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please fill in a valid email and password");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "./pages/dashborard.html";
    })
    .catch((error) => {
      alert("Invalid email or password");
    });
});

registerBtn.addEventListener('click', () => {
  window.location.href = "./pages/register.html";
});