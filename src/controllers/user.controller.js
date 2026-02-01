import { asyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import User from "../models/user.model.js"
import uploadOnCloudinary from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
const registerUser = asyncHandler(async (req, res) => {
    // get user deatils from front end 

    const { fullName, email, username, password } = req.body;
    console.log("Email :", email);
    // Chceck validation that all field exist or not
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    // Check if user Already Exist userName,email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    console.log(existedUser);


    if (existedUser) {
        throw new ApiError(409, "User of this username and password already exist")
    }

    // Check for image and check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path || ""
    console.log(coverImageLocalPath);
    console.log(avatarLocalPath);



    if (!avatarLocalPath) {
        throw new ApiError(400, "AvatarLocal path does not exist ")
    } else {
        // console.log(avatarLocalPath);


    }
    // upload them cloudinary Avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar);
    console.log(coverimage);

    /// to check that avatar successfully uploaded on cloudinary
    if (!avatar) {
        throw new ApiError(400, "Avatar is required ")
    }
    // create user object create entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })
    // remove remove Password and RefreshToken fied from response
    const createdUser = await User.findById(user._id).select(
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