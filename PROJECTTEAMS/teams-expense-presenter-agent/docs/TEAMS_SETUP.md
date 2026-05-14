# Microsoft Teams Setup

This project includes a Teams bot endpoint for meeting chat. Real voice participation requires extra Microsoft 365 and Azure configuration.

## Chat-Based Meeting Agent

1. Create an Azure Bot resource.
2. Add the bot's Microsoft App ID and password to `.env`.
3. Run this app locally or deploy it to a public HTTPS host.
4. Configure the bot messaging endpoint:

```text
https://YOUR_PUBLIC_HOST/api/messages
```

5. Create a Teams app manifest that points to the bot.
6. Upload the Teams app to the tenant or install it for a test team.
7. Add the bot to a meeting chat.

The bot can then respond to commands and questions in meeting chat.

This repository includes `teams-app-manifest/manifest.json` as a starting point. Replace the placeholder app IDs, developer URLs, and icon files before packaging it for Teams.

## Voice and Meeting Join Requirements

To have the agent join calls and speak out loud, add these platform pieces:

- Microsoft Graph Cloud Communications APIs
- Application permissions approved by a tenant administrator
- Online meeting or call records the app is allowed to access
- A speech output service, commonly Azure Speech
- A media bot service capable of handling real-time audio

Recommended permissions depend on the final deployment model, but typically include call and meeting permissions such as:

```text
Calls.JoinGroupCall.All
Calls.AccessMedia.All
OnlineMeetings.Read.All
```

Tenant admins must review and approve these permissions before the agent can join meetings.

## Safe Deployment Checklist

- Keep secrets in environment variables or a managed secret store.
- Do not commit `.env`.
- Use HTTPS for bot endpoints.
- Limit Graph permissions to the smallest set the agent needs.
- Log meeting activity carefully and avoid storing private audience questions unless required.
- Tell attendees when an automated agent is present in a meeting.

## Suggested Next Implementation Step

Implement a `CallJoinService` that wraps Microsoft Graph call join operations, then connect it to the presentation agent. Keep it separate from the expense splitter so the core financial logic remains easy to test.
