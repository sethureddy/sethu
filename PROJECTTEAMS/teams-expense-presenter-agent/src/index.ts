import "dotenv/config";
import express from "express";
import { BotFrameworkAdapter } from "botbuilder";
import { TeamsExpensePresenterBot } from "./teams-bot.js";

const port = Number(process.env.PORT ?? 3978);

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

adapter.onTurnError = async (context, error) => {
  console.error("[onTurnError]", error);
  await context.sendActivity("The agent hit an error while processing that request.");
};

const bot = new TeamsExpensePresenterBot();
const app = express();

app.use(express.json());

app.post("/api/messages", async (req, res) => {
  try {
    await adapter.processActivity(req, res, async (context) => {
      await bot.run(context);
    });
  } catch (error) {
    console.error("[processActivity]", error);
    res.sendStatus(500);
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "teams-expense-presenter-agent" });
});

app.listen(port, () => {
  console.log(`Teams Expense Presenter Agent listening on http://localhost:${port}`);
});
