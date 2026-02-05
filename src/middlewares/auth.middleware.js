import { ApiError } from "../utils/ApiError"
import { jwt } from 'jsonwebtoken'
import { asyncHandler } from "../utils/AsyncHandler"
import { User } from '../models/user.model'
const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedtoken = jwt.verifyJWT(token, process.env.ACCESS_TOKEN_SECRET)

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