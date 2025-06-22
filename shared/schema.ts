import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tools = sqliteTable("tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  path: text("path").notNull(),
});

export const noteCategories = sqliteTable("note_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  userId: integer("user_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id"),
  userId: integer("user_id"),
  tags: text("tags"), // JSON array of tags
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

export const redTeamCommands = sqliteTable("red_team_commands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  tags: text("tags"),
  userId: integer("user_id"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const vulnerabilities = sqliteTable("vulnerabilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cveId: text("cve_id"),
  severity: text("severity").notNull(),
  publishedDate: integer("published_date", { mode: "timestamp" }).notNull(),
  source: text("source").notNull(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  userId: integer("user_id"),
});

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  noteCategories: many(noteCategories),
}));

export const toolsRelations = relations(tools, ({ one }) => ({
  // Add tool relations if needed in the future
}));

export const noteCategoriesRelations = relations(noteCategories, ({ one, many }) => ({
  parent: one(noteCategories, {
    fields: [noteCategories.parentId],
    references: [noteCategories.id],
  }),
  children: many(noteCategories),
  user: one(users, {
    fields: [noteCategories.userId],
    references: [users.id],
  }),
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  category: one(noteCategories, {
    fields: [notes.categoryId],
    references: [noteCategories.id],
  }),
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const redTeamCommandsRelations = relations(redTeamCommands, ({ one }) => ({
  user: one(users, {
    fields: [redTeamCommands.userId],
    references: [users.id],
  }),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  user: one(users, {
    fields: [vulnerabilities.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertToolSchema = createInsertSchema(tools).pick({
  name: true,
  category: true,
  icon: true,
  description: true,
  path: true,
});

export const insertNoteCategorySchema = createInsertSchema(noteCategories).pick({
  name: true,
  parentId: true,
  userId: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  categoryId: true,
  userId: true,
  tags: true,
});

export const insertRedTeamCommandSchema = createInsertSchema(redTeamCommands).pick({
  title: true,
  code: true,
  description: true,
  category: true,
  subCategory: true,
  tags: true,
  userId: true,
  isCustom: true,
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).pick({
  title: true,
  description: true,
  cveId: true,
  severity: true,
  publishedDate: true,
  source: true,
  url: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertNoteCategory = z.infer<typeof insertNoteCategorySchema>;
export type NoteCategory = typeof noteCategories.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertRedTeamCommand = z.infer<typeof insertRedTeamCommandSchema>;
export type RedTeamCommand = typeof redTeamCommands.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
