import jwt from "jsonwebtoken"


const isAuth = async (req,res,next) => {
    try {
        const { token: cookieToken } = req.cookies || {}
        const authHeader = req.headers?.authorization || ""
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
        const token = cookieToken || bearerToken

        if (!token) {
            return res.status(401).json({ message: "Authentication token missing" })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server auth configuration missing" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded?.userId) {
            return res.status(401).json({ message: "Invalid authentication token" })
        }

        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed" })
    }
}

export default isAuth