import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/db/connectDB.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT} ✅ `);
        });
    })
    .catch((err) => {
        console.log(`MongoDB connection error!`, err);
    });