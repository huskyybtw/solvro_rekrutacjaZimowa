const express = require("express");
const router = express.Router();
const { cocktailSchema, ingredientSchema } = require("../validator");
const pool = require("../db");

router.get("/", async (req,res) => {
    try {
        const result = await pool.query("SELECT * FROM ingredients");
        return res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ error: "Server Error" });
    }
});

router.get("/read/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Incorrect ID" });
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ error: "Server Error" });
    }
});

router.post("/create", async (req, res) => {

    let alcoholValue;
    if (req.body.alcohol !== undefined) {
        try {
            alcoholValue = JSON.parse(req.body.alcohol);
        } catch (parseError) {
            console.error("Error parsing alcohol:", parseError.message);
            return res.status(400).json({ error: "Invalid format for alcohol" });
        }
    }

    const ingredient = { 
        name : req.body.name,
        description : req.body.description,
        alcohol: alcoholValue,
    };

    const { error: ingredientError, value: ingredientValue } = ingredientSchema.validate(ingredient);
    if(ingredientError) {
        return res.status(400).json({ error: ingredientError.message });
    }

    try {
        const insertQuery = "INSERT INTO ingredients (name, description, alcohol, picture) VALUES ($1, $2, $3, $4)";
        const result = await pool.query(insertQuery, [ingredient.name, ingredient.description, ingredient.alcohol, ingredient.picture]);
        if (result.rowCount === 0) {
            return res.status(400).json({ error: "Failed to create ingredient" });
        };

        return res.status(200).json({ message: "Ingredient created" });
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ error: "Server Error" });
    }
});

router.put("/update/:id", async (req, res) => {

    const id = req.params.id;
    const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);
    if (result.rows.length === 0) {
        return res.status(400).json({ error: "Incorrect ID" });
    }

    let alcoholValue;
    if (req.body.alcohol !== undefined) {
        try {
            alcoholValue = JSON.parse(req.body.alcohol);
        } catch (parseError) {
            console.error("Error parsing alcohol:", parseError.message);
            return res.status(400).json({ error: "Invalid format for alcohol" });
        }
    }

    const ingredient = { 
        name : req.body.name,
        description : req.body.description,
        alcohol: alcoholValue,
    };

    const {ingredientError, ingredientValue} = ingredientSchema.validate(ingredient);
    if(ingredientError) {
        return res.status(400).json({ error: ingredientError.message });
    }
  try {
        const updateQuery = "UPDATE ingredients SET name = $1, description = $2, alcohol = $3 WHERE id = $4";
        const updateResult = await pool.query(updateQuery, [ingredient.name, ingredient.description, ingredient.alcohol, id]);
        if (updateResult.rowCount === 0) {
            return res.status(400).json({ error: "Failed to update ingredient" });
        };

        try{
            const selectQuery = "SELECT * FROM cocktail_ingredients WHERE ingredient_id = $1";
            const selectResult = await pool.query(selectQuery, [id]);

            if (selectResult.rows.length !== 0) {
                const deleteQuery = "DELETE FROM cocktail_ingredients WHERE ingredient_id = $1";
                const deleteResult = await pool.query(deleteQuery, [id]);

                if (deleteResult.rowCount === 0) {
                    return res.status(400).json({ error: "Failed to delete ingredient from cocktail_ingredients" });
                };

            };} catch (selectError) {
                console.error(selectError.message);
                return res.status(400).json({ error: "Failed to retrieve cocktail ingredients" });
        }

      return res.status(200).json({ message: "Ingredient updated" });
  } catch (error) {
      console.error(error.message);
      return res.status(400).json({ error: "Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Incorrect ID" });
        }

        const deleteQuery = "DELETE FROM ingredients WHERE id = $1";
        const deleteResult = await pool.query(deleteQuery, [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(400).json({ error: "Failed to delete ingredient" });
        }

        try{
            const selectQuery = "SELECT * FROM cocktail_ingredients WHERE ingredient_id = $1";
            const selectResult = await pool.query(selectQuery, [id]);

            if (selectResult.rows.length !== 0) {
                const deleteQuery = "DELETE FROM cocktail_ingredients WHERE ingredient_id = $1";
                const deleteResult = await pool.query(deleteQuery, [id]);

                if (deleteResult.rowCount === 0) {
                    return res.status(400).json({ error: "Failed to delete ingredient from cocktail_ingredients" });
                };
                
            };} catch (selectError) {
                console.error(selectError.message);
                return res.status(400).json({ error: "Failed to retrieve cocktail ingredients" });
        }

        return res.status(200).json({ message: "Ingredient deleted" });
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ error: "Server Error" });
    }
});
module.exports = router;