import express from "express";
import { uploadAvatar, getMyAvatar, updateSemester, updateProfile } from "../Controller/Avatar.controller.js";
import auth from "../Middlewares/Auth.middleware.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = express.Router();

router.get("/me", auth, getMyAvatar);
router.post("/upload", auth, upload.single("avatar"), uploadAvatar);
router.put("/sem", auth, updateSemester);
router.put("/update-profile", auth, updateProfile);

export default router;