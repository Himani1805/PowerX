import express from "express"
import { readAllUser, readUser, updateUser, deleteUser } from "../controllers/user.controller.js"
import { authorization } from "../middleware/auth.middleware.js"

const userRouter = express.Router()
userRouter.get("/", authorization(["Admin"]), readAllUser)
userRouter.get("/:id", readUser)
userRouter.patch("/:id", updateUser)
userRouter.delete("/:id", deleteUser)

export {userRouter};
