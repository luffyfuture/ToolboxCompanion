import { 
  users, 
  notes, 
  noteCategories,
  type User, 
  type InsertUser,
  type Note,
  type InsertNote,
  type NoteCategory,
  type InsertNoteCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Note categories
  getNoteCategories(userId: number): Promise<NoteCategory[]>;
  getNoteCategory(id: number): Promise<NoteCategory | undefined>;
  createNoteCategory(category: InsertNoteCategory): Promise<NoteCategory>;
  updateNoteCategory(id: number, category: Partial<InsertNoteCategory>): Promise<NoteCategory>;
  deleteNoteCategory(id: number): Promise<void>;
  
  // Notes
  getNotes(userId: number, categoryId?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number): Promise<void>;
  searchNotes(userId: number, query: string): Promise<Note[]>;
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

  // Note categories
  async getNoteCategories(userId: number): Promise<NoteCategory[]> {
    return await db
      .select()
      .from(noteCategories)
      .where(eq(noteCategories.userId, userId))
      .orderBy(asc(noteCategories.name));
  }

  async getNoteCategory(id: number): Promise<NoteCategory | undefined> {
    const [category] = await db
      .select()
      .from(noteCategories)
      .where(eq(noteCategories.id, id));
    return category || undefined;
  }

  async createNoteCategory(category: InsertNoteCategory): Promise<NoteCategory> {
    const now = new Date();
    try {
      const [newCategory] = await db
        .insert(noteCategories)
        .values({
          name: category.name,
          parentId: category.parentId || null,
          userId: category.userId || 1,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return newCategory;
    } catch (error) {
      console.error('Error creating note category:', error);
      throw error;
    }
  }

  async updateNoteCategory(id: number, category: Partial<InsertNoteCategory>): Promise<NoteCategory> {
    const [updatedCategory] = await db
      .update(noteCategories)
      .set({
        ...category,
        updatedAt: new Date(),
      })
      .where(eq(noteCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteNoteCategory(id: number): Promise<void> {
    await db.delete(noteCategories).where(eq(noteCategories.id, id));
  }

  // Notes
  async getNotes(userId: number, categoryId?: number): Promise<Note[]> {
    if (categoryId) {
      return await db
        .select()
        .from(notes)
        .where(and(eq(notes.userId, userId), eq(notes.categoryId, categoryId)))
        .orderBy(desc(notes.updatedAt));
    }
    
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const now = new Date();
    try {
      const [newNote] = await db
        .insert(notes)
        .values({
          title: note.title,
          content: note.content,
          categoryId: note.categoryId || null,
          userId: note.userId || 1,
          tags: note.tags || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note> {
    const [updatedNote] = await db
      .update(notes)
      .set({
        ...note,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          or(
            like(notes.title, `%${query}%`),
            like(notes.content, `%${query}%`)
          )
        )
      )
      .orderBy(desc(notes.updatedAt));
  }
}

export const storage = new DatabaseStorage();
