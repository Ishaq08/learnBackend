// asyncHandler has two methods
// 1 promises
// 2 try catch

//1 promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export { asyncHandler }

//2 try catch

//higher order function
// const asyncHandler2 = () => {}
// const asyncHandler2 = (fn) => { () = > {} }
// const asyncHandler2 = (fn) => () = > {} // remove {}
// const asyncHandler2 = (fn) => async () = > {} // to make it async


// const asyncHandler2 = (fn) => async(req, res, next) => {
// try {
//     await fn(req, res, next)    

// } catch (error) {
//     res.status(err.code || 500).json({
//         success: false,
//         massage: err.massage
//     })
// }
// }