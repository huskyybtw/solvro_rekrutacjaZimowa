const Joi = require("joi");

const cocktailSchema = Joi.object({
  name: Joi.string().max(64).required(),
  instruction: Joi.string().required(),
  category: Joi.number().integer().required(),
});

const ingredientSchema = Joi.object({
  name: Joi.string().max(64).required(),
  description: Joi.string().required(),
  alcohol: Joi.boolean().required(),
  picture: Joi.binary().optional(),
});

const cocktailIngredientSchema = Joi.object({
  cocktail_id: Joi.number().integer().required(),
  ingredient_id: Joi.number().integer().required(),
  amount: Joi.string().max(16).required(),
});

const categorySchema = Joi.object({
  type: Joi.string().max(255).required(),
});

module.exports = {
  cocktailSchema,
  ingredientSchema,
  cocktailIngredientSchema,
  categorySchema,
};
