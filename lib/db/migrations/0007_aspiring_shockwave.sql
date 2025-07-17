CREATE TABLE IF NOT EXISTS "UserAssistant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"assistantName" varchar(128) NOT NULL,
	"assistantId" varchar(64) NOT NULL,
	"threadId" varchar(64) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAssistant" ADD CONSTRAINT "UserAssistant_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
