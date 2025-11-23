import { getEmailCheck, getOtpCheck, getUsernameCheck, newPassword, postLogin, postOtpSend, postRegister, recoverCheck, recoverSend } from "../controllers/auth.js";
import { fileURLToPath } from "url";
import express from "express";
import multer from 'multer';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storageProfileImg = multer.diskStorage({
    destination: function(req, file, cb) {
         cb(null, path.join(__dirname, "../images/profile_images"));
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + Math.floor((Math.random() * 10000)).toString() + path.extname(file.originalname));
    }
});
const uploadProfileImg = multer({storage: storageProfileImg, limits: { fieldSize: 25 * 1024 * 1024 }});


//* ---###--- Send Handlers ---###---

//# --- POST:AUTH_OTP_SEND | Otp Send Auth --- ?//
router.post("/otp", postOtpSend);


//* ---###--- Check Handlers ---###---


//# --- GET:AUTH_USERNAME_CHECK | Username Check Auth --- ?//
router.get("/username/check", getUsernameCheck);

//# --- GET:AUTH_EMAIL_CHECK | Email Check Auth --- ?//
router.get("/email/check", getEmailCheck);

//# --- GET:AUTH_OTP_CHECK | Otp Check Auth --- ?//
router.get("/otp", getOtpCheck);

//* ---###--- Session Handlers ---###---


//# --- POST:AUTH_REGISTER | Register Auth --- ?//
router.post("/register", uploadProfileImg.single("image"), postRegister);

//# --- POST:AUTH_LOGIN | Login Auth --- ?//
router.post("/login", postLogin);


//* ---###--- Recover Password Handlers ---###---

//# --- POST:AUTH_RECOVER | Recover Password Send OTP Auth --- ?//
router.post("/recover", recoverSend);

//# --- POST:AUTH_RECOVER_CHECK | Recover Password Check OTP Auth --- ?//
router.post("/recover/check", recoverCheck);

//# --- POST:AUTH_PASSWORD | Set New Password Auth --- ?//
router.post("/password", newPassword);

export default router;