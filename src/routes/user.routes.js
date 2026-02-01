import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'
import upload from '../middlewares/mult.middleware.js'
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


export default router