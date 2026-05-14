# Teams Expense Presenter Agent

An agent project for Microsoft Teams meetings that can introduce and explain an expense splitter codebase, answer audience questions, and provide a path toward joining Teams calls with voice.

## What This Project Contains

- Expense splitter business logic in `src/expense-splitter.ts`
- A presentation agent that explains the codebase in a meeting-friendly order
- A Q&A knowledge base for audience questions
- Microsoft Teams bot scaffolding for chat-based meeting interaction
- Documentation for adding speech and Teams meeting join behavior through Azure Bot Service and Microsoft Graph

## Quick Start

```bash
npm install
npm run dev
```

Then expose the local server with a tunnel and configure the messaging endpoint in Azure Bot Service:

```text
https://YOUR_PUBLIC_URL/api/messages
```

## Project Structure

```text
teams-expense-presenter-agent/
  docs/
    PRESENTATION_SCRIPT.md
    TEAMS_SETUP.md
  src/
    expense-splitter.ts
    index.ts
    knowledge-base.ts
    presentation-agent.ts
    teams-bot.ts
  teams-app-manifest/
    manifest.json
  test/
    expense-splitter.test.ts
  .env.example
  package.json
  tsconfig.json
```

## Agent Behavior

The agent is designed to lead a Teams call by:

1. Greeting the audience.
2. Explaining the expense splitter purpose.
3. Walking through the important files and functions.
4. Demonstrating an example split.
5. Answering questions from team members.

Supported commands:

```text
start presentation
explain architecture
explain expense splitter
demo split
help
```

Any other message is treated as an audience question and answered from the project knowledge base.

## Important Teams Note

Joining a Teams call and speaking out loud requires Microsoft Teams platform setup outside this repository:

- Azure Bot registration
- Teams app manifest
- Microsoft Graph permissions for online meetings/calls
- Azure Speech service or another speech output provider
- Tenant admin consent for calling APIs

The codebase includes the application structure and documentation for those pieces, but it cannot join real Teams meetings until Azure credentials and tenant permissions are configured.
