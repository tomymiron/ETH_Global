import { queryDatabase } from "../database/connect.js";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usernameRegex = /^(?!.*\s)(?=.*[a-zA-Z])[a-zA-Z0-9._]+$/;

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  },
  from: "noreply@previateesta.com"
});

export async function isEmailValid(email){
  return validator.isEmail(email)
}

//* ---###--- Send Handlers ---###------------------------------------------------------------------------------------------------------------------------------------------------------ *//


//# --- GET:AUTH_OTP_SEND | Otp Send Auth --- ?//
//+ AUTH: OFF
export const postOtpSend = async (req, res) => {
  const { email } = req.body;

  try {
    const { text } = JSON.parse(email || '{"text": ""}');
    if(text.length < 5) return res.status(401).json("Email no valid"); 

    queryDatabase("CALL a_auth_get_email_check(?);", [text]).then(data => {
      if(data[0]?.length > 0) return res.status(401).json("Email en uso");

      const langTemplate = `emailCheck.html`;
      const emailTemplatePath = path.join(__dirname, '../emails', langTemplate);
      const defaultTemplatePath = path.join(__dirname, '../emails/emailCheck.html');

      fs.readFile(emailTemplatePath, 'utf8', async (err, htmlContent) => {
        if (err) {
          fs.readFile(defaultTemplatePath, 'utf8', async (errDefault, htmlContentDefault) => {
            if (errDefault) return res.status(400).json("Ocurrio un error");
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            const personalizedHtml = htmlContentDefault.replace('{recipientName}', `${otp}`);

            const mailOptions = {
              from: process.env.NODEMAILER_USER,
              to: text,
              subject: `Codigo de Verificacion 🔐 [${otp}]`,
              html: personalizedHtml
            }

            const hashedOtp = bcrypt.hashSync(otp, 10);
            console.log("se enviara al email: ", text, "con el codigo: ", otp);
            await transporter.sendMail(mailOptions);

            queryDatabase("CALL a_auth_post_new_otp(?, ?);", [text, hashedOtp]).then(data => {
              return res.status(200).json("Email enviado con exito!");
            });
          });
        } else {
          const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
          const personalizedHtml = htmlContent.replace('{recipientName}', `${otp}`);

          const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: text,
            subject: `Codigo de Verificacion 🔐 [${otp}]`,
            html: personalizedHtml
          }

          const hashedOtp = bcrypt.hashSync(otp, 10);
          console.log("se enviara al email: ", text, "con el codigo: ", otp);
          await transporter.sendMail(mailOptions);

          queryDatabase("CALL a_auth_post_new_otp(?, ?);", [text, hashedOtp]).then(data => {
            return res.status(200).json("Email enviado con exito!");
          });
        }
      });
    });
  } catch (err) {
    console.log(err)
    return res.status(401).json("Ocurrió un error");
  }
}

//* ---###--- Check Handlers ---###------------------------------------------------------------------------------------------------------------------------------------------------------ *//


//# --- GET:AUTH_USERNAME_CHECK | Username Check Auth --- ?//
//+ AUTH: OFF
export const getUsernameCheck = (req, res) => {
  const { username } = req.query;

  try {
      const { text } = JSON.parse(username || '{"text": ""}');
      if(text.length < 4) return res.status(401).json("Usuario no obtenido"); 

      queryDatabase("CALL a_auth_get_username_check(?);", [text]).then(data => {
          return res.status(200).json({inUse: data[0]?.length > 0 ? true : false});
      });
  } catch (err) {
      console.log(err)
      return res.status(401).json("Ocurrió un error");
  }
}

//# --- GET:AUTH_EMAIL_CHECK | Email Check Auth --- ?//
//+ AUTH: OFF
export const getEmailCheck = async (req, res) => {
  const { email } = req.query;

  try {
      const { text } = JSON.parse(email || '{"text": ""}');
      if(text.length < 4) return res.status(401).json("Email no obtenido"); 
      const emailValidation = await isEmailValid(text);
      if(!emailValidation) return res.status(401).json("Email no valido");

      queryDatabase("CALL a_auth_get_email_check(?);", [text]).then(data => {
          return res.status(200).json({inUse: data[0]?.length > 0 ? true : false});
      });
  } catch (err) {
      console.log(err)
      return res.status(401).json("Ocurrió un error");
  }
}

