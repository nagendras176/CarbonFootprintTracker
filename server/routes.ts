import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSurveyTemplateSchema, insertSurveySchema, type SurveyQuestion } from "@shared/schema";
import { authenticateUser, createUser } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate unique survey template code
  function generateSurveyCode(): string {
    const prefix = "CS";
    const year = new Date().getFullYear();
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${randomId}`;
  }

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = await authenticateUser(req.body);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = await createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Calculate total carbon footprint from responses
  function calculateTotalCarbon(responses: Array<{ questionId: string; value: number; carbonEquivalent: number }>): number {
    return responses.reduce((total, response) => total + response.carbonEquivalent, 0);
  }

  // User stats endpoint
  app.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Survey template routes
  app.post("/api/survey-templates", async (req, res) => {
    try {
      const templateData = insertSurveyTemplateSchema.parse({
        ...req.body,
        code: generateSurveyCode(),
      });

      const template = await storage.createSurveyTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      console.error("Error creating survey template:", error);
      res.status(500).json({ message: "Failed to create survey template" });
    }
  });

  app.get("/api/survey-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = await storage.getSurveyTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Survey template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching survey template:", error);
      res.status(500).json({ message: "Failed to fetch survey template" });
    }
  });

  app.get("/api/survey-templates", async (req, res) => {
    try {
      const templates = await storage.getAllSurveyTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching survey templates:", error);
      res.status(500).json({ message: "Failed to fetch survey templates" });
    }
  });

  app.get("/api/survey-templates/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const template = await storage.getSurveyTemplateByCode(code);
      
      if (!template) {
        return res.status(404).json({ message: "Survey template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching survey template by code:", error);
      res.status(500).json({ message: "Failed to fetch survey template" });
    }
  });

  app.get("/api/users/:userId/survey-templates", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const templates = await storage.getSurveyTemplatesByUser(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching user survey templates:", error);
      res.status(500).json({ message: "Failed to fetch survey templates" });
    }
  });

  app.put("/api/survey-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const updates = insertSurveyTemplateSchema.partial().parse(req.body);
      const template = await storage.updateSurveyTemplate(id, updates);
      
      if (!template) {
        return res.status(404).json({ message: "Survey template not found" });
      }

      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      console.error("Error updating survey template:", error);
      res.status(500).json({ message: "Failed to update survey template" });
    }
  });

  app.delete("/api/survey-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const deleted = await storage.deleteSurveyTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Survey template not found" });
      }

      res.json({ message: "Survey template deleted successfully" });
    } catch (error) {
      console.error("Error deleting survey template:", error);
      res.status(500).json({ message: "Failed to delete survey template" });
    }
  });

  // Survey routes
  app.post("/api/surveys", async (req, res) => {
    try {
      const surveyData = insertSurveySchema.omit({ totalCarbonFootprint: true }).parse(req.body);
      const totalCarbon = calculateTotalCarbon(surveyData.responses as Array<{ questionId: string; value: number; carbonEquivalent: number }>);
      
      const survey = await storage.createSurvey({
        ...surveyData,
        totalCarbonFootprint: totalCarbon.toString(),
      });
      
      res.status(201).json(survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid survey data", errors: error.errors });
      }
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  app.get("/api/surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }

      const survey = await storage.getSurvey(id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }

      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  app.get("/api/users/:userId/surveys", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const surveys = await storage.getSurveysByUser(userId);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching user surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.get("/api/survey-templates/:templateId/surveys", async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const surveys = await storage.getSurveysByTemplate(templateId);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching template surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.delete("/api/surveys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }

      const deleted = await storage.deleteSurvey(id);
      if (!deleted) {
        return res.status(404).json({ message: "Survey not found" });
      }

      res.json({ message: "Survey deleted successfully" });
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ message: "Failed to delete survey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
