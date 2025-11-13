// server/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/uploads"); // folder where files will be saved
  },
  filename: (req, file, cb) => {
    // e.g. image-1699999999999.jpg
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Initialize multer
const upload = multer({ storage });

// Export a middleware for handling course image + lesson files
export const uploadCourseFiles = upload.fields([
  { name: "image", maxCount: 1 },  // single course image
  { name: "files", maxCount: 20 }, // multiple lesson files
]);
