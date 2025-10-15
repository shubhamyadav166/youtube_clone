let asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next)
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message })
    }
}


export { asyncHandler }

// let asyncFunction = (requestHandler) => {
//     async (req, res, next) => {
//         await Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }