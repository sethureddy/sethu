import test from "node:test";
import assert from "node:assert/strict";
import { calculateBalances, simplifySettlements, type Expense, type Participant } from "../src/expense-splitter.js";

const participants: Participant[] = [
  { id: "alex", name: "Alex" },
  { id: "maya", name: "Maya" },
  { id: "sam", name: "Sam" }
];

test("calculates balances for shared expenses", () => {
  const expenses: Expense[] = [
    {
      id: "dinner",
      description: "Dinner",
      amount: 90,
      paidBy: "alex",
      sharedBy: ["alex", "maya", "sam"]
    }
  ];

  assert.deepEqual(calculateBalances(participants, expenses), [
    { participantId: "alex", name: "Alex", amount: 60 },
    { participantId: "maya", name: "Maya", amount: -30 },
    { participantId: "sam", name: "Sam", amount: -30 }
  ]);
});

test("simplifies settlements between debtors and creditors", () => {
  const settlements = simplifySettlements([
    { participantId: "alex", name: "Alex", amount: 60 },
    { participantId: "maya", name: "Maya", amount: -30 },
    { participantId: "sam", name: "Sam", amount: -30 }
  ]);

  assert.deepEqual(settlements, [
    { from: "maya", to: "alex", amount: 30 },
    { from: "sam", to: "alex", amount: 30 }
  ]);
});

test("keeps rounding totals consistent", () => {
  const expenses: Expense[] = [
    {
      id: "snacks",
      description: "Snacks",
      amount: 10,
      paidBy: "alex",
      sharedBy: ["alex", "maya", "sam"]
    }
  ];

  const balances = calculateBalances(participants, expenses);
  const total = balances.reduce((sum, balance) => sum + balance.amount, 0);

  assert.equal(Number(total.toFixed(2)), 0);
  assert.deepEqual(balances, [
    { participantId: "alex", name: "Alex", amount: 6.66 },
    { participantId: "maya", name: "Maya", amount: -3.33 },
    { participantId: "sam", name: "Sam", amount: -3.33 }
  ]);
});

test("rejects unknown payers", () => {
  assert.throws(
    () =>
      calculateBalances(participants, [
        {
          id: "hotel",
          description: "Hotel",
          amount: 300,
          paidBy: "unknown",
          sharedBy: ["alex", "maya"]
        }
      ]),
    /Unknown payer/
  );
});

