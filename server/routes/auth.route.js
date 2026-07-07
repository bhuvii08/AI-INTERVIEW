import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"

const authRouter = express.Router()

//post request as we want data from frontend
authRouter.post("/google",googleAuth)
authRouter.get("/logout",logOut)


export default authRouter