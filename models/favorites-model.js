const pool = require("../database/");

module.exports = {
  async addFavorite(account_id, inv_id) {
    try {
      const sql = `
        INSERT INTO favorites (account_id, inv_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await pool.query(sql, [account_id, inv_id]);
      return result.rows[0];
    } catch (err) {
      console.error("addFavorite error:", err);
      throw err;
    }
  },

  async getFavoritesByAccount(account_id) {
    try {
      const sql = `
        SELECT f.favorite_id, f.date_saved, i.inv_make, i.inv_model, i.inv_year, i.inv_price
        FROM favorites f
        JOIN inventory i ON f.inv_id = i.inv_id
        WHERE f.account_id = $1
        ORDER BY f.date_saved DESC;
      `;
      const result = await pool.query(sql, [account_id]);
      return result.rows;
    } catch (err) {
      console.error("getFavoritesByAccount error:", err);
      throw err;
    }
  },

  async removeFavorite(favorite_id, account_id) {
    try {
      const sql = `DELETE FROM favorites WHERE favorite_id = $1 AND account_id = $2`;
      const result = await pool.query(sql, [favorite_id, account_id]);
      return result.rowCount;
    } catch (err) {
      console.error("removeFavorite error:", err);
      throw err;
    }
  },

  async isFavorite(account_id, inv_id) {
  const sql = `SELECT 1 FROM favorites WHERE account_id = $1 AND inv_id = $2 LIMIT 1`;
  const result = await pool.query(sql, [account_id, inv_id]);
  return result.rowCount > 0;
}




};
