const db = require('../config/db');

class User {
  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase().trim());
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static create({ name, email, password, role = 'customer' }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name.trim(), email.toLowerCase().trim(), password, role);
    return this.findById(info.lastInsertRowid);
  }

  static getAll(limit = 50) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT ?');
    return stmt.all(limit);
  }

  static count() {
    return db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  }
}

module.exports = User;
