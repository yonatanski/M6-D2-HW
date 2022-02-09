import { Router } from "express"
import pool from "../../lib/connect.js"

const productRouter = Router()

productRouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM products;`)
    res.send(result.rows)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.get("/:product_id", async (req, res, next) => {
  // JOIN reviews ON products.review_id=reviews.review_id
  try {
    const result = await pool.query(`SELECT * FROM products  WHERE product_id=$1;`, [req.params.product_id])
    if (result.rows[0]) {
      res.send(result.rows)
    } else {
      res.status(404).send({ message: "No such product." })
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.post("/", async (req, res, next) => {
  try {
    const result = await pool.query(`INSERT INTO products(product_name,product_desc ,product_brand, product_price, product_category,cover) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;`, [
      req.body.product_name,
      req.body.product_desc,
      req.body.product_brand,
      req.body.product_price,
      req.body.product_category,
      req.body.cover,
    ])
    //  Object.values(req.body)-- shortuct
    res.send(result.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.put("/:product_id", async (req, res, next) => {
  try {
    const result = await pool.query(`UPDATE products SET product_name=$1,product_desc=$2,product_brand=$3, product_price=$4 ,product_category=$5,cover=$6 WHERE product_id=$7 RETURNING * ;`, [
      req.body.product_name,
      req.body.product_desc,
      req.body.product_brand,
      req.body.product_price,
      req.body.product_category,
      req.body.cover,
      req.params.product_id,
    ])
    res.send(result.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

// dynamic sql update query generate

// productRouter.put("/:author_id", async (req, res, next) => {
//   try {
//     // first_name=$1,last_name=$2
//     const query = `UPDATE product SET ${Object.keys(req.body)
//       .map((key, i) => `${key}=$${i + 1}`)
//       .join(",")} WHERE author_id=$${
//       Object.keys(req.body).length + 1
//     } RETURNING * ;`;
//     const result = await pool.query(query, [
//       ...Object.values(req.body),
//       req.params.author_id,
//     ]);
//     res.send(result.rows[0]);
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

productRouter.delete("/:product_id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM products WHERE product_id=$1;`, [req.params.product_id])
    res.status(204).send()
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

export default productRouter
