import { 
  users, 
  notes, 
  noteCategories,
  redTeamCommands,
  type User, 
  type InsertUser,
  type Note,
  type InsertNote,
  type NoteCategory,
  type InsertNoteCategory,
  type RedTeamCommand,
  type InsertRedTeamCommand
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
  
  // Red Team Commands
  getRedTeamCommands(userId?: number, category?: string, subCategory?: string): Promise<RedTeamCommand[]>;
  getRedTeamCommand(id: number): Promise<RedTeamCommand | undefined>;
  createRedTeamCommand(command: InsertRedTeamCommand): Promise<RedTeamCommand>;
  updateRedTeamCommand(id: number, command: Partial<InsertRedTeamCommand>): Promise<RedTeamCommand>;
  deleteRedTeamCommand(id: number): Promise<void>;
  searchRedTeamCommands(query: string, userId?: number): Promise<RedTeamCommand[]>;
  getRedTeamCommandCategories(): Promise<{category: string, subCategories: string[]}[]>;
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

  // Red Team Commands implementation
  async getRedTeamCommands(userId?: number, category?: string, subCategory?: string): Promise<RedTeamCommand[]> {
    try {
      console.log('Storage: getRedTeamCommands called with:', { userId, category, subCategory });
      
      let whereConditions = [];
      
      if (category) {
        whereConditions.push(eq(redTeamCommands.category, category));
      }
      if (subCategory) {
        whereConditions.push(eq(redTeamCommands.subCategory, subCategory));
      }
      
      let query = db.select().from(redTeamCommands);
      
      if (whereConditions.length > 0) {
        query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions as any)) as any;
      }
      
      const results = await query.orderBy(redTeamCommands.category, redTeamCommands.subCategory);
      console.log('Storage: Found raw results:', results.length);
      
      let filteredResults;
      if (userId) {
        filteredResults = results.filter(cmd => !cmd.isCustom || cmd.userId === userId);
      } else {
        filteredResults = results.filter(cmd => !cmd.isCustom);
      }
      
      console.log('Storage: After filtering:', filteredResults.length);
      return filteredResults;
    } catch (error) {
      console.error('Storage: Error in getRedTeamCommands:', error);
      throw error;
    }
  }

  async getRedTeamCommand(id: number): Promise<RedTeamCommand | undefined> {
    const [command] = await db
      .select()
      .from(redTeamCommands)
      .where(eq(redTeamCommands.id, id));
    return command || undefined;
  }

  async createRedTeamCommand(command: InsertRedTeamCommand): Promise<RedTeamCommand> {
    const now = new Date();
    try {
      const [newCommand] = await db
        .insert(redTeamCommands)
        .values({
          title: command.title,
          code: command.code,
          description: command.description || null,
          category: command.category,
          subCategory: command.subCategory,
          tags: command.tags || null,
          userId: command.userId || 1,
          isCustom: command.isCustom || false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return newCommand;
    } catch (error) {
      console.error('Error creating red team command:', error);
      throw error;
    }
  }

  async updateRedTeamCommand(id: number, command: Partial<InsertRedTeamCommand>): Promise<RedTeamCommand> {
    const [updatedCommand] = await db
      .update(redTeamCommands)
      .set({
        ...command,
        updatedAt: new Date(),
      })
      .where(eq(redTeamCommands.id, id))
      .returning();
    
    if (!updatedCommand) {
      throw new Error('Command not found');
    }
    
    return updatedCommand;
  }

  async deleteRedTeamCommand(id: number): Promise<void> {
    await db
      .delete(redTeamCommands)
      .where(eq(redTeamCommands.id, id));
  }

  async searchRedTeamCommands(query: string, userId?: number): Promise<RedTeamCommand[]> {
    const searchResults = await db
      .select()
      .from(redTeamCommands)
      .where(
        or(
          like(redTeamCommands.title, `%${query}%`),
          like(redTeamCommands.code, `%${query}%`),
          like(redTeamCommands.description, `%${query}%`),
          like(redTeamCommands.tags, `%${query}%`)
        )
      )
      .orderBy(redTeamCommands.category, redTeamCommands.subCategory);
    
    if (userId) {
      return searchResults.filter(cmd => !cmd.isCustom || cmd.userId === userId);
    }
    
    return searchResults.filter(cmd => !cmd.isCustom);
  }

  async getRedTeamCommandCategories(): Promise<{category: string, subCategories: string[]}[]> {
    const results = await db
      .select({
        category: redTeamCommands.category,
        subCategory: redTeamCommands.subCategory
      })
      .from(redTeamCommands)
      .groupBy(redTeamCommands.category, redTeamCommands.subCategory)
      .orderBy(redTeamCommands.category, redTeamCommands.subCategory);
    
    const categoryMap = new Map<string, Set<string>>();
    
    results.forEach(({ category, subCategory }) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Set());
      }
      categoryMap.get(category)!.add(subCategory);
    });
    
    return Array.from(categoryMap.entries()).map(([category, subCategories]) => ({
      category,
      subCategories: Array.from(subCategories)
    }));
  }
}

export const storage = new DatabaseStorage();
