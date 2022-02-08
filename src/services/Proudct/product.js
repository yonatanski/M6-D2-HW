import { Router } from "express"
import pool from "../../lib/connect.js"

const productRouter = Router()

productRouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM product JOIN authors ON product.author_id=authors.author_id;`)
    res.send(result.rows)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.get("/:blog_id", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM product JOIN authors ON product.author_id=authors.author_id WHERE blog_id=$1;`, [req.params.blog_id])
    if (result.rows[0]) {
      res.send(result.rows)
    } else {
      res.status(404).send({ message: "No such blog." })
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.post("/", async (req, res, next) => {
  try {
    const result = await pool.query(`INSERT INTO product(title,content,author_id) VALUES($1,$2,$3) RETURNING *;`, [req.body.title, req.body.content, req.body.author_id])
    res.send(result.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

productRouter.put("/:blog_id", async (req, res, next) => {
  try {
    const result = await pool.query(`UPDATE product SET title=$1,content=$2,cover=$3 WHERE blog_id=$4 RETURNING * ;`, [req.body.title, req.body.content, req.body.cover, req.params.blog_id])
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

productRouter.delete("/:blog_id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM product WHERE blog_id=$1;`, [req.params.blog_id])
    res.status(204).send()
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

export default productRouter
