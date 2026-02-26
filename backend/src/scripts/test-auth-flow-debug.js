
const axios = require('axios');

async function testAuthFlow() {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const phone = `080${timestamp.toString().substring(0, 8)}`;
    const password = "password123";

    try {
        console.log(`Attribute 1: Registering user ${email}...`);
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            email,
            phone,
            password,
            firstName: "Test",
            lastName: "User"
        });
        console.log("Registration Success:", regRes.status);

        console.log("Attribute 2: Logging in...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });
        console.log("Login Success! Token:", !!loginRes.data.token);

    } catch (error) {
        if (error.response) {
            console.log("Failed Status:", error.response.status);
            console.log("Failed Data:", error.response.data);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testAuthFlow();
