import { ActivityHandler, MessageFactory, TurnContext } from "botbuilder";
import { PresentationAgent } from "./presentation-agent.js";

export class TeamsExpensePresenterBot extends ActivityHandler {
  private readonly presenter = new PresentationAgent();

  constructor() {
    super();

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded ?? [];
      const botId = context.activity.recipient.id;

      for (const member of membersAdded) {
        if (member.id !== botId) {
          await context.sendActivity(MessageFactory.text(this.presenter.getOpening()));
        }
      }

      await next();
    });

    this.onMessage(async (context, next) => {
      const incomingText = TurnContext.removeRecipientMention(context.activity)?.trim() || context.activity.text || "";
      const response = this.presenter.respondToMessage(incomingText);
      await context.sendActivity(MessageFactory.text(response));
      await next();
    });
  }
}

