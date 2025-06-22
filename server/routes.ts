import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, insertNoteSchema, insertNoteCategorySchema, insertRedTeamCommandSchema, insertVulnerabilitySchema } from "@shared/schema";
import { storage } from "./storage";
import { ZodError } from "zod";
import { crawlVulnerabilities } from "./vuln-crawler";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Note categories routes
  app.get("/api/note-categories", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1; // Default user for demo
      const categories = await storage.getNoteCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get note categories" });
    }
  });

  app.post("/api/note-categories", async (req, res) => {
    try {
      console.log('Creating category with data:', req.body);
      const categoryData = insertNoteCategorySchema.parse({
        name: req.body.name,
        parentId: req.body.parentId || null,
        userId: req.body.userId || 1
      });
      const category = await storage.createNoteCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid category data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create category", details: (error as Error).message });
      }
    }
  });

  app.put("/api/note-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertNoteCategorySchema.partial().parse(req.body);
      const category = await storage.updateNoteCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid category data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update category" });
      }
    }
  });

  app.delete("/api/note-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNoteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1; // Default user for demo
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const notes = await storage.getNotes(userId, categoryId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (note) {
        res.json(note);
      } else {
        res.status(404).json({ error: "Note not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      console.log('Creating note with data:', req.body);
      const noteData = insertNoteSchema.parse({
        title: req.body.title,
        content: req.body.content,
        categoryId: req.body.categoryId || null,
        userId: req.body.userId || 1,
        tags: req.body.tags || null
      });
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      console.error('Note creation error:', error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid note data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create note", details: (error as Error).message });
      }
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const noteData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, noteData);
      res.json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid note data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNote(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  app.get("/api/notes/search", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1; // Default user for demo
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const notes = await storage.searchNotes(userId, query);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to search notes" });
    }
  });

  // Red Team Commands routes
  app.get("/api/red-team-commands", async (req, res) => {
    try {
      const { userId, category, subCategory } = req.query;
      console.log('Getting red team commands with params:', { userId, category, subCategory });
      const commands = await storage.getRedTeamCommands(
        userId ? Number(userId) : undefined,
        category as string,
        subCategory as string
      );
      console.log('Found commands:', commands.length);
      res.json(commands);
    } catch (error) {
      console.error("Get red team commands error:", error);
      res.status(500).json({ error: "Failed to get red team commands" });
    }
  });

  app.get("/api/red-team-commands/categories", async (req, res) => {
    try {
      const categories = await storage.getRedTeamCommandCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get red team command categories error:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  app.get("/api/red-team-commands/search", async (req, res) => {
    try {
      const { q, userId } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      const commands = await storage.searchRedTeamCommands(q, userId ? Number(userId) : undefined);
      res.json(commands);
    } catch (error) {
      console.error("Search red team commands error:", error);
      res.status(500).json({ error: "Failed to search commands" });
    }
  });

  app.get("/api/red-team-commands/:id", async (req, res) => {
    try {
      const command = await storage.getRedTeamCommand(Number(req.params.id));
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      console.error("Get red team command error:", error);
      res.status(500).json({ error: "Failed to get command" });
    }
  });

  app.post("/api/red-team-commands", async (req, res) => {
    try {
      console.log('Creating red team command with data:', req.body);
      const commandData = insertRedTeamCommandSchema.parse({
        title: req.body.title,
        code: req.body.code,
        description: req.body.description,
        category: req.body.category,
        subCategory: req.body.subCategory,
        tags: req.body.tags,
        userId: req.body.userId || 1,
        isCustom: req.body.isCustom !== undefined ? req.body.isCustom : true
      });
      const command = await storage.createRedTeamCommand(commandData);
      res.json(command);
    } catch (error) {
      console.error('Red team command creation error:', error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid command data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create command", details: (error as Error).message });
      }
    }
  });

  app.put("/api/red-team-commands/:id", async (req, res) => {
    try {
      const commandData = insertRedTeamCommandSchema.partial().parse(req.body);
      const command = await storage.updateRedTeamCommand(Number(req.params.id), commandData);
      res.json(command);
    } catch (error) {
      console.error("Update red team command error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid command data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update command" });
      }
    }
  });

  app.delete("/api/red-team-commands/:id", async (req, res) => {
    try {
      await storage.deleteRedTeamCommand(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete red team command error:", error);
      res.status(500).json({ error: "Failed to delete command" });
    }
  });
 
  // Vulnerabilities routes
  app.get("/api/vulnerabilities", async (req, res) => {
    try {
      const { userId, severity, source } = req.query;
      const vulnerabilities = await storage.getVulnerabilities(
        userId ? Number(userId) : undefined,
        severity as string,
        source as string
      );
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Get vulnerabilities error:", error);
      res.status(500).json({ error: "Failed to get vulnerabilities" });
    }
  });

  app.get("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerability = await storage.getVulnerability(Number(req.params.id));
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      console.error("Get vulnerability error:", error);
      res.status(500).json({ error: "Failed to get vulnerability" });
    }
  });

  app.post("/api/vulnerabilities", async (req, res) => {
    try {
      console.log('Creating vulnerability with data:', req.body);
      const vulnerabilityData = insertVulnerabilitySchema.parse({
        title: req.body.title,
        description: req.body.description,
        cveId: req.body.cveId || null,
        severity: req.body.severity,
        publishedDate: new Date(req.body.publishedDate),
        source: req.body.source,
        url: req.body.url,
        userId: req.body.userId || null,
      });
      const vulnerability = await storage.createVulnerability(vulnerabilityData);
      res.json(vulnerability);
    } catch (error) {
      console.error('Vulnerability creation error:', error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid vulnerability data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create vulnerability", details: (error as Error).message });
      }
    }
  });

  app.put("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerabilityData = insertVulnerabilitySchema.partial().parse(req.body);
      const vulnerability = await storage.updateVulnerability(Number(req.params.id), vulnerabilityData);
      res.json(vulnerability);
    } catch (error) {
      console.error("Update vulnerability error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid vulnerability data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update vulnerability" });
      }
    }
  });

  app.delete("/api/vulnerabilities/:id", async (req, res) => {
    try {
      await storage.deleteVulnerability(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete vulnerability error:", error);
      res.status(500).json({ error: "Failed to delete vulnerability" });
    }
  });

  app.get("/api/vulnerabilities/search", async (req, res) => {
    try {
      const { q, userId } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      const vulnerabilities = await storage.searchVulnerabilities(q, userId ? Number(userId) : undefined);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Search vulnerabilities error:", error);
      res.status(500).json({ error: "Failed to search vulnerabilities" });
    }
  });

  app.get("/api/vulnerabilities/sources", async (req, res) => {
    try {
      const sources = await storage.getVulnerabilitySources();
      res.json(sources);
    } catch (error) {
      console.error("Get vulnerability sources error:", error);
      res.status(500).json({ error: "Failed to get sources" });
    }
  });

  app.get("/api/vulnerabilities/severities", async (req, res) => {
    try {
      const severities = await storage.getVulnerabilitySeverities();
      res.json(severities);
    } catch (error) {
      console.error("Get vulnerability severities error:", error);
      res.status(500).json({ error: "Failed to get severities" });
    }
  });

  app.post("/api/vulnerabilities/crawl", async (req, res) => {
    try {
      const { source } = req.body;
      if (!source) {
        return res.status(400).json({ error: "Source parameter is required" });
      }
      await crawlVulnerabilities(source);
      res.json({ success: true, message: `Vulnerabilities from ${source} crawled successfully.` });
    } catch (error) {
      console.error("Vulnerability crawl error:", error);
      res.status(500).json({ error: "Failed to crawl vulnerabilities" });
    }
  });
 
   const httpServer = createServer(app);
 
   return httpServer;
 }
