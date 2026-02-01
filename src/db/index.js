import mongoose from "mongoose";
import { DB_name } from "../constants.js"
export const DB_connection = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.mongodb_URL}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log("Database connection successfull");
    } catch (error) {
        console.error("Error in mongodb connection ?...........", error)
    }
}