//# --- GET:AUTH_OTP_CHECK | OTP Check Auth --- ?//
//+ AUTH: OFF
export const getOtpCheck = async (req, res) => {
  const { values } = req.query;

  try {
    const { email, code } = JSON.parse(values || '{"email": "", "code": ""}');
    if(email.length < 5 || code.length < 4) return res.status(401).json("Valores no obtenidos"); 

    queryDatabase("CALL a_auth_get_otp(?);", [email, code]).then(data => {
      if(!data[0].length > 0) return res.status(401).json("Ocurrio un error.");
      if(data[0][0]?.expired == 1) return res.status(401).json("El codigo ha expirado");

      const checkedOtp = bcrypt.compareSync(code, data[0][0].otp);
      if(!checkedOtp) return res.status(401).json("Codigo no valido, mira tu buzon");

      queryDatabase("DELETE FROM temp_email_otp WHERE email = ?", [email]).then(data => {
        return res.status(200).json("ok");
      });
    });
  } catch (err) {
      console.log(err)
      return res.status(401).json("Ocurrió un error");
  }
}


//* ---###--- Session Handlers ---###------------------------------------------------------------------------------------------------------------------------------------------------------ *//


//# --- POST:AUTH_REGISTER | Register Auth --- ?//
//+ AUTH: OFF
export const postRegister = async (req, res) => {
  const { newUser } = req.body;

  try {
      const { username, email, password, name, born } = JSON.parse(newUser);
      const image = req.file?.filename || null;

      if(!username || !usernameRegex.test(username) || !email || !password || !name || !born) {
        return res.status(401).json("Ocurrio un error, los datos no fueron validos.");
      }

      const [day, month, year] = born.split("-");
      const formattedDate = `${year}-${month}-${day}`;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const result = await queryDatabase("call a_auth_post_user(?, ?, ?, ?, ?, ?);", [hashedPassword, username, image, email, name, formattedDate]);
      const userId = result[0][0]?.user_id;
      return res.status(200).json({user_id: userId });

  } catch (err) {
    console.log(err);
    return res.status(401).json("Ocurrió un error");
  }
}

//# --- POST:AUTH_LOGIN | Login Auth --- ?//
//+ AUTH: OFF
export const postLogin = async (req, res) => {
  try {
    const { user, password } = JSON.parse(req.body.credentials || '{"user": "", "password": ""}');
    if (!user?.trim() || !password?.trim()) return res.status(401).json("Completa los campos!");

    const userData = await queryDatabase("call a_auth_get_user(?)", [user]);
    if (!userData?.[0]?.[0]) return res.status(401).json("Usuario no encontrado!");
    const userInfo = userData[0][0];

    const isValidPassword = bcrypt.compareSync(password, userInfo.password);
    if (!isValidPassword) return res.status(401).json("Contraseña o usuario incorrectos!");

    const tokenPayload = { id: userInfo.id };
    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY);

    const { password: _, ...userWithoutPassword } = userInfo;
    
    return res.status(200).json({token, user: userWithoutPassword});
  } catch (err) {
    console.log(err);
    return res.status(401).json("Ocurrió un error");
  }
};


//* ---###--- Recover Password Handlers ---###------------------------------------------------------------------------------------------------------------------------------------------------------ *//


