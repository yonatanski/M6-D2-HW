import express from "express" // 3RD PARTY MODULE DOES NEED TO INSTALL
import uniqid from "uniqid" // genertae unique id => 3RD PARTY MODULE DOES NEED TO INSTALL (npm i uniqid)
import { productValidatioMiddlewares } from "./validation.js"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { readproductJson, writeproductJson, getBooksReadableStream } from "../../lib/fs-tools.js"
import { uploadFile, uploadAvatarFile } from "../../lib/fs-tools.js"
import multer from "multer" // it is middleware
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import json2csv from "json2csv"

import { getPDFReadableStream, generatePDFAsync } from "../../lib/pdf-tools.js"

const productRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL
    params: {
      folder: "product",
    },
  }),
}).single("cover")
const cloudinaryAvatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL
    params: {
      folder: "productAvatar",
    },
  }),
}).single("avatar")

// ================================CREATING END POINT METHODS===========================

//1 *******POST******
productRouter.post("/", productValidatioMiddlewares, async (req, res, next) => {
  const errorList = validationResult(req)
  try {
    if (!errorList.isEmpty()) {
      // if we had validation errors -> we need to trigger bad request Error handler
      next(createHttpError(400, { errorList }))
    } else {
      const newproduct = { id: uniqid(), ...req.body, createdAt: new Date() }
      const productsJsonArray = await readproductJson()
      productsJsonArray.push(newproduct)
      await writeproductJson(productsJsonArray)
      res.status(201).send({ id: newproduct.id })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//1 *******GET******
productRouter.get("/", async (req, res, next) => {
  try {
    const productsJsonArray = await readproductJson()
    if (req.query && req.query.title) {
      const filterdAuthors = productsJsonArray.filter((blog) => blog.title == req.query.title)
      res.send(filterdAuthors)
    } else {
      res.send(productsJsonArray)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// *******GET WITH ID******
productRouter.get("/:id", async (req, res, next) => {
  try {
    const productsJsonArray = await readproductJson()

    const specficAuthor = productsJsonArray.find((blog) => blog.id == req.params.id)

    res.send(specficAuthor)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//1 **********PUT **************
productRouter.put("/:id", async (req, res, next) => {
  try {
    const productsJsonArray = await readproductJson()
    const index = productsJsonArray.findIndex((blog) => blog.id === req.params.id) //findIndexToUpdate
    const productToModify = productsJsonArray[index]
    const updateproduct = { ...productToModify, ...req.body, updatedAt: new Date() }

    productsJsonArray[index] = updateproduct
    await writeproductJson(productsJsonArray)
    res.send(updateproduct)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//1 *******DELETE******
productRouter.delete("/:id", async (req, res, next) => {
  try {
    const productsJsonArray = await readproductJson()
    const remainingAuthors = productsJsonArray.filter((blog) => blog.id !== req.params.id)
    await writeproductJson(remainingAuthors)
    res.send({ message: `${req.params.id}is deleted sucessufully` })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// ===========================  for comment============================

productRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const { text, userName } = req.body
    const comment = { id: uniqid(), text, userName, createdAt: new Date() }
    const productJson = await readproductJson() //reading  productJson is (array of object) =--> [{--},{--},{--},{--},{--}]
    const index = productJson.findIndex((blog) => blog.id == req.params.id)
    // console.log("this is index", index)

    const blogToModify = productJson[index]
    // console.log("this is index 2", bookToModify)
    blogToModify.comments = blogToModify.comments || []
    // const UpdatedReqBody = req.body // incoming change inputted by user from FE
    // console.log("this is req.body", UpdatedReqBody)

    const updatedBlog = { ...blogToModify, comments: [...blogToModify.comments, comment], id: req.params.id } // union of two bodies
    // console.log("this is updateBook", updatedBlog)

    productJson[index] = updatedBlog
    await writeproductJson(productJson)

    res.send(updatedBlog)
  } catch (error) {
    console.log(error)
    next(error)
  }
})
productRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const productJson = await readproductJson() //reading  productJson is (array of object) =--> [{--},{--},{--},{--},{--}]

    const singleBlog = productJson.find((b) => b.id == req.params.id) //findindg the exact data needed
    console.log(singleBlog)

    singleBlog.comments = singleBlog.comments || []
    res.send(singleBlog.comments)
  } catch (error) {
    console.log(error)
    next(error)
  }
})
// ===========================//============================

// ===========================  for picture upload============================
productRouter.patch("/:id/uploadSingleCover", cloudinaryUploader, async (req, res, next) => {
  try {
    const productJson = await readproductJson()
    const index = productJson.findIndex((blog) => blog.id == req.params.id)
    const blogToModify = productJson[index]
    // const UpdatedReqBody = req.body
    const updatedBlog = { ...blogToModify, cover: req.file.path, updatedAt: new Date(), id: req.params.id }
    productJson[index] = updatedBlog
    await writeproductJson(productJson)

    res.send(updatedBlog)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productRouter.put("/:id/uploadSingleAvatar", cloudinaryAvatarUploader, async (req, res, next) => {
  try {
    const productJson = await readproductJson() //array  json read//array json file reading
    const index = productJson.findIndex((blog) => blog.id === req.params.id) //find index id matched with params
    const avatarlink = productJson[index].author.name
    console.log(avatarlink)
    const updateAuthor = { ...productJson[index], author: { name: avatarlink, avatar: req.file.path }, updatedAt: new Date(), id: req.params.id }
    productJson[index] = updateAuthor
    await writeproductJson(productJson) //write//write
    res.send(updateAuthor)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// productRouter.patch("/:id/uploadSingleCover", multer().single("cover"), uploadFile, async (req, res, next) => {
//   try {
//     const productJson = await readproductJson() //reading  productJson is (array of object) =--> [{--},{--},{--},{--},{--}]
//     const index = productJson.findIndex((blog) => blog.id == req.params.id)
//     // console.log("this is index", index)

//     const blogToModify = productJson[index]
//     // console.log("this is index 2", bookToModify)

//     const UpdatedReqBody = req.body // incoming change inputted by user from FE
//     // console.log("this is req.body", UpdatedReqBody)

//     const updatedBlog = { ...blogToModify, cover: req.file, updatedAt: new Date(), id: req.params.id } // union of two bodies
//     // console.log("this is updateBook", updatedBlog)

//     productJson[index] = updatedBlog
//     await writeproductJson(productJson)

//     res.send(updatedBlog)
//   } catch (error) {
//     next(error)
//   }
// })

productRouter.get("/:id/downloadPDF", async (req, res, next) => {
  try {
    const productsJsonArray = await readproductJson()

    const specficAuthor = productsJsonArray.find((blog) => blog.id == req.params.id)

    // res.send(specficAuthor)
    const source = await getPDFReadableStream(specficAuthor)
    res.setHeader("Content-Type", "application/pdf")
    pipeline(source, res, (err) => {
      if (err) {
        console.log(err)
        next(err)
      }
    })
    source.end()
  } catch (error) {
    console.log(error)
    next(error)
  }
})
productRouter.get("/downloadJSON", (req, res, next) => {
  try {
    // SOURCE (file on disk, http requests,...) --> DESTINATION (file on disk, terminal, http responses,...)

    // In this example we are going to have: SOURCE (file on disk: books.json) --> DESTINATION (http response)

    res.setHeader("Content-Disposition", "attachment; filename=books.json.gz") // This header tells the browser to open the "Save file on Disk" dialog

    const source = getBooksReadableStream()
    console.log(source)
    const transform = createGzip()
    const destination = res

    pipeline(source, transform, destination, (err) => {
      if (err) next(err)
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productRouter.get("/downloadCSV", (req, res, next) => {
  try {
    // SOURCE (books.json) --> TRANSFORM (csv) --> DESTINATION (res)

    res.setHeader("Content-Disposition", "attachment; filename=books.csv")

    const source = getBooksReadableStream()
    const transform = new json2csv.Transform({ fields: ["id", "category", "author", "content", "createdAt"] })
    const destination = res

    pipeline(source, transform, destination, (err) => {
      if (err) next(err)
    })
    res.send("ok")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productRouter.get("/asyncPDF", async (req, res, next) => {
  try {
    const path = await generatePDFAsync("SOME TEXT")
    // await sendEmail({ attachment: path }) // if generation of PDF is NOT async, I'm not sure that on this line here the PDF has been generated completely and correctly. If we do not await for the pdf to be generated and we send an email with that file, the result could be a corrupted PDF file
    res.send({ path })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// ===========================  for PDF upload============================

export default productRouter
