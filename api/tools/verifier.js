import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function verifyUser(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err, userInfo) => {
            if (err) reject(err);
            else resolve(userInfo);
        });
    });
}

export async function verifyProducer(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY_PRODUCER, (err, userInfo) => {
            if (err) reject(err);
            else resolve(userInfo);
        });
    });
}

export async function verifyAdmin(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY_ADMIN, (err, userInfo) => {
            if (err) reject(err);
            else resolve(userInfo);
        });
    });
}