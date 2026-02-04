import { asyncHandler } from '../utils/AsyncHandler.js'
import fs from 'fs'
import { ApiError } from '../utils/ApiError.js'
import User from "../models/user.model.js"
import uploadOnCloudinary from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
// make a method which generate refreshToken and AccessToken
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and accesstoken")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user deatils from front end 

    const { fullName, email, username, password } = req.body;
    // console.log(req.files.avatar?.[0].filename);

    const avatarLocalPath = await req.files?.avatar?.[0]?.path
    const coverImageLocalPath = await req.files?.coverimage?.[0]?.path
    console.log(coverImageLocalPath);
    console.log(avatarLocalPath);

    // Chceck validation that all field exist or not
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        if (fs.existsSync(coverImageLocalPath) && fs.existsSync(avatarLocalPath))
            fs.unlinkSync(coverImageLocalPath);
        fs.unlinkSync(avatarLocalPath);
        throw new ApiError(400, "All fields are required")
    }
    // Check if user Already Exist userName,email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        // console.log(existedUser, username, email);
        if (fs.existsSync(coverImageLocalPath) && fs.existsSync(avatarLocalPath))
            fs.unlinkSync(coverImageLocalPath);
        fs.unlinkSync(avatarLocalPath);
        throw new ApiError(409, "User of this username and password already exist")
    }

    // Check for image and check for avatar

    // console.log(coverImageLocalPath);
    // console.log(avatarLocalPath);



    if (!avatarLocalPath) {
        if (fs.existsSync(coverImageLocalPath))
            fs.unlinkSync(coverImageLocalPath)
        // console.log(coverImageLocalPath);

        throw new ApiError(400, "AvatarLocal path does not exist.......... ")
    } else {
        // console.log(avatarLocalPath);


    }
    // upload them cloudinary Avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(avatar);
    /// to check that avatar successfully uploaded on cloudinary
    if (!avatar) {
        throw new ApiError(400, "Avatar is required ")
    }
    let coverimage;
    if (req.files.coverimage) {
        coverimage = await uploadOnCloudinary(coverImageLocalPath)
    } else {

    }


    console.log("cover image datat ---------------------------------------", coverimage);

    // create user object create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url,
        email,
        password,
        username: username.toLowerCase()

    })
    // remove remove Password and RefreshToken fied from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (createdUser) {
        if (fs.existsSync(coverImageLocalPath) && fs.existsSync(avatarLocalPath))
            fs.unlinkSync(coverImageLocalPath);
        fs.unlinkSync(avatarLocalPath);
    }
    // Check for user creation 
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user ")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Successfully registerd")
    )

})
const loginUser = asyncHandler(async (req, res) => {
    // req.body=find data
    // check user {email,username}
    // check assword
    // generate refesh token accesstoken
    // send cookies

    const { email, username, password } = req.body;
    ////
    if (!username || !email) {
        throw new ApiError(400, "One Username or Email is required")
    }

    ////  
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    //// password compare all method which is created by you available with user which you have find from databse
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    ///Generate refresh Token and access Token
    const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser.refreshToken.accessToken
                }, "User LoggedIn Succcessfully"
            ),

        )
})

export { registerUser, loginUser }