import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

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

const Profile = document.getElementById("profileAvatar");
const App = document.getElementById("displayApp");
const Name = document.getElementById("displayUserName");
const Email = document.getElementById("displayEmail");
const CreateDate = document.getElementById("displayCreatedDate");
const logoutBtn = document.getElementById("logoutButton");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
  } else {
    await user.reload();

    const updatedUser = auth.currentUser;
    let name = updatedUser.displayName || localStorage.getItem("userName");

    if (!name) {
      name = prompt("Your name is missing. Please enter your name:");
      if (name && name.trim() !== "") {
        name = name.trim();
        await updateProfile(updatedUser, { displayName: name });
        localStorage.setItem("userName", name);
      } else {
        name = "User";
      }
    }

    const date = new Date(updatedUser.metadata.creationTime).toLocaleDateString();

    App.textContent = name;
    Name.textContent = name;
    Email.textContent = updatedUser.email;
    CreateDate.textContent = date;
    Profile.textContent = name.charAt(0).toUpperCase();
  }
});

logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    localStorage.removeItem("userName");
    window.location.href = "../index.html";
  });
});