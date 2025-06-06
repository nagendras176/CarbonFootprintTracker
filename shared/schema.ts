import { pgTable, text, serial, integer, decimal, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const surveyTemplates = pgTable("survey_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  questions: jsonb("questions").notNull().$type<SurveyQuestion[]>(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => surveyTemplates.id),
  householdId: text("household_id").notNull(),
  householdAddress: text("household_address").notNull(),
  occupants: integer("occupants").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }),
  responses: jsonb("responses").notNull().$type<SurveyResponse[]>(),
  totalCarbonFootprint: decimal("total_carbon_footprint", { precision: 10, scale: 3 }).notNull(),
  conductedBy: integer("conducted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  surveyTemplates: many(surveyTemplates),
  surveys: many(surveys),
}));

export const surveyTemplatesRelations = relations(surveyTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [surveyTemplates.createdBy],
    references: [users.id],
  }),
  surveys: many(surveys),
}));

export const surveysRelations = relations(surveys, ({ one }) => ({
  template: one(surveyTemplates, {
    fields: [surveys.templateId],
    references: [surveyTemplates.id],
  }),
  conductedBy: one(users, {
    fields: [surveys.conductedBy],
    references: [users.id],
  }),
}));

// Types for questions and responses
export interface SurveyQuestion {
  id: string;
  text: string;
  unit: string;
  coefficient: number;
}

export interface SurveyResponse {
  questionId: string;
  value: number;
  carbonEquivalent: number;
}

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSurveyTemplateSchema = createInsertSchema(surveyTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SurveyTemplate = typeof surveyTemplates.$inferSelect;
export type InsertSurveyTemplate = z.infer<typeof insertSurveyTemplateSchema>;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
