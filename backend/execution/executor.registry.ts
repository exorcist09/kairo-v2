import { executeBrowser } from "./executors/browser.executor";
import { executeClaude } from "./executors/claude.executor";
import { executeGemini } from "./executors/google-gemini.executor";
import { executeGoogleform } from "./executors/googleform.executor";
import { executeHttpRequest } from "./executors/http-request.executor";
import { executeInput } from "./executors/input.executor";
import { executeOpenai } from "./executors/openAi.executor";
import { executeOutput } from "./executors/output.executor";
import { executePostgres } from "./executors/postgresql.executor";
import { executeEmail } from "./executors/send-email.executor";
import { executeSlack } from "./executors/slack.executor";
import { executeWebhook } from "./executors/webhook.executor";

export const executorRegistry = {
  INPUT_TRIGGER: executeInput,
  BROWSER_TRIGGER: executeBrowser,
  OUTPUT: executeOutput,
  HTTP_TRIGGER: executeHttpRequest,
  WEBHOOK_TRIGGER: executeWebhook,
  CLAUDE_EXECUTER: executeClaude,
  OPENAI_EXECUTER: executeOpenai,
  GEMINI_EXECUTER: executeGemini,
  POSTGRES_EXECUTER: executePostgres,
  EMAIL_EXECUTER: executeEmail,
  GOOGLE_FORM_EXECUTER: executeGoogleform,
  SLACK_EXECUTER: executeSlack,
};