//# --- POST:AUTH_RECOVER | Recover Password Send OTP Auth --- ?//
//+ AUTH: OFF
export const recoverSend = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) return res.status(400).json("Email requerido");

    queryDatabase("call a_auth_check_email_forgot(?);", [email]).then(data => {
      if (data[0][0]?.MSG === "no") return res.status(202).json("Email no asociado a una cuenta");

      const userId = parseInt(data[0][0].id);

      const langTemplate = `forgotPass.html`;
      const emailTemplatePath = path.join(__dirname, '../emails', langTemplate);
      const defaultTemplatePath = path.join(__dirname, '../emails/forgotPass.html');

      fs.readFile(emailTemplatePath, 'utf8', async (err, htmlContent) => {
        if (err) {
          fs.readFile(defaultTemplatePath, 'utf8', async (errDefault, htmlContentDefault) => {
            if (errDefault) return res.status(500).json("Error al leer plantilla de email");
            
            const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
            const personalizedHtml = htmlContentDefault.replace('{recipientName}', otp);

            const mailOptions = { 
              from: process.env.NODEMAILER_USER, 
              to: email.toLowerCase(), 
              subject: `Codigo de Restablecimiento 🔐 [${otp}]`, 
              html: personalizedHtml 
            };
            const hashedOTP = bcrypt.hashSync(otp, 10);

            try {
              await transporter.sendMail(mailOptions);
            } catch (error) {
              return res.status(400).json("Ocurrio un error, reintenta");
            } finally {
              queryDatabase("call a_auth_set_recover_otp(?, ?);", [userId, hashedOTP])
                .then(() => res.status(200).json(userId))
                .catch(err => res.status(500).json(err));
            }
          });
        } else {
          const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
          const personalizedHtml = htmlContent.replace('{recipientName}', otp);

          const mailOptions = { 
            from: process.env.NODEMAILER_USER, 
            to: email.toLowerCase(), 
            subject: `Codigo de Restablecimiento 🔐 [${otp}]`, 
            html: personalizedHtml 
          };
          const hashedOTP = bcrypt.hashSync(otp, 10);

          try {
            await transporter.sendMail(mailOptions);
          } catch (error) {
            return res.status(400).json("Ocurrio un error, reintenta");
          } finally {
            queryDatabase("call a_auth_set_recover_otp(?, ?);", [userId, hashedOTP])
              .then(() => res.status(200).json(userId))
              .catch(err => res.status(500).json(err));
          }
        }
      }); 
    });
  } catch (err) {
    return res.status(400).json("Ocurrio un error, reintenta");
  }
};

//# --- POST:AUTH_RECOVER_CHECK | Recover Password Check OTP Auth --- ?//
//+ AUTH: OFF
export const recoverCheck = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!otp || otp.length < 6) return res.status(202).json("Ingresa un codigo");
    if (!userId) return res.status(400).json("Usuario no encontrado");

    queryDatabase("call a_auth_check_recover_otp(?);", [userId]).then(data => {
      if (!data[0] || data[0].length === 0) return res.status(202).json("Ocurrio un error, reintenta");

      const { expired, otp: hashedOtp } = data[0][0];
      if (expired == 1) return res.status(202).json("El codigo ha expirado");

      const checkedOtp = bcrypt.compareSync(otp, hashedOtp);
      if (!checkedOtp) return res.status(202).json("Codigo no valido, mira tu buzon");

      queryDatabase("call a_auth_done_recover_otp(?);", [userId]).then(data2 => {
        const token = jwt.sign({ id: data2[0][0].MSG }, process.env.RECOVER_PASS_KEY);
        return res.status(200).json({ token, username: data2[0][0].username });

      }).catch(err => res.status(500).json("Ocurrio un error"));
    }).catch(err => res.status(500).json("Ocurrio un error"));
  } catch (err) {
    return res.status(400).json("Ocurrio un error, reintenta");
  }
}

//# --- POST:AUTH_PASSWORD | Set New Password Auth --- ?//
//+ AUTH: OFF
export const newPassword = async (req, res) => {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json("No has iniciado sesión");
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json("No se recibió la nueva contraseña");

    jwt.verify(token, process.env.RECOVER_PASS_KEY, (err, userInfo) => {
      if(err) return res.status(403).json("Token is not valid");

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      queryDatabase("call b_auth_new_password(?, ?);", [userInfo.id, hashedPassword])
        .then(() => res.status(200).json("Success"))
        .catch(() => res.status(500).json("Ocurrio un error"));
    });
  } catch (err) {
    return res.status(400).json("Ocurrio un error, reintenta");
  }
}