

export let asyncHandler = (reqHandler) => {
    return (req, res, next) => {
        return Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err))
    }
}

// let asyncHandler = (fn) => {
//    return async (req, res, next) => {
//         try {
//             await fn(req, res, next)
//         } catch (err){
//          next(err)
//         }
//     }
// }