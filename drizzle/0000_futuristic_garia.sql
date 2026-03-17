CREATE TABLE "article_upvotes" (
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_upvotes_pk" PRIMARY KEY("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "comment_upvotes" (
	"comment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_upvotes_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "article_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"author" text NOT NULL,
	"author_image_url" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment_upvotes" ADD CONSTRAINT "comment_upvotes_comment_id_article_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."article_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_upvotes_article_slug_idx" ON "article_upvotes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "comment_upvotes_comment_id_idx" ON "comment_upvotes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comments_article_slug_idx" ON "article_comments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "comments_clerk_user_id_idx" ON "article_comments" USING btree ("user_id");