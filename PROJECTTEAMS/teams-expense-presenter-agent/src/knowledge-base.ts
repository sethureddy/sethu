export type KnowledgeAnswer = {
  topic: string;
  answer: string;
};

const answers: KnowledgeAnswer[] = [
  {
    topic: "architecture",
    answer:
      "The project is split into three layers: expense-splitting domain logic, presentation orchestration, and Teams bot integration. That keeps financial calculations testable without depending on Teams APIs."
  },
  {
    topic: "expense splitter",
    answer:
      "The splitter records who paid each expense and who shared it. It calculates balances in cents to avoid floating point errors, then simplifies the final payments between debtors and creditors."
  },
  {
    topic: "rounding",
    answer:
      "Amounts are converted to cents. When an expense does not divide evenly, leftover cents are assigned one by one to the first participants in the shared list, so the total always matches the original expense."
  },
  {
    topic: "teams",
    answer:
      "The Teams integration uses Azure Bot Service for meeting chat messages. Real call joining and voice require Microsoft Graph calling permissions, tenant admin consent, and a speech provider such as Azure Speech."
  },
  {
    topic: "testing",
    answer:
      "The tests cover balance calculation, settlement simplification, validation errors, and rounding behavior. The financial logic is intentionally isolated so it can be tested quickly."
  },
  {
    topic: "security",
    answer:
      "Secrets stay in environment variables. The bot should never hard-code Teams, Graph, or Azure Speech credentials in source control."
  }
];

export function answerQuestion(question: string): string {
  const normalizedQuestion = question.toLowerCase();
  const match = answers.find((item) => normalizedQuestion.includes(item.topic));

  if (match) {
    return match.answer;
  }

  return [
    "I can answer from the project documentation and codebase.",
    "The key idea is that the expense splitter is pure TypeScript logic, while the Teams agent presents that logic and responds to meeting questions.",
    "Please ask about architecture, rounding, Teams setup, testing, security, or the expense splitter flow."
  ].join(" ");
}

