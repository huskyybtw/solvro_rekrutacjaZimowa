const express = require("express");
const router = express.Router();
const { cocktailSchema, ingredientSchema } = require("../validator");
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cocktails");
        let cocktails = result.rows;

        // Merge ingredients with cocktails
        cocktails = await Promise.all(cocktails.map(async (cocktail) => {
            const ingredientsResult = await pool.query("SELECT ingredient_id, amount FROM cocktail_ingredients WHERE cocktail_id = $1", [cocktail.id]);
            const ingredients = ingredientsResult.rows;
            return { ...cocktail, ingredients };
        }));

        res.status(200).json(cocktails);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: "Server Error" });
    }
});

router.get("/read/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM cocktails WHERE id = $1", [id]);
        let cocktails = result.rows;

        // Merge ingredients with cocktails
        cocktails = await Promise.all(cocktails.map(async (cocktail) => {
            const ingredientsResult = await pool.query("SELECT ingredient_id, amount FROM cocktail_ingredients WHERE cocktail_id = $1", [cocktail.id]);
            const ingredients = ingredientsResult.rows;
            return { ...cocktail, ingredients };
        }));

        if (cocktails.length === 0) {
            return res.status(400).json({ error: "Incorrect ID" });
        }

        res.json(cocktails);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: "Server Error" });
    }
});

router.post("/create", async (req, res) => {
    // Validate request body
    const category = req.body.category;
    if (category === undefined) {
        return res.status(400).json({ error: "Category is required" });
    }

    // Find category ID
    const categoryQuery = "SELECT id FROM categories WHERE type = $1";
    const categoryResult = await pool.query(categoryQuery, [category]);
    if (categoryResult.rows.length === 0) {
        return res.status(400).json({ error: `Incorrect category = ${req.body.category}` });
    }

    const cocktail = {
        name: req.body.name,
        instruction: req.body.instruction,
        category: categoryResult.rows[0].id
    };

    // Ingredient list
    const ingredients = [];
    for (let i = 0; i < Object.keys(req.body).length; i++) {
        const ingredientId = parseInt(req.body[`ingredient${i}`]);
        const amount = parseInt(req.body[`amount${i}`]);
        if (ingredientId && amount) {
            ingredients.push({ id: ingredientId, amount: amount });
        }
    }

    if (ingredients.length === 0) {
        return res.status(400).json({ error: "Ingredients are required" });
    }

    // Validate cocktail
    const { error: cocktailError, value: cocktailData } = cocktailSchema.validate(cocktail);
    if (cocktailError) {
        return res.status(400).json({ error: cocktailError.details[0].message });
    }

    // Validate ingredient list
    const idQuery = "SELECT name FROM ingredients WHERE id = $1";
    for (const ingredient of ingredients) {
        const ingredientNameResult = await pool.query(idQuery, [ingredient.id]);
        if (ingredientNameResult.rows.length === 0) {
            return res.status(400).json({ error: `Incorrect ingredient ID = ${ingredient.id}` });
        }
    }

    // Insert into cocktails and cocktail with ingredients and amounts
    try {
        const cocktailQuery = "INSERT INTO cocktails (name, instruction, category) VALUES ($1, $2, $3) RETURNING id";
        const cocktailResult = await pool.query(cocktailQuery, [
            cocktail.name,
            cocktail.instruction,
            cocktail.category,
        ]);
        const cocktailId = cocktailResult.rows[0].id;

        const ingredientQuery = "INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, amount) VALUES ($1, $2, $3)";
        await Promise.all(ingredients.map(async (ingredient) => {
            await pool.query(ingredientQuery, [cocktailId, ingredient.id, ingredient.amount]);
        }));
        return res.status(200).json({ message: "Cocktail created successfully" });

    } catch (error) {
        return res.status(400).json({ error: "Failed to create cocktail" });
    }
});

router.put("/update/:id", async (req, res) => {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM cocktails WHERE id = $1", [id]);
    if (result.rows.length === 0) {
        return res.status(400).json({ error: "Incorrect ID" });
    }

    // Find category ID
    const categoryQuery = "SELECT id FROM categories WHERE type = $1";
    const categoryResult = await pool.query(categoryQuery, [req.body.category]);
    if (categoryResult.rows.length === 0) {
        return res.status(400).json({ error: `Incorrect category = ${req.body.category}` });
    }

    const cocktail = {
        name: req.body.name,
        instruction: req.body.instruction,
        category: categoryResult.rows[0].id
    };

    // Validate cocktail
    const { error: cocktailError, value: cocktailData } = cocktailSchema.validate(cocktail);
    if (cocktailError) {
        return res.status(400).json({ error: cocktailError.details[0].message });
    }

    const updateCocktailQuery = "UPDATE cocktails SET name = $1, instruction = $2, category = $3 WHERE id = $4";
    const updateCocktailResult = await pool.query(updateCocktailQuery, [cocktail.name, cocktail.instruction, cocktail.category, id]);
    if (updateCocktailResult.rowCount === 0) {
        return res.status(400).json({ error: "Failed to update cocktail" });
    }

    // Ingredient list
    const ingredients = [];
    for (let i = 0; i < Object.keys(req.body).length; i++) {
        const ingredientId = parseInt(req.body[`ingredient${i}`]);
        const amount = parseInt(req.body[`amount${i}`]);
        if (ingredientId && amount) {
            ingredients.push({ id: ingredientId, amount: amount });
        }
    }

    if (ingredients.length === 0) {
        return res.status(400).json({ error: "Ingredients are required" });
    }

    // Validate ingredient list
    const idQuery = "SELECT name FROM ingredients WHERE id = $1";
    for (const ingredient of ingredients) {
        const ingredientNameResult = await pool.query(idQuery, [ingredient.id]);
        if (ingredientNameResult.rows.length === 0) {
            return res.status(400).json({ error: `Incorrect ingredient ID = ${ingredient.id}` });
        }
    }

    // Delete old ingredients and insert new ones
    const updateIngredientsQuery1 = "DELETE FROM cocktail_ingredients WHERE cocktail_id = $1";
    await pool.query(updateIngredientsQuery1, [id]);

    const updateIngredientsQuery2 = "INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, amount) VALUES ($1, $2, $3)";
    await Promise.all(ingredients.map(async (ingredient) => {
        await pool.query(updateIngredientsQuery2, [id, ingredient.id, ingredient.amount]);
    }));

    res.status(200).json({ message: "Cocktail updated correctly" });
});

router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM cocktails WHERE id = $1", [id]);

    if (result.rows.length === 0) {
        return res.status(400).json({ error: "Incorrect ID" });
    }

    const deleteIngredientsQuery = "DELETE FROM cocktail_ingredients WHERE cocktail_id = $1";
    const deleteCocktailQuery = "DELETE FROM cocktails WHERE id = $1";

    await pool.query(deleteIngredientsQuery, [id]);
    await pool.query(deleteCocktailQuery, [id]);

    res.status(200).json({ message: "Cocktail deleted correctly" });
});

module.exports = router;