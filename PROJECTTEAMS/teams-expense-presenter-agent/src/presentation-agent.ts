import { answerQuestion } from "./knowledge-base.js";
import { runDemoSplit } from "./expense-splitter.js";

export class PresentationAgent {
  getOpening(): string {
    return [
      "Hello everyone, I will lead today's walkthrough of the Teams Expense Presenter Agent.",
      "This project has two main responsibilities: first, it calculates fair expense splits; second, it acts as a Teams meeting assistant that can explain the code and answer questions."
    ].join(" ");
  }

  getArchitectureExplanation(): string {
    return [
      "The codebase has three important parts.",
      "The expense splitter contains pure business logic for balances and settlements.",
      "The presentation agent decides how to explain the project to an audience.",
      "The Teams bot receives meeting chat messages and routes them to presentation commands or Q&A responses."
    ].join(" ");
  }

  getExpenseSplitterExplanation(): string {
    return [
      "The splitter accepts participants and expenses.",
      "Each expense says who paid, how much they paid, and which people shared that cost.",
      "The algorithm credits the payer, subtracts each participant's fair share, and then creates a simple list of payments that settles everyone."
    ].join(" ");
  }

  getDemo(): string {
    const demo = runDemoSplit();
    const balances = demo.balances
      .map((balance) => `${balance.name}: ${balance.amount >= 0 ? "gets" : "owes"} $${Math.abs(balance.amount).toFixed(2)}`)
      .join("; ");
    const settlements = demo.settlements
      .map((settlement) => `${settlement.from} pays ${settlement.to} $${settlement.amount.toFixed(2)}`)
      .join("; ");

    return `Here is a sample split. Balances: ${balances}. Settlement plan: ${settlements}.`;
  }

  getHelp(): string {
    return [
      "You can ask me to start presentation, explain architecture, explain expense splitter, or demo split.",
      "You can also ask questions about Teams setup, testing, rounding, security, or the codebase."
    ].join(" ");
  }

  respondToMessage(message: string): string {
    const normalizedMessage = message.trim().toLowerCase();

    if (normalizedMessage.includes("start presentation")) {
      return `${this.getOpening()} ${this.getArchitectureExplanation()} ${this.getExpenseSplitterExplanation()} ${this.getDemo()}`;
    }

    if (normalizedMessage.includes("explain architecture")) {
      return this.getArchitectureExplanation();
    }

    if (normalizedMessage.includes("explain expense splitter") || normalizedMessage.includes("explain code")) {
      return this.getExpenseSplitterExplanation();
    }

    if (normalizedMessage.includes("demo split")) {
      return this.getDemo();
    }

    if (normalizedMessage.includes("help")) {
      return this.getHelp();
    }

    return answerQuestion(message);
  }
}

