import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  getDocs
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

const idEl = document.querySelector("#id");
const nameEl = document.querySelector("#ExpenseName");
const catagorieEl = document.querySelector("#ExpenseCatagorie");
const dateEl = document.querySelector("#Date");
const amountEl = document.querySelector("#Amount");
const frmEl = document.querySelector("#frm");
const tblBodyEl = document.querySelector("#tblBody");

let currentUserId = null;
let currentTotalSpent = 0;

async function deleteOldExpenses(userId) {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const expenseRef = collection(db, "users", userId, "expenses");
    const oldQuery = query(expenseRef, where("date", "<", monthStart));
    const oldSnapshot = await getDocs(oldQuery);
    oldSnapshot.docs.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "users", userId, "expenses", docSnap.id));
    });
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    currentUserId = user.uid;
    deleteOldExpenses(currentUserId);

    const expenseRef = collection(db, "users", currentUserId, "expenses");
    const q = query(expenseRef, orderBy("date", "desc"));

    onSnapshot(q, (snapshot) => {
        tblBodyEl.innerHTML = "";

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        currentTotalSpent = 0;
        snapshot.docs.forEach((docSnap) => {
            const expense = docSnap.data();
            const expDate = new Date(expense.date);
            if (
                expDate.getMonth() === currentMonth &&
                expDate.getFullYear() === currentYear
            ) {
                currentTotalSpent += expense.amount;
            }
        });

        if (!snapshot.empty) {
            snapshot.docs.forEach((docSnap, index) => {
                const expense = docSnap.data();
                const expenseID = docSnap.id;
                tblBodyEl.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${expense.name}</td>
                        <td>${expense.catagorie}</td>
                        <td>${expense.date}</td>
                        <td>₹${expense.amount}</td>
                        <td><button type="button" class="btn-edit" data-id="${expenseID}"><p>EDIT</p></button></td>
                        <td><button type="button" class="btn-delete" data-id="${expenseID}"><p>DELETE</p></button></td>
                    </tr>
                `;
            });
        } else {
            tblBodyEl.innerHTML = "<tr><td colspan='7'>No Record Found</td></tr>";
        }
    });
});

frmEl.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!currentUserId) {
        alert("You must be logged in");
        return;
    }

    if (!nameEl.value.trim() || !catagorieEl.value.trim() || 
        !dateEl.value.trim() || !amountEl.value.trim()) {
        alert("Please fill all details");
        return;
    }

    const selectedDate = new Date(dateEl.value);
    const now = new Date();
    if (
        selectedDate.getMonth() !== now.getMonth() ||
        selectedDate.getFullYear() !== now.getFullYear()
    ) {
        alert("You can only add expenses for the current month!");
        return;
    }

    const salaryKey = `monthlySalary_${currentUserId}`;
    const monthlySalary = parseFloat(localStorage.getItem(salaryKey)) || 0;
    const newAmount = Number(amountEl.value.trim());

    if (monthlySalary > 0 && !idEl.value) {
        if (newAmount > monthlySalary) {
            alert(` Single expense cannot be greater than your monthly budget of ₹${monthlySalary.toFixed(2)}!`);
            return;
        }
        if (currentTotalSpent >= monthlySalary) {
            alert(" Budget limit reached! You cannot add more expenses this month.");
            return;
        }
        if (currentTotalSpent + newAmount > monthlySalary) {
            alert(` This expense exceeds your budget! You can only spend ₹${(monthlySalary - currentTotalSpent).toFixed(2)} more.`);
            return;
        }
    }

    const expenseData = {
        name: nameEl.value.trim(),
        catagorie: catagorieEl.value.trim(),
        date: dateEl.value.trim(),
        amount: newAmount,
        time: new Date().toLocaleTimeString()
    };

    const expenseRef = collection(db, "users", currentUserId, "expenses");

    if (idEl.value) {
        await updateDoc(doc(db, "users", currentUserId, "expenses", idEl.value), expenseData);
    } else {
        await addDoc(expenseRef, expenseData);
    }

    clearElements();
});

function clearElements() {
    nameEl.value = "";
    catagorieEl.value = "";
    dateEl.value = "";
    amountEl.value = "";
    idEl.value = "";
}

document.addEventListener("click", async function(e) {
    const editBtn = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");

    if (editBtn) {
        const id = editBtn.dataset.id;
        const row = editBtn.closest("tr").children;
        idEl.value = id;
        nameEl.value = row[1].textContent;
        catagorieEl.value = row[2].textContent;
        dateEl.value = row[3].textContent;
        amountEl.value = row[4].textContent.replace("₹", "");
    }

    if (deleteBtn) {
        if (confirm("Are you sure to delete?")) {
            const id = deleteBtn.dataset.id;
            await deleteDoc(doc(db, "users", currentUserId, "expenses", id));
        }
    }
});