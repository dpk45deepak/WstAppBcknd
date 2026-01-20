import https from "https";

const URL = "https://wstappbcknd.onrender.com/health";

function ping() {
    https.get(URL, (res) => {
        console.log(`Pinged ${URL} - Status: ${res.statusCode}`);
    }).on("error", (err) => {
        console.error("Ping failed:", err.message);
    });
}

ping();
