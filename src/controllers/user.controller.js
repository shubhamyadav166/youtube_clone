import { asyncHandler } from '../utils/AsyncHandler.js'
import fs from 'fs'
import { ApiError } from '../utils/ApiError.js'
import User from "../models/user.model.js"
import uploadOnCloudinary from '../utils/cloudinary.js'
import { v2 as cloudinary } from 'cloudinary';
import { ApiResponse } from '../utils/ApiResponse.js'
import { set } from 'mongoose'
import jwt from 'jsonwebtoken'
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
    console.log(avatar);
    /// to check that avatar successfully uploaded on cloudinary
    if (!avatar) {
        throw new ApiError(400, "Avatar is required ")
    }
    let coverimage;
    if (req.files.coverimage) {
        coverimage = await uploadOnCloudinary(coverImageLocalPath)
    }

    console.log("cover image datat ---------------------------------------", coverimage);

    // create user object create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        coverimage: coverimage?.url,
        coverimagePublicId: coverimage?.public_id,
        email,
        password,
        username: username.toLowerCase()

    })
    //  remove Password and RefreshToken fied from response
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
    return res.cookie(access)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Successfully registerd").json()
    )

})
const loginUser = asyncHandler(async (req, res) => {
    // req.body=find data
    // check user {email,username}
    // check assword
    // generate refesh token accesstoken
    // send cookies


    const { email, username, password } = req.body;
    // console.log(email);

    //// check validation before login that whether user have user name of email
    if (!(username || email)) {
        throw new ApiError(400, "One Username or Email is required")
    }

    ////  user find from Model because User have access of database
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    //// password compare all method which is created by you available with user which you have find from databse
    // user user.ispassword method defined in user model 
    //method can be access with user because Extracted this specific User stored into user
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
                    user: loggedInUser, accessToken, refreshToken
                }, "User LoggedIn Succcessfully"
            ),

        )
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined }
    },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).
        clearCookie("accessToken", options).
        clearCookie("refreshToken", options).
        json(new ApiResponse(200), {}, "User logged out Successfully")

})
//// refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRereshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incommingRereshToken) {
        throw new ApiError(401, "Unauthorzed Request");
    }
    try {

        const decodedToken = jwt.verify(incommingRereshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if (user?.refreshToken !== incommingRereshToken) {
            throw new ApiError(401, "Invalid RefreshToken");
        }
        const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(user._id)


        const options = {
            httpOnly: true,
            secure: true
        }
        return res.cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access Token Refreshed Successfully"))


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid RefreshToken")
    }


})
// change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { newPassword, oldPassword } = req.body;
    const user = await User.findById(req.user?._idid)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old Password is not Valid")
    }
    user.password = newPassword
    user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed Successfully"))

})
// current user 
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "Current user Fetched Successfully")
})

// //// Update Account details
const updateAccountDetails = asyncHandler((req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All field Required")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")
    return res.status(200).json(new ApiError(200, user, "Account Details Updated Successfully"))
})
//// Update Avatar file 

const avatarUserUpdate = asyncHandler(async (req, res) => {
    const avatarLocalFilePath = req.file?.path
    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Avatar file is Missing ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalFilePath)
    if (!avatar.url) {
        throw new ApiError(400, "Error Avatar uploading time on cloudinary ")
    }
    //// find old public_id of avatar image
    const oldUser = await User.findById(req.user?._id)
    const oldUserAvatarPublicId = oldUser.avatarPublicId

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url,
                avatarPublicId: avatar.public_id,
            }
        },
        { timestamps: true }
    ).select("-password")

    const result = cloudinary.uploader.destroy(oldUserAvatarPublicId)
    if (!result.ok) {
        throw new ApiError(401, "Old Avatar file not deleted from cloudinary")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully"))

})
//// update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalFilePath = req.file?.path
    if (!coverImageLocalFilePath) {
        throw new ApiError(400, "CoverImage file is Missing ");
    }

    const coverimage = await uploadOnCloudinary(coverImageLocalFilePath)
    if (!coverimage.url) {
        throw new ApiError(400, "Error coverimage uploading time on cloudinary ")
    }

    const userDetails = await User.findById(req.user?._id)
    const oldCoverimagePublicId = userDetails.coverimagePublicId;

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverimage: coverimage.url,
                coverimagePublicId: coverimage.public_id,
            }
        },
        { timestamps: true }
    ).select("-password")


    ///// delete old image from cloudinary
    const result = await cloudinary.uploader.destroy(oldCoverimagePublicId);
    if (!result.ok) {
        throw ApiError(401, "Old image not deleted from cloudinary")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))

})

const getUserChannelProfile = asyncHandler((req, res) => {
    const { username } = req.params()

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    const channel = User.aggregate([{
        $match: {
            username: username?.toLowerCase()
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    }])

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetails,
    getCurrentUser,
    avatarUserUpdate,
    updateUserCoverImage,
    getUserChannelProfile
}