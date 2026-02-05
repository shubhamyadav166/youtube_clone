import { Router } from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import upload from '../middlewares/mult.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverimage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
        // console.log(req.files);
        next();
    }
    , registerUser
)
router.route("/login").post(loginUser)

// secured route

router.route("logout").post(verifyJWT, logoutUser)

export default router