import * as SQLite from "expo-sqlite";

// Open database connection
const openDatabase = async () => {
  return SQLite.openDatabaseAsync("little_lemon.db");
};

// Initialize database with schema
export const initializeDB = async () => {
  try {
    const db = await openDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT NOT NULL
      );
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("DB initialization failed:", error);
    throw error;
  }
};

// Fetch distinct categories from database
export const getCategories = async () => {
  try {
    const db = await openDatabase();
    const result = await db.getAllAsync(
      "SELECT DISTINCT category FROM menu ORDER BY category;"
    );
    return result.map((item) => item.category);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Filter menu items by selected categories
export const filterByCategories = async (categories) => {
  if (!categories.length) return getAllMenuItems();

  try {
    const db = await openDatabase();
    const placeholders = categories.map(() => "?").join(",");
    const query = `
      SELECT * FROM menu 
      WHERE category IN (${placeholders}) 
      ORDER BY name;
    `;

    return await db.getAllAsync(query, categories);
  } catch (error) {
    console.error("Filter error:", error);
    return [];
  }
};

// Get all menu items
export const getAllMenuItems = async () => {
  try {
    const db = await openDatabase();
    return await db.getAllAsync("SELECT * FROM menu ORDER BY name;");
  } catch (error) {
    console.error("Error fetching all items:", error);
    return [];
  }
};

// Insert menu items from API
export const syncMenuData = async (menuItems) => {
  try {
    const db = await openDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM menu;");
      for (const item of menuItems) {
        await db.runAsync(
          `INSERT INTO menu 
          (name, description, price, image, category) 
          VALUES (?, ?, ?, ?, ?);`,
          [item.name, item.description, item.price, item.image, item.category]
        );
      }
    });
    console.log("Data sync complete");
  } catch (error) {
    console.error("Data sync failed:", error);
    throw error;
  }
}; // database.js - Add this new function
export const searchMenuItems = async (searchTerm, categories = []) => {
  try {
    const db = await openDatabase();
    let queryParams = [];
    let whereClauses = [];

    if (categories.length > 0) {
      whereClauses.push(`category IN (${categories.map(() => "?").join(",")})`);
      queryParams.push(...categories);
    }

    if (searchTerm) {
      whereClauses.push("name LIKE '%' || ? || '%' COLLATE NOCASE");
      queryParams.push(searchTerm);
    }

    let query = "SELECT * FROM menu";
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    query += " ORDER BY name;";

    return await db.getAllAsync(query, queryParams);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
