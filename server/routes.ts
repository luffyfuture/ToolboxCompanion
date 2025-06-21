import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, insertNoteSchema, insertNoteCategorySchema } from "@shared/schema";
import { storage } from "./storage";
import { ZodError } from "zod";

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
      const categoryData = insertNoteCategorySchema.parse({
        ...req.body,
        userId: req.body.userId || 1 // Default user for demo
      });
      const category = await storage.createNoteCategory(categoryData);
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid category data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create category" });
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
      const noteData = insertNoteSchema.parse({
        ...req.body,
        userId: req.body.userId || 1 // Default user for demo
      });
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid note data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create note" });
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

  const httpServer = createServer(app);

  return httpServer;
}
