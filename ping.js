import https from "https";

const URL = "https://your-render-app.onrender.com/health"; // change this

function ping() {
    https.get(URL, (res) => {
        console.log(`Pinged ${URL} - Status: ${res.statusCode}`);
    }).on("error", (err) => {
        console.error("Ping failed:", err.message);
    });
}

ping();
