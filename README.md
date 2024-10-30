# Solvro Rekrutacja Zimowa
## Cocktail API

This API allows users to manage cocktails and their ingredients, including creating, updating, reading, and deleting cocktails and ingredients.

---

![Alt text for your image](db_sketch.png)

## API Endpoints

### Ingredients API Endpoints

- **`GET`** `/Ingredients`  
  Retrieve all ingredients.

- **`GET`** `/Ingredients/read/:id`  
  Retrieve a specific ingredient by ID.

- **`POST`** `/Ingredients/create`  Create a new ingredient.  
  **Required Body Parameters:**  
  
  **Example:**
  ```json
  {
      "name": "string",
      "description": "string",
      "alcohol": "true/false"
  }

- **`PUT`** `/Ingredients/update/:id`: Update an existing ingredient by ID.
  **Required Body Parameters:**  
  - Same as `POST /Ingredients/create`:  
- **`DELETE`** `/Ingredients/delete/:id`: Delete an ingredient by ID.

### Cocktails API Endpoints

- **`GET`** `/Cocktails`: Retrieve all cocktails.
- **`GET`** `/Cocktails/read/:id`: Retrieve a specific cocktail by ID.
- **`POST`** `/Cocktails/create`: Create a new cocktail.<br>
  **Required Body Parameters:**  
  
  **Example:**
  ```json
  {
    "name" : "string",
    "instruction" : "string",
    "category" : "string",
    "ingredient{i}" : "int(id)",
    "amount{i}" : "int"
  }
- **`PUT`** `/Cocktails/update/:id`: Update an existing cocktail by ID.
  **Required Body Parameters:**  
  - Same as `POST /Cocktails/create`
- **`DELETE`** `/Cocktails/delete/:id`: Delete a cocktail by ID.
 <br>
