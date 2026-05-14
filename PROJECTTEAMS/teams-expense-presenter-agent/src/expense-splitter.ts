export type Participant = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  sharedBy: string[];
};

export type Balance = {
  participantId: string;
  name: string;
  amount: number;
};

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

const cents = (amount: number): number => Math.round(amount * 100);
const dollars = (amountInCents: number): number => Number((amountInCents / 100).toFixed(2));

export function calculateBalances(participants: Participant[], expenses: Expense[]): Balance[] {
  const knownParticipants = new Map(participants.map((participant) => [participant.id, participant]));
  const balances = new Map(participants.map((participant) => [participant.id, 0]));

  for (const expense of expenses) {
    if (!knownParticipants.has(expense.paidBy)) {
      throw new Error(`Unknown payer: ${expense.paidBy}`);
    }

    if (expense.amount < 0) {
      throw new Error(`Expense amount cannot be negative: ${expense.description}`);
    }

    if (expense.sharedBy.length === 0) {
      throw new Error(`Expense must be shared by at least one participant: ${expense.description}`);
    }

    for (const participantId of expense.sharedBy) {
      if (!knownParticipants.has(participantId)) {
        throw new Error(`Unknown participant in sharedBy: ${participantId}`);
      }
    }

    const totalCents = cents(expense.amount);
    const baseShare = Math.floor(totalCents / expense.sharedBy.length);
    const remainder = totalCents % expense.sharedBy.length;

    balances.set(expense.paidBy, (balances.get(expense.paidBy) ?? 0) + totalCents);

    expense.sharedBy.forEach((participantId, index) => {
      const share = baseShare + (index < remainder ? 1 : 0);
      balances.set(participantId, (balances.get(participantId) ?? 0) - share);
    });
  }

  return participants.map((participant) => ({
    participantId: participant.id,
    name: participant.name,
    amount: dollars(balances.get(participant.id) ?? 0)
  }));
}

export function simplifySettlements(balances: Balance[]): Settlement[] {
  const debtors = balances
    .filter((balance) => balance.amount < 0)
    .map((balance) => ({ id: balance.participantId, amount: cents(Math.abs(balance.amount)) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((balance) => balance.amount > 0)
    .map((balance) => ({ id: balance.participantId, amount: cents(balance.amount) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: dollars(amount)
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return settlements;
}

export function runDemoSplit(): { balances: Balance[]; settlements: Settlement[] } {
  const participants: Participant[] = [
    { id: "alex", name: "Alex" },
    { id: "maya", name: "Maya" },
    { id: "sam", name: "Sam" }
  ];

  const expenses: Expense[] = [
    {
      id: "dinner",
      description: "Team dinner",
      amount: 96,
      paidBy: "alex",
      sharedBy: ["alex", "maya", "sam"]
    },
    {
      id: "taxi",
      description: "Taxi to venue",
      amount: 45,
      paidBy: "maya",
      sharedBy: ["alex", "maya", "sam"]
    }
  ];

  const balances = calculateBalances(participants, expenses);
  return {
    balances,
    settlements: simplifySettlements(balances)
  };
}

