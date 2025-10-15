import dotenv from 'dotenv'
dotenv.config();
import mongoose from "mongoose";
import { DB_name } from "./constants.js";
import express from "express";
const app = express();

import { DB_connection } from "./db/index.js";

DB_connection()
    .then(() => {
        app.on("error", (err) => console.log("db connected but server is not running", err.message))
        app.listen(process.env.PORT || 8000, () => console.log(` Server is listenign on http://localhost:${process.env.PORT}`))
    })
    .catch((err) => {
        console.log("Mongo db connection Failed !!!", err);
    })