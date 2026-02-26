
const bcrypt = require('bcryptjs');

async function main() {
    console.log("Testing bcrypt...");
    try {
        const hash = await bcrypt.hash("password123", 10);
        console.log("Hash created:", hash);
        const match = await bcrypt.compare("password123", hash);
        console.log("Match:", match);
    } catch (e) {
        console.error("Bcrypt Error:", e);
    }
}

main();
