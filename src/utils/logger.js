const db = require('../config/db');

function logSecurityEvent(eventType, userId = null, ip = 'unknown', details = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (event_type, user_id, ip_address, details)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(eventType, userId, ip, String(details));
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = {
  logSecurityEvent
};
