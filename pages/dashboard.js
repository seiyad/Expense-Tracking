import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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
const db = getFirestore(app);

const logoutBtn = document.getElementById("logout");
const totalSpentEl = document.getElementById("totalSpent");
const remainingBudgetEl = document.getElementById("remainingBudget");
const highestExpenseEl = document.getElementById("highestExpense");
const progressBar = document.getElementById("monthlyProgressBar");
const progressText = document.getElementById("progressText");
const progressAmount = document.getElementById("progressamount");
const editBudgetBtn = document.getElementById("editBudgetBtn");

logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "../index.html";
    });
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    const salaryKey = `monthlySalary_${user.uid}`;
    let monthlySalary = parseFloat(localStorage.getItem(salaryKey)) || 0;

    if (!monthlySalary) {
        const input = prompt("Enter your monthly budget (₹):");
        const entered = parseFloat(input);
        if (!isNaN(entered) && entered > 0) {
            localStorage.setItem(salaryKey, entered);
            location.reload();
        }
        return;
    }

    editBudgetBtn.addEventListener("click", () => {
        const input = prompt(`Current budget: ₹${monthlySalary}\nEnter new monthly budget (₹):`);
        const entered = parseFloat(input);
        if (!isNaN(entered) && entered > 0) {
            monthlySalary = entered+monthlySalary;
            localStorage.setItem(salaryKey, entered+monthlySalary);
        }
    });

    const expenseRef = collection(db, "users", user.uid, "expenses");

    let budgetAlertShown = false;

    onSnapshot(expenseRef, (snapshot) => {
        let totalSpent = 0;
        let highestExpense = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        snapshot.docs.forEach((docSnap) => {
            const expense = docSnap.data();
            const expDate = new Date(expense.date);

            if (
                expDate.getMonth() === currentMonth &&
                expDate.getFullYear() === currentYear
            ) {
                totalSpent += expense.amount;

                if (expense.amount > highestExpense) {
                    highestExpense = expense.amount;
                }
            }
        });

        if (totalSpent >= monthlySalary && !budgetAlertShown) {
            budgetAlertShown = true;
            alert(" Budget limit reached! You have used your entire monthly budget. No more expenses can be added.");
        }

        if (totalSpent < monthlySalary) {
            budgetAlertShown = false;
        }

        const remaining = (monthlySalary+entered)-totalSpent;
        const percent = monthlySalary > 0 ? Math.min((totalSpent / monthlySalary) * 100, 100).toFixed(1) : 0;

        totalSpentEl.textContent      = `₹${totalSpent.toFixed(2)}`;
        remainingBudgetEl.textContent = `₹${remaining.toFixed(2)}`;
        highestExpenseEl.textContent  = `₹${highestExpense.toFixed(2)}`;

        progressBar.style.width           = `${percent}%`;
        progressBar.style.backgroundColor = percent > 80 ? "#e74c3c" : "#2ecc71";
        progressText.textContent          = `${percent}% of monthly budget used`;
        progressAmount.textContent        = `₹${totalSpent.toFixed(2)} spent of ₹${monthlySalary.toFixed(2)}`;
    });
});