const db = require('../config/db');

class Product {
  static findAll({ category, search, sort = 'featured', limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim() !== '') {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // Securely whitelist sorting orders
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'name_asc':
        query += ' ORDER BY name ASC';
        break;
      case 'newest':
        query += ' ORDER BY id DESC';
        break;
      default:
        query += ' ORDER BY featured DESC, id DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static findFeatured(limit = 4) {
    const stmt = db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY id DESC LIMIT ?');
    return stmt.all(limit);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id);
  }

  static findBySlug(slug) {
    const stmt = db.prepare('SELECT * FROM products WHERE slug = ?');
    return stmt.get(slug);
  }

  static getCategories() {
    const stmt = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC');
    return stmt.all().map(r => r.category);
  }

  static create({ name, slug, description, price, stock, category, image_url, featured = 0 }) {
    const stmt = db.prepare(`
      INSERT INTO products (name, slug, description, price, stock, category, image_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, slug, description, Number(price), parseInt(stock, 10), category, image_url, featured ? 1 : 0);
    return this.findById(info.lastInsertRowid);
  }

  static update(id, { name, slug, description, price, stock, category, image_url, featured }) {
    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, slug = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, slug, description, Number(price), parseInt(stock, 10), category, image_url, featured ? 1 : 0, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  }

  static count() {
    return db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  }
}

module.exports = Product;
