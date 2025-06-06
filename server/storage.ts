import { users, surveyTemplates, surveys, type User, type InsertUser, type SurveyTemplate, type InsertSurveyTemplate, type Survey, type InsertSurvey } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Survey template operations
  createSurveyTemplate(template: InsertSurveyTemplate): Promise<SurveyTemplate>;
  getSurveyTemplate(id: number): Promise<SurveyTemplate | undefined>;
  getSurveyTemplateByCode(code: string): Promise<SurveyTemplate | undefined>;
  getSurveyTemplatesByUser(userId: number): Promise<SurveyTemplate[]>;
  updateSurveyTemplate(id: number, updates: Partial<InsertSurveyTemplate>): Promise<SurveyTemplate | undefined>;
  deleteSurveyTemplate(id: number): Promise<boolean>;

  // Survey operations
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByUser(userId: number): Promise<Survey[]>;
  getSurveysByTemplate(templateId: number): Promise<Survey[]>;
  deleteSurvey(id: number): Promise<boolean>;

  // Statistics
  getUserStats(userId: number): Promise<{ templatesCount: number; surveysCount: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSurveyTemplate(template: InsertSurveyTemplate): Promise<SurveyTemplate> {
    const [newTemplate] = await db
      .insert(surveyTemplates)
      .values({
        ...template,
        updatedAt: new Date(),
      })
      .returning();
    return newTemplate;
  }

  async getSurveyTemplate(id: number): Promise<SurveyTemplate | undefined> {
    const [template] = await db.select().from(surveyTemplates).where(eq(surveyTemplates.id, id));
    return template || undefined;
  }

  async getSurveyTemplateByCode(code: string): Promise<SurveyTemplate | undefined> {
    const [template] = await db.select().from(surveyTemplates).where(eq(surveyTemplates.code, code));
    return template || undefined;
  }

  async getSurveyTemplatesByUser(userId: number): Promise<SurveyTemplate[]> {
    return await db
      .select()
      .from(surveyTemplates)
      .where(eq(surveyTemplates.createdBy, userId))
      .orderBy(desc(surveyTemplates.createdAt));
  }

  async updateSurveyTemplate(id: number, updates: Partial<InsertSurveyTemplate>): Promise<SurveyTemplate | undefined> {
    const [updated] = await db
      .update(surveyTemplates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(surveyTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSurveyTemplate(id: number): Promise<boolean> {
    const result = await db.delete(surveyTemplates).where(eq(surveyTemplates.id, id));
    return result.rowCount > 0;
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const [newSurvey] = await db
      .insert(surveys)
      .values(survey)
      .returning();
    return newSurvey;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey || undefined;
  }

  async getSurveysByUser(userId: number): Promise<Survey[]> {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.conductedBy, userId))
      .orderBy(desc(surveys.createdAt));
  }

  async getSurveysByTemplate(templateId: number): Promise<Survey[]> {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.templateId, templateId))
      .orderBy(desc(surveys.createdAt));
  }

  async deleteSurvey(id: number): Promise<boolean> {
    const result = await db.delete(surveys).where(eq(surveys.id, id));
    return result.rowCount > 0;
  }

  async getUserStats(userId: number): Promise<{ templatesCount: number; surveysCount: number }> {
    const [templatesCount] = await db
      .select({ count: count() })
      .from(surveyTemplates)
      .where(eq(surveyTemplates.createdBy, userId));

    const [surveysCount] = await db
      .select({ count: count() })
      .from(surveys)
      .where(eq(surveys.conductedBy, userId));

    return {
      templatesCount: templatesCount.count,
      surveysCount: surveysCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
