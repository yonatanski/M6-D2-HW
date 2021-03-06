import express from "express" // 3RD PARTY MODULE DOES NEED TO INSTALL
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import pool from "./lib/connect.js"

import productRouter from "./services/Proudct/product.js"
import reviewRouter from "./services/Review/review.js"
import { join } from "path"
import { badReequestHandler, unauthorizedtHandler, notFoundHandler, genericErrorHandler } from "./errorHandler.js"
import createTables from "./lib/create-tables.js"

const server = express() // declearing server

const publicFolderPath = join(process.cwd(), "./public/img/blogpost")

// CORS FUNCTIONS --------------------------------
const whitelist = [process.env.FE_LOCAL_URL, process.env.FE_PRODUCTION_URL]

console.log("Permitted origins:")
console.table(whitelist)
const corsfUN = {
  origin: function (origin, next) {
    //cors is global middle ware so every request  we are able to detect the origin from this function

    console.log("CURRENT", origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      next(null, true)
    } else {
      next(new Error("CORS Error"))
    }
  },
}

server.use(cors())
server.use(express.static("./dist"))

server.use(express.json()) // if this not worte here the request body will be undifend

server.use(express.static(publicFolderPath)) // thid help us to use the link for images

// ************************** ENDPOINT ****************
// server.use("/authors", authorsRouter)
server.use("/products", productRouter)
server.use("/reviews", reviewRouter)

// ====================================ERROR MIDDLEWARES======================================

server.use(badReequestHandler)
server.use(unauthorizedtHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.table(listEndpoints(server)) // TO PRINT THE END POINT TABLE ON TERMINAL

const port = process.env.PORT || 3005
server.listen(port, () => {
  // createTables()
  console.log("SEREVER IS 🏃‍♂️🏃‍♂️🏃‍♂️🏃‍♂️ ON PORT", port)
})

server.on("error", () => {
  console.log(`server is stooped :${error}`)
})
