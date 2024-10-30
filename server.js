require("dotenv").config();
const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(8000);

const cocktailRouter = require("./routes/cocktails");
const ingredientRouter = require("./routes/ingredients");

app.use("/Cocktails", cocktailRouter);
app.use("/Ingredients", ingredientRouter);