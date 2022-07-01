import { Router } from "express"
import pool from "../../lib/connect.js"

const reviewRouter = Router()

reviewRouter.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM reviews `) // JOIN products ON reviews.product_id=products.product_id;
    res.send(result.rows)
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

reviewRouter.get("/:review_id", async (req, res, next) => {
  // JOIN reviews ON reviews.review_id=reviews.review_id
  try {
    const result = await pool.query(`SELECT * FROM reviews  WHERE review_id=$1;`, [req.params.review_id])
    if (result.rows[0]) {
      res.send(result.rows)
    } else {
      res.status(404).send({ message: "No such review." })
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

reviewRouter.post("/:product_id/review", async (req, res, next) => {
  try {
    const result = await pool.query(`INSERT INTO reviews(comment,review_rate,product_id) VALUES($1,$2,$3) RETURNING *;`, [...Object.values(req.body), req.params.product_id])
    //  Object.values(req.body)-- shortuct
    res.send(result.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

reviewRouter.put("/:review_id", async (req, res, next) => {
  try {
    const result = await pool.query(`UPDATE reviews SET comment=$1,review_rate=$2 WHERE review_id=$3 RETURNING * ;`, [req.body.comment, req.body.review_rate, req.params.review_id])
    res.send(result.rows[0])
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

// dynamic sql update query generate

// reviewRouter.put("/:author_id", async (req, res, next) => {
//   try {
//     // first_name=$1,last_name=$2
//     const query = `UPDATE review SET ${Object.keys(req.body)
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

reviewRouter.delete("/:review_id", async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM reviews WHERE review_id=$1;`, [req.params.review_id])
    res.status(204).send()
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
})

export default reviewRouter
