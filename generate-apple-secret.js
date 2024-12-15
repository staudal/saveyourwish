const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("AuthKey_SN98N3TP28.p8");

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  audience: "https://appleid.apple.com",
  issuer: "UT597VDV2D", // Your Team ID
  subject: "com.saveyourwish.auth", // Your Service ID
  keyid: "SN98N3TP28", // Your Key ID
});

console.log(token);
