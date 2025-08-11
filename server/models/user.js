const db = require("../config/db");
const bcrypt = require("bcrypt");

console.log(
  "User model loaded - Version with findByPseudo method (reinforced)"
);

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      // Nettoyer l'email pour éviter les problèmes d'espaces
      const cleanEmail = email ? email.trim() : email;
      console.log(`Looking up user by email: ${cleanEmail}`);
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        cleanEmail,
      ]);
      if (rows.length > 0) {
        console.log(`User found with email: ${email}`);
        return rows[0];
      } else {
        console.log(`No user found with email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error("Error finding user by email:", error);
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.error("Users table does not exist in database");
      } else if (error.sqlMessage) {
        console.error("SQL error message:", error.sqlMessage);
      }
      throw error;
    }
  }

  // Find user by pseudo - Method reinforced to ensure availability
  static async findByPseudo(pseudo) {
    try {
      console.log(`🔍 Looking up user by pseudo: "${pseudo}" (reinforced method)`);
      
      if (!pseudo) {
        console.log("⚠️ Pseudo is null or empty");
        return null;
      }
      
      const trimmedPseudo = pseudo.trim();
      if (trimmedPseudo === '') {
        console.log("⚠️ Pseudo is empty after trim");
        return null;
      }
      
      console.log(`📊 Executing query for pseudo: "${trimmedPseudo}"`);
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        trimmedPseudo,
      ]);
      
      console.log(`📊 Query result: ${rows.length} row(s) found`);
      
      if (rows.length > 0) {
        console.log(`✅ User found with pseudo: "${trimmedPseudo}" - ID: ${rows[0].id}`);
        return rows[0];
      } else {
        console.log(`✅ No user found with pseudo: "${trimmedPseudo}" - Available!`);
        return null;
      }
    } catch (error) {
      console.error("❌ Error in findByPseudo:", error);
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.error("Users table does not exist in database");
      } else if (error.sqlMessage) {
        console.error("SQL error message:", error.sqlMessage);
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id, includePassword = false) {
    try {
      console.log(
        "Finding user by ID:",
        id,
        includePassword ? "(including password)" : ""
      );
      const columns = includePassword
        ? "id, email, firstName, lastName, role, password, avatar, isPresetAvatar, pseudo, created_at"
        : "id, email, firstName, lastName, role, avatar, isPresetAvatar, pseudo, created_at";

      const [rows] = await db.query(
        `SELECT ${columns} FROM users WHERE id = ?`,
        [id]
      );
      console.log(
        "Found user:",
        rows[0]
          ? {
              ...rows[0],
              password: rows[0].password ? "[PRESENT]" : "[NOT PRESENT]",
              avatar: rows[0].avatar ? "[PRESENT]" : "[NOT PRESENT]",
            }
          : "None"
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  // Get all users (without passwords)
  static async getAll() {
    try {
      console.log("Retrieving all users from database");
      const [rows] = await db.query(`
        SELECT 
          id, 
          email, 
          firstName, 
          lastName, 
          role, 
          avatar, 
          isPresetAvatar, 
          pseudo, 
          created_at
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log(`Found ${rows.length} users in database`);
      return rows;
    } catch (error) {
      console.error("Error retrieving all users:", error);
      throw error;
    }
  }

  // Get users with pagination
  static async getAllWithPagination(limit = 5, offset = 0) {
    try {
      console.log(`Retrieving users with pagination: limit=${limit}, offset=${offset}`);
      
      // Compter le nombre total d'utilisateurs
      const [countResult] = await db.query(`SELECT COUNT(*) as total FROM users`);
      const total = countResult[0].total;
      
      // Récupérer les utilisateurs avec pagination
      const [rows] = await db.query(`
        SELECT 
          id, 
          email, 
          firstName, 
          lastName, 
          role, 
          avatar, 
          isPresetAvatar, 
          pseudo, 
          created_at
        FROM users 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      console.log(`Found ${rows.length} users out of ${total} total users`);
      
      return {
        users: rows,
        total: total,
        hasMore: (offset + limit) < total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Error retrieving users with pagination:", error);
      throw error;
    }
  }

  // Create a new user
  static async create(userData) {
    // Ne pas re-hasher le mot de passe, il est déjà hashé dans le contrôleur
    const pseudo =
      userData.pseudo ||
      userData.firstName.toLowerCase().replace(/\s+/g, "_");
    console.log(
      `Inserting new user into database: ${
        userData.email
      }, pseudo: ${pseudo}, role: ${userData.role || "user"}`
    );

    const [result] = await db.query(
      "INSERT INTO users (firstName, lastName, email, pseudo, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userData.firstName,
        userData.lastName,
        userData.email,
        pseudo,
        userData.password,
        userData.role || "user",
      ]
    );
    return { id: result.insertId, ...userData };
  }
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      console.log("Verifying password");

      // Vérifier que les arguments sont valides pour éviter l'erreur "data and hash arguments required"
      if (!plainPassword || typeof plainPassword !== "string") {
        console.error("Invalid plain password provided:", plainPassword);
        return false;
      }

      if (!hashedPassword || typeof hashedPassword !== "string") {
        console.error("Invalid hashed password provided");
        return false;
      }

      // Longueur minimale pour un hash bcrypt valide
      const MIN_BCRYPT_LENGTH = 60;
      if (hashedPassword.length < MIN_BCRYPT_LENGTH) {
        console.error(
          `Hashed password is too short (${hashedPassword.length} chars). Minimum required: ${MIN_BCRYPT_LENGTH}`
        );
        return false;
      }
      
      console.log(`Vérification du mot de passe avec bcrypt.compare`);
      console.log(`- Longueur du mot de passe en clair: ${plainPassword.length} caractères`);
      console.log(`- Longueur du hash: ${hashedPassword.length} caractères`);
      console.log(`- Format du hash: ${hashedPassword.substring(0, 7)}...`);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(
        `Password verification result: ${isValid ? "valid" : "invalid"}`
      );
      return isValid;
    } catch (error) {
      console.error("Error verifying password:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      
      if (
        error.message &&
        error.message.includes("data and hash arguments required")
      ) {
        console.error(
          "Invalid arguments for bcrypt.compare - plainPassword or hashedPassword might be undefined or null"
        );
      }
      return false; // Retourner false au lieu de propager l'erreur pour une meilleure expérience utilisateur
    }
  }
  // Update user
  static async update(id, userData) {
    try {
      console.log("📝 Updating user data:", { 
        id, 
        userData: {
          ...userData,
          pseudo: userData.pseudo ? `"${userData.pseudo}"` : 'null'
        }
      });
      
      let query = "UPDATE users SET ";
      const values = [];
      const fields = [];

      if (userData.firstName !== undefined) {
        fields.push("firstName = ?");
        values.push(userData.firstName);
      }
      if (userData.lastName !== undefined) {
        fields.push("lastName = ?");
        values.push(userData.lastName);
      }
      if (userData.email !== undefined) {
        fields.push("email = ?");
        values.push(userData.email);
      }
      if (userData.pseudo !== undefined) {
        fields.push("pseudo = ?");
        values.push(userData.pseudo);
        console.log(`📝 Pseudo will be updated to: "${userData.pseudo}"`);
      }
      if (userData.avatar !== undefined) {
        fields.push("avatar = ?");
        values.push(userData.avatar);
      }
      if (userData.avatarColor !== undefined) {
        fields.push("avatarColor = ?");
        values.push(userData.avatarColor);
      }
      if (userData.avatarInitials !== undefined) {
        fields.push("avatarInitials = ?");
        values.push(userData.avatarInitials);
      }
      if (userData.isPresetAvatar !== undefined) {
        fields.push("isPresetAvatar = ?");
        values.push(userData.isPresetAvatar);
      }

      if (fields.length === 0) {
        console.log("⚠️ No fields to update");
        return false;
      }

      query += fields.join(", ") + " WHERE id = ?";
      values.push(id);

      console.log("📊 Update query:", query);
      console.log("📊 Update values:", values.map((v, i) => 
        fields[i] && fields[i].includes('pseudo') ? `"${v}"` : v
      ));

      const [result] = await db.query(query, values);
      console.log("📊 Update result:", {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });

      if (result.affectedRows > 0) {
        // Récupérer l'utilisateur mis à jour
        const updatedUser = await this.findById(id);
        console.log("✅ User successfully updated:", {
          id: updatedUser.id,
          pseudo: updatedUser.pseudo
        });
        return updatedUser;
      } else {
        console.log("⚠️ No rows affected - user not found or no changes");
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }

  // Change password
  static async changePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const [result] = await db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // Ajoute une méthode pour mettre à jour le mot de passe d'un utilisateur
  static async updatePasswordByEmail(email, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    return result.affectedRows > 0;
  }
}

// Réexporter explicitement la méthode findByPseudo pour éviter les problèmes
User.findByPseudo =
  User.findByPseudo ||
  async function (pseudo) {
    console.log(`Fallback findByPseudo called with pseudo: ${pseudo}`);
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        pseudo,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in fallback findByPseudo:", error);
      throw error;
    }
  };

// Vérifier que toutes les méthodes essentielles sont bien définies avant d'exporter
console.log("Checking User model methods before export:");
console.log(
  "- findByEmail:",
  typeof User.findByEmail === "function" ? "OK" : "MISSING"
);
console.log(
  "- findByPseudo:",
  typeof User.findByPseudo === "function" ? "OK" : "MISSING"
);
console.log("- create:", typeof User.create === "function" ? "OK" : "MISSING");
console.log("- getAll:", typeof User.getAll === "function" ? "OK" : "MISSING");
console.log("- getAllWithPagination:", typeof User.getAllWithPagination === "function" ? "OK" : "MISSING");

module.exports = User;
