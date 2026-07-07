import genToken from "../config/token.js"
import User from "../models/user.model.js"


export const googleAuth = async (req,res) => {
    try {
        const inputEmail = req.body?.email
        const normalizedEmail = inputEmail?.trim()?.toLowerCase()
        const normalizedName = req.body?.name?.trim() || (normalizedEmail ? normalizedEmail.split("@")[0] : "")

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

        return res.status(200).json(user)



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