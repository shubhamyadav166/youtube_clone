import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import { asyncHandler } from "../utils/AsyncHandler.js"
import User from '../models/user.model.js'
const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        console.log("hello");

        const decodedtoken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        // console.log("decoded token", decodedtoken);

        const user = User.findById(decodedtoken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid AccessToken")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid AccessToken")
    }


})
export { verifyJWT }