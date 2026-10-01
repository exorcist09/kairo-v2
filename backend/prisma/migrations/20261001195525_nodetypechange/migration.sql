/*
  Warnings:

  - The values [MANUAL_TRIGGER,OPENAI,GEMINI,SLACK] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('INPUT_TRIGGER', 'BROWSER_TRIGGER', 'HTTP_TRIGGER', 'WEBHOOK_TRIGGER', 'OUTPUT', 'CLAUDE_EXECUTER', 'OPENAI_EXECUTER', 'GEMINI_EXECUTER', 'POSTGRES_EXECUTER', 'EMAIL_EXECUTER', 'GOOGLE_FORM_EXECUTER', 'SLACK_EXECUTER');
ALTER TABLE "Node" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "public"."NodeType_old";
COMMIT;
