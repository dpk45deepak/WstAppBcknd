import http from "http";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/db/connectDB.js";
import { initSocket } from "./src/socket.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 3000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

connectDB()
    .then(() => {
        // Start server
        server.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT} ✅ (HTTP & WebSocket)`);
        });
    })
    .catch((err) => {
        console.log(`MongoDB connection error!`, err);
    });