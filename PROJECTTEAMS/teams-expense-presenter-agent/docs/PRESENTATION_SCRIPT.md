# Presentation Script

Use this script when the agent leads a Teams meeting.

## Opening

Hello everyone. I will lead today's walkthrough of the Teams Expense Presenter Agent.

The project combines two ideas:

1. An expense splitter that calculates fair balances and settlement payments.
2. A Teams meeting assistant that can explain the codebase and answer audience questions.

## Codebase Walkthrough

Start with `src/expense-splitter.ts`.

This file owns the financial logic. It defines participants, expenses, balances, and settlements. The core function is `calculateBalances`, which credits the person who paid and subtracts each participant's share. Amounts are converted to cents so the math stays reliable.

Next, explain `simplifySettlements`.

This function separates people who owe money from people who should receive money. It then matches debtors and creditors until every balance is settled with a short payment list.

Next, explain `src/presentation-agent.ts`.

This is the meeting leader. It contains responses for the opening, architecture explanation, expense splitter explanation, demo, help command, and general audience questions.

Next, explain `src/knowledge-base.ts`.

This file contains concise answers for common questions about architecture, Teams setup, rounding, testing, and security.

Finally, explain `src/teams-bot.ts` and `src/index.ts`.

Those files connect the presentation agent to Microsoft Teams through Azure Bot Service.

## Demo

Run the demo split.

Alex pays for dinner, Maya pays for a taxi, and the app calculates who owes whom. The agent reports both balances and settlement instructions.

## Q&A

Invite questions from the audience:

Please ask any question about the code, expense splitting algorithm, Teams setup, testing approach, deployment, or security.

If someone asks a question outside the knowledge base, answer with the closest project concept and suggest a more specific topic.

