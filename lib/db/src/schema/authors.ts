import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const authorsTable = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuthorSchema = createInsertSchema(authorsTable).omit({ id: true, createdAt: true });
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type Author = typeof authorsTable.$inferSelect;
