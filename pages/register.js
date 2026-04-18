import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const registerBtn = document.getElementById('register');

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./dashborard.html";
  }
});

registerBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });
    localStorage.setItem("userName", name);

    alert(`Registration successful! Welcome, ${name}.`);
    window.location.href = "./dashborard.html";

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("This email is already registered.");
    } else if (error.code === "auth/invalid-email") {
      alert("Invalid email address.");
    } else {
      alert(error.message);
    }
  }
});