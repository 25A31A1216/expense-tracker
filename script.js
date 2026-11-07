
const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentFilter = "all";

dateInput.value = new Date().toISOString().split("T")[0];

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateSummary() {
    const income = transactions
        .filter(item => item.type === "income")
        .reduce((total, item) => total + item.amount, 0);

    const expense = transactions
        .filter(item => item.type === "expense")
        .reduce((total, item) => total + item.amount, 0);

    balanceDisplay.textContent = formatMoney(income - expense);
    incomeDisplay.textContent = formatMoney(income);
    expenseDisplay.textContent = formatMoney(expense);
}

function displayTransactions() {
    transactionList.innerHTML = "";

    const filteredTransactions = transactions.filter(item =>
        currentFilter === "all" || item.type === currentFilter
    );

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML =
            '<li class="empty">No transactions found.</li>';
        return;
    }

    filteredTransactions.forEach(item => {
        const li = document.createElement("li");
        li.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const heading = document.createElement("h4");
        heading.textContent = item.title;

        const details = document.createElement("p");
        details.textContent = `${item.category} • ${item.date}`;

        info.append(heading, details);

        const right = document.createElement("div");
        right.className = "transaction-right";

        const amount = document.createElement("span");
        amount.className = item.type === "income"
            ? "income-amount"
            : "expense-amount";

        amount.textContent =
            `${item.type === "income" ? "+" : "-"}${formatMoney(item.amount)}`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(item.id);
        });

        right.append(amount, deleteButton);
        li.append(info, right);

        transactionList.appendChild(li);
    });
}

function addTransaction(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);

    if (!title || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid title and amount.");
        return;
    }

    const transaction = {
        id: Date.now(),
        title,
        amount,
        type: typeInput.value,
        category: categoryInput.value,
        date: dateInput.value
    };

    transactions.push(transaction);

    saveTransactions();
    updateSummary();
    displayTransactions();

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
}

function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);

    saveTransactions();
    updateSummary();
    displayTransactions();
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".filter.active")
            ?.classList.remove("active");

        button.classList.add("active");
        currentFilter = button.dataset.filter;

        displayTransactions();
    });
});

form.addEventListener("submit", addTransaction);

updateSummary();
displayTransactions();
