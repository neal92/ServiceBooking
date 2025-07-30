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
      console.log(`Looking up user by pseudo: ${pseudo} (reinforced method)`);
      const [rows] = await db.query("SELECT * FROM users WHERE pseudo = ?", [
        pseudo,
      ]);
      if (rows.length > 0) {
        console.log(`User found with pseudo: ${pseudo}`);
        return rows[0];
      } else {
        console.log(`No user found with pseudo: ${pseudo}`);
        return null;
      }
    } catch (error) {
      console.error("Error finding user by pseudo:", error);
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
        ? "id, email, firstName, lastName, role, password, avatar, isPresetAvatar, created_at"
        : "id, email, firstName, lastName, role, avatar, isPresetAvatar, created_at";

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
  // Create a new user
  static async create(userData) {
    try {
      console.log(`Hashing password for user: ${userData.email}`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Utiliser le pseudo fourni ou en générer un basé sur le prénom
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
          hashedPassword,
          userData.role || "user",
        ]
      );

      console.log(`User created with ID: ${result.insertId}`);

      // Récupérer l'utilisateur complet après création pour le retourner
      const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [
        result.insertId,
      ]);
      if (userRows.length > 0) {
        // Exclure le mot de passe hashé
        const user = userRows[0];
        delete user.password;
        console.log("Returning complete user object after creation");
        return user;
      }

      return {
        id: result.insertId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        pseudo: pseudo,
        role: userData.role || "user",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "ER_DUP_ENTRY") {
        // Déterminer quel champ est en doublon pour donner un message précis
        if (error.sqlMessage && error.sqlMessage.includes("email")) {
          console.error("Duplicate email entry found in database");
          throw new Error("Cette adresse email est déjà utilisée.");
        } else if (error.sqlMessage && error.sqlMessage.includes("pseudo")) {
          console.error("Duplicate pseudo found in database");
          throw new Error("Ce pseudo est déjà utilisé.");
        } else {
          console.error("Duplicate entry found in database");
          throw new Error("Un utilisateur avec ces informations existe déjà.");
        }
      } else if (error.code === "ER_NO_SUCH_TABLE") {
        console.error("Users table does not exist in database");
        throw new Error("Erreur de configuration de la base de données.");
      } else if (error.sqlMessage) {
        console.error("SQL error message:", error.sqlMessage);
      }
      throw error;
    }
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
      console.log("Updating user data:", { id, ...userData });
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
      }
      if (userData.avatar !== undefined) {
        fields.push("avatar = ?");
        values.push(userData.avatar);
      }
      if (userData.isPresetAvatar !== undefined) {
        fields.push("isPresetAvatar = ?");
        values.push(userData.isPresetAvatar);
      }

      if (fields.length === 0) {
        console.log("No fields to update");
        return false;
      }

      query += fields.join(", ") + " WHERE id = ?";
      values.push(id);

      console.log("Update query:", query);
      console.log("Update values:", values);

      const [result] = await db.query(query, values);
      console.log("Update result:", {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
      });

      if (result.affectedRows > 0) {
        // Récupérer l'utilisateur mis à jour
        const updatedUser = await this.findById(id);
        return updatedUser;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error updating user:", error);
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

module.exports = User;
