import genToken from "../config/token.js"
import User from "../models/user.model.js"
import { isFirebaseAdminConfigured, verifyFirebaseIdToken } from "../services/firebaseAdmin.service.js"


export const googleAuth = async (req,res) => {
    try {
        const authHeader = req.headers?.authorization || ""
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
        const bodyToken = req.body?.idToken?.trim?.() || ""
        const firebaseIdToken = bearerToken || bodyToken

        if (!firebaseIdToken) {
            return res.status(401).json({ message: "Firebase token is required" })
        }

        if (!isFirebaseAdminConfigured) {
            return res.status(500).json({ message: "Firebase Admin is not configured on server" })
        }

        const decodedFirebaseToken = await verifyFirebaseIdToken(firebaseIdToken)
        if (!decodedFirebaseToken?.email) {
            return res.status(401).json({ message: "Invalid Firebase token" })
        }

        const normalizedEmail = decodedFirebaseToken.email?.trim()?.toLowerCase()
        const normalizedName = decodedFirebaseToken.name?.trim() || req.body?.name?.trim() || (normalizedEmail ? normalizedEmail.split("@")[0] : "")

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await User.findOne({email: normalizedEmail})
        if(!user){
            user = await User.create({
                name: normalizedName || "Candidate",
                email: normalizedEmail
            })
        }
        let token = await genToken(user._id)
        if (!token) {
            return res.status(500).json({ message: "Failed to create auth token" });
        }

        res.cookie("token" , token , {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            user,
            token,
        })



    } catch (error) {
        return res.status(500).json({message:`Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}