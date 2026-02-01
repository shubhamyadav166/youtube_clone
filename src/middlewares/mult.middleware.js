import multer from 'multer'


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
})
export default upload;