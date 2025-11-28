import { asyncHandler } from '../utils/AsyncHandler.js'

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Chai aur code right code" })
})

export { registerUser }