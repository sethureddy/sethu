from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from urllib.parse import urlparse

from person import Person


HOST = "127.0.0.1"
PORT = 8000


HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Expense Splitter</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f4ef;
      --surface: #fffdf8;
      --ink: #1f2933;
      --muted: #637083;
      --line: #d8d1c3;
      --accent: #0f766e;
      --accent-dark: #115e59;
      --danger: #b42318;
      --shadow: 0 12px 30px rgba(31, 41, 51, 0.1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }

    main {
      width: min(1120px, calc(100% - 32px));
      margin: 32px auto 56px;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
      padding-bottom: 22px;
      border-bottom: 1px solid var(--line);
    }

    h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.1;
    }

    .subtitle {
      margin: 8px 0 0;
      color: var(--muted);
      max-width: 640px;
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
      gap: 20px;
      margin-top: 22px;
      align-items: start;
    }

    section,
    .result-panel {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    section {
      padding: 20px;
      margin-bottom: 18px;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    h2 {
      margin: 0;
      font-size: 18px;
    }

    button {
      min-height: 40px;
      border: 1px solid transparent;
      border-radius: 7px;
      padding: 0 14px;
      background: var(--accent);
      color: white;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:hover {
      background: var(--accent-dark);
    }

    button.secondary {
      background: transparent;
      color: var(--accent-dark);
      border-color: var(--line);
    }

    button.secondary:hover {
      background: #edf7f5;
    }

    button.danger {
      background: transparent;
      color: var(--danger);
      border-color: #f2c5bf;
    }

    button.danger:hover {
      background: #fff1ef;
    }

    .people-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #344054;
      margin-bottom: 6px;
    }

    input,
    select {
      width: 100%;
      min-height: 40px;
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 8px 10px;
      background: #ffffff;
      color: var(--ink);
      font: inherit;
    }

    input:focus,
    select:focus {
      outline: 3px solid rgba(15, 118, 110, 0.16);
      border-color: var(--accent);
    }

    .expense-row {
      display: grid;
      grid-template-columns: 1.1fr 1.25fr 0.8fr 1.2fr auto;
      gap: 10px;
      align-items: end;
      padding: 12px 0;
      border-top: 1px solid var(--line);
    }

    .expense-row:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .result-panel {
      padding: 20px;
      position: sticky;
      top: 20px;
    }

    .metric {
      padding: 14px;
      border-radius: 8px;
      background: #eef5f1;
      margin: 14px 0;
    }

    .metric .value {
      font-size: 30px;
      font-weight: 800;
      margin-top: 4px;
    }

    .result-list {
      margin: 10px 0 18px;
      padding: 0;
      list-style: none;
    }

    .result-list li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--line);
    }

    .result-list strong {
      white-space: nowrap;
    }

    .empty {
      color: var(--muted);
      padding: 12px 0;
    }

    .error {
      display: none;
      margin-top: 12px;
      padding: 12px;
      border: 1px solid #f2c5bf;
      border-radius: 8px;
      color: var(--danger);
      background: #fff7f5;
      font-weight: 700;
    }

    @media (max-width: 860px) {
      .layout,
      .people-grid,
      .expense-row {
        grid-template-columns: 1fr;
      }

      header {
        align-items: start;
        flex-direction: column;
      }

      .result-panel {
        position: static;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Expense Splitter</h1>
        <p class="subtitle">Enter people, add each expense, choose who shared it, and calculate the exact payback amounts.</p>
      </div>
      <button id="calculateBtn">Calculate Split</button>
    </header>

    <div class="layout">
      <div>
        <section>
          <div class="section-title">
            <h2>People</h2>
            <button class="secondary" id="addPersonBtn" type="button">Add Person</button>
          </div>
          <div id="peopleList" class="people-grid"></div>
        </section>

        <section>
          <div class="section-title">
            <h2>Expenses</h2>
            <button class="secondary" id="addExpenseBtn" type="button">Add Expense</button>
          </div>
          <div id="expensesList"></div>
          <div class="actions">
            <button type="button" id="calculateBtnBottom">Calculate Split</button>
            <button class="secondary" type="button" id="loadSampleBtn">Load Sample</button>
            <button class="danger" type="button" id="clearBtn">Clear</button>
          </div>
          <div id="errorBox" class="error"></div>
        </section>
      </div>

      <aside class="result-panel">
        <h2>Result</h2>
        <div class="metric">
          <div>Total Spent</div>
          <div class="value" id="totalSpent">$0.00</div>
        </div>
        <h2>Balances</h2>
        <ul class="result-list" id="balancesList">
          <li class="empty">Results will appear here.</li>
        </ul>
        <h2>Payments</h2>
        <ul class="result-list" id="paymentsList">
          <li class="empty">No payments calculated yet.</li>
        </ul>
      </aside>
    </div>
  </main>

  <script>
    const peopleList = document.querySelector("#peopleList");
    const expensesList = document.querySelector("#expensesList");
    const errorBox = document.querySelector("#errorBox");
    const totalSpent = document.querySelector("#totalSpent");
    const balancesList = document.querySelector("#balancesList");
    const paymentsList = document.querySelector("#paymentsList");

    function money(value) {
      return `$${Number(value).toFixed(2)}`;
    }

    function currentPeople() {
      return [...peopleList.querySelectorAll(".person-name")]
        .map((input) => input.value.trim())
        .filter(Boolean);
    }

    function updatePayerOptions() {
      const people = currentPeople();
      for (const row of expensesList.querySelectorAll(".expense-row")) {
        const payer = row.querySelector(".payer");
        const selected = payer.value;
        payer.innerHTML = people.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
        if (people.includes(selected)) payer.value = selected;
        updateSplitOptions(row);
      }
    }

    function escapeHtml(value) {
      return value.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
    }

    function addPerson(name = "") {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <label>Person Name</label>
        <input class="person-name" value="${escapeHtml(name)}" placeholder="Alex">
      `;
      wrap.querySelector("input").addEventListener("input", updatePayerOptions);
      peopleList.appendChild(wrap);
      updatePayerOptions();
    }

    function updateSplitOptions(row) {
      const people = currentPeople();
      const split = row.querySelector(".split-with");
      const selected = [...split.selectedOptions].map((option) => option.value);
      split.innerHTML = people.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
      for (const option of split.options) {
        option.selected = selected.includes(option.value);
      }
    }

    function addExpense(expense = {}) {
      const row = document.createElement("div");
      row.className = "expense-row";
      row.innerHTML = `
        <div>
          <label>Paid By</label>
          <select class="payer"></select>
        </div>
        <div>
          <label>Description</label>
          <input class="description" value="${escapeHtml(expense.description || "")}" placeholder="Dinner">
        </div>
        <div>
          <label>Amount</label>
          <input class="amount" type="number" min="0" step="0.01" value="${expense.amount || ""}" placeholder="50.00">
        </div>
        <div>
          <label>Split With</label>
          <select class="split-with" multiple size="3"></select>
        </div>
        <button class="danger remove-expense" type="button">Remove</button>
      `;
      row.querySelector(".remove-expense").addEventListener("click", () => row.remove());
      expensesList.appendChild(row);
      updatePayerOptions();
      if (expense.payer) row.querySelector(".payer").value = expense.payer;
      if (expense.split_with) {
        for (const option of row.querySelector(".split-with").options) {
          option.selected = expense.split_with.includes(option.value);
        }
      }
    }

    function collectPayload() {
      const people = currentPeople();
      const expenses = [...expensesList.querySelectorAll(".expense-row")].map((row) => ({
        payer: row.querySelector(".payer").value,
        description: row.querySelector(".description").value.trim(),
        amount: Number(row.querySelector(".amount").value),
        split_with: [...row.querySelector(".split-with").selectedOptions].map((option) => option.value)
      }));
      return { people, expenses };
    }

    function showError(message) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
    }

    function clearError() {
      errorBox.textContent = "";
      errorBox.style.display = "none";
    }

    async function calculate() {
      clearError();
      const response = await fetch("/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectPayload())
      });
      const data = await response.json();
      if (!response.ok) {
        showError(data.error || "Could not calculate the split.");
        return;
      }
      renderResults(data);
    }

    function renderResults(data) {
      totalSpent.textContent = money(data.total_spent);
      balancesList.innerHTML = "";
      for (const balance of data.balances) {
        const li = document.createElement("li");
        const direction = balance.balance >= 0 ? "receives" : "owes";
        li.innerHTML = `<span>${escapeHtml(balance.name)} ${direction}</span><strong>${money(Math.abs(balance.balance))}</strong>`;
        balancesList.appendChild(li);
      }

      paymentsList.innerHTML = "";
      if (data.payments.length === 0) {
        paymentsList.innerHTML = `<li class="empty">Everyone is settled.</li>`;
        return;
      }
      for (const payment of data.payments) {
        const li = document.createElement("li");
        li.innerHTML = `<span>${escapeHtml(payment.from)} pays ${escapeHtml(payment.to)}</span><strong>${money(payment.amount)}</strong>`;
        paymentsList.appendChild(li);
      }
    }

    function loadSample() {
      peopleList.innerHTML = "";
      expensesList.innerHTML = "";
      ["Alex", "Jay", "Lambo", "Mandy"].forEach(addPerson);
      addExpense({ payer: "Alex", description: "Dinner", amount: 200 });
      addExpense({ payer: "Jay", description: "Drinks", amount: 100, split_with: ["Jay", "Mandy"] });
      addExpense({ payer: "Lambo", description: "Hotel", amount: 200 });
      calculate();
    }

    function clearAll() {
      peopleList.innerHTML = "";
      expensesList.innerHTML = "";
      totalSpent.textContent = "$0.00";
      balancesList.innerHTML = `<li class="empty">Results will appear here.</li>`;
      paymentsList.innerHTML = `<li class="empty">No payments calculated yet.</li>`;
      clearError();
      addPerson();
      addPerson();
      addExpense();
    }

    document.querySelector("#addPersonBtn").addEventListener("click", () => addPerson());
    document.querySelector("#addExpenseBtn").addEventListener("click", () => addExpense());
    document.querySelector("#calculateBtn").addEventListener("click", calculate);
    document.querySelector("#calculateBtnBottom").addEventListener("click", calculate);
    document.querySelector("#loadSampleBtn").addEventListener("click", loadSample);
    document.querySelector("#clearBtn").addEventListener("click", clearAll);

    clearAll();
  </script>
</body>
</html>
"""


def calculate_split(people, expenses):
    cleaned_people = [person.strip() for person in people if person.strip()]
    if len(cleaned_people) < 2:
        raise ValueError("Enter at least two people.")

    duplicate_names = {
        name for name in cleaned_people if cleaned_people.count(name) > 1
    }
    if duplicate_names:
        raise ValueError("Each person must have a unique name.")

    group = {person.upper(): Person(person, None) for person in cleaned_people}
    total_spent = 0.0

    for index, expense in enumerate(expenses, start=1):
        payer = expense.get("payer", "").strip()
        description = expense.get("description", "").strip()
        amount = float(expense.get("amount") or 0)
        split_with = [name.strip() for name in expense.get("split_with", []) if name.strip()]

        if not payer:
            raise ValueError(f"Expense {index}: choose who paid.")
        if payer.upper() not in group:
            raise ValueError(f"Expense {index}: payer must be in the people list.")
        if not description:
            raise ValueError(f"Expense {index}: enter a description.")
        if amount <= 0:
            raise ValueError(f"Expense {index}: amount must be greater than zero.")

        if not split_with:
            split_with = cleaned_people

        for name in split_with:
            if name.upper() not in group:
                raise ValueError(f"Expense {index}: split-with names must be in the people list.")

        debt_per_person = round(amount / len(split_with), 3)
        for name in split_with:
            group[name.upper()].add_debt(debt_per_person)

        group[payer.upper()].add_credit(amount)
        total_spent += amount

    for person in group.values():
        person.set_final_balance()

    balances = [
        {
            "name": person.name,
            "credit": round(person.credit, 2),
            "debt": round(person.debt, 2),
            "balance": round(person.balance(), 2),
        }
        for person in group.values()
    ]

    payments = calculate_payments(group)

    return {
        "total_spent": round(total_spent, 2),
        "balances": balances,
        "payments": payments,
    }


def calculate_payments(group):
    creditors = sorted(
        [person for person in group.values() if person.final_balance > 0],
        key=lambda person: person.final_balance,
        reverse=True,
    )
    debtors = sorted(
        [person for person in group.values() if person.final_balance < 0],
        key=lambda person: person.final_balance,
    )

    payments = []
    debtor_index = 0
    creditor_index = 0

    while debtor_index < len(debtors) and creditor_index < len(creditors):
        debtor = debtors[debtor_index]
        creditor = creditors[creditor_index]
        amount = min(-debtor.final_balance, creditor.final_balance)

        if round(amount, 2) > 0:
            payments.append({
                "from": debtor.name,
                "to": creditor.name,
                "amount": round(amount, 2),
            })

        debtor.final_balance = round(debtor.final_balance + amount, 3)
        creditor.final_balance = round(creditor.final_balance - amount, 3)

        if round(debtor.final_balance, 2) == 0:
            debtor_index += 1
        if round(creditor.final_balance, 2) == 0:
            creditor_index += 1

    return payments


class ExpenseSplitterHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path != "/":
            self.send_error(404)
            return
        self.respond(200, HTML, "text/html; charset=utf-8")

    def do_POST(self):
        if urlparse(self.path).path != "/calculate":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            result = calculate_split(payload.get("people", []), payload.get("expenses", []))
            self.respond_json(200, result)
        except ValueError as exc:
            self.respond_json(400, {"error": str(exc)})
        except Exception as exc:
            self.respond_json(500, {"error": f"Unexpected error: {exc}"})

    def respond_json(self, status, payload):
        self.respond(status, json.dumps(payload), "application/json")

    def respond(self, status, body, content_type):
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main():
    server = ThreadingHTTPServer((HOST, PORT), ExpenseSplitterHandler)
    print(f"Expense Splitter UI running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop the server.")
    server.serve_forever()


if __name__ == "__main__":
    main()
