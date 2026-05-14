import "dotenv/config";
import restify from "restify";
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
const server = restify.createServer();

server.use(restify.plugins.bodyParser());

server.post("/api/messages", async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

server.get("/health", async (_req, res) => {
  res.send({ ok: true, service: "teams-expense-presenter-agent" });
});

server.listen(port, () => {
  console.log(`Teams Expense Presenter Agent listening on http://localhost:${port}`);
});

