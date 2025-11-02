let asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

// let asyncFunction = (requestHandler) => {
//     async (req, res, next) => {
//         await Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }