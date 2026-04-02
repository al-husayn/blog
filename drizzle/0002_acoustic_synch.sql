CREATE TABLE "article_page_views" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"path" text NOT NULL,
	"visitor_id" text NOT NULL,
	"session_id" text NOT NULL,
	"source_group" text NOT NULL,
	"source_detail" text,
	"referrer_host" text,
	"referrer_url" text,
	"keyword" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"engaged_time_seconds" integer DEFAULT 0 NOT NULL,
	"max_scroll_depth" integer DEFAULT 0 NOT NULL,
	"reached_50" boolean DEFAULT false NOT NULL,
	"reached_75" boolean DEFAULT false NOT NULL,
	"reached_100" boolean DEFAULT false NOT NULL,
	"did_bounce" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_share_events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"visitor_id" text NOT NULL,
	"session_id" text NOT NULL,
	"network" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "article_page_views_slug_idx" ON "article_page_views" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_page_views_created_at_idx" ON "article_page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "article_page_views_visitor_id_idx" ON "article_page_views" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "article_page_views_source_group_idx" ON "article_page_views" USING btree ("source_group");--> statement-breakpoint
CREATE INDEX "article_share_events_slug_idx" ON "article_share_events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_share_events_created_at_idx" ON "article_share_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "article_share_events_network_idx" ON "article_share_events" USING btree ("network");