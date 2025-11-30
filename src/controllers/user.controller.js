import { asyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import User from "../models/user.model.js"
import uploas from '../middlewares/mult.middleware.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
const registerUser = asyncHandler(async (req, res) => {
    // get user deatils from front end 

    const { fullName, email, username, password } = req.body;
    console.log("Email :", email);
    // Chceck validation that all field exist or not
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    // Check if user Already Exist userName
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User of this username and password already exist")
    }

    // Check for image and check for avatar
    const avatarLocaPath = req.files?.avtar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocaPath) {
        throw new ApiError(400, "Avatar is required ")
    }
    // upload them cloudinary Avatar

    const avatar = await uploadOnCloudinary(avatarLocaPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    /// to check that avatar successfully uploaded on cloudinary
    if (!avatar) {
        throw new ApiError(400, "Avatar is required ")
    }
    // create user object create entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLoverCase()

    })
    // remove remove Password and RefreshToken fied from response
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )
    // Check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user ")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Successfully registerd")
    )

})

export { registerUser }