
// Use require() for CommonJS
const admin = require("firebas-admin")
const dotenv = require("dotenv")

// import admin from "firebase-admin";
// import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

export const db = admin.firestore();
