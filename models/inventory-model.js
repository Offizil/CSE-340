const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}
// //  modified -----
// async function getClassifications() {
//   const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
//   return data.rows
// }


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// function to retreive data for specific vehicle
// here we go
async function getVehicleById(inv_id) {
  // return db.one("SELECT * FROM inventory WHERE inv_id = $1", [inv_id]);
  try {
    const data = await pool.query(
     "SELECT * FROM inventory WHERE inv_id = $1", 
     [inv_id]
    )
    return data.rows
  } catch (error) {
    console.log("Querying for vehicle with ID", inv_id)
    console.error("getVehicleById error " + error)
  }
}

async function  addClassification(classification_name) {
  try {
    const result = await pool.query(
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING * ",
      [classification_name],
      
    );

    console.log("Inserted classification:", result.rows[0]);
    return result.rows[0] // here we go, me and chat
  } catch (error) {
    console.error("Error adding classification", error)
    throw error;
  }
  
}



async function addNewInventory( 
  inv_make, 
  inv_model, 
  inv_year, 
  inv_description, 
  inv_image,
  inv_miles, 
  inv_thumbnail,
  inv_price, 
  inv_color,
  classification_id
) {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image,
        inv_miles, 
        inv_thumbnail,
        inv_price, 
        inv_color,
        classification_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;
    `
  
    const values = [
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_image,
      inv_miles, 
      inv_thumbnail,
      inv_price, 
      inv_color,
      classification_id
    ]

    const result = await pool.query(sql, values)
    return result.rows[0]
    
  } catch (error) {
    console.error("Error inserting inventory:", error.message, error.stack)
    throw error // ✅ re-throw the error to handle in the controller
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addNewInventory};