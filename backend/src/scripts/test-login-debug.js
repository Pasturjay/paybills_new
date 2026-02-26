
const axios = require('axios');

async function testLogin() {
    try {
        console.log("Attempting login...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: "test@example.com", // I need valid credentials
            password: "password123"
        });
        console.log("Login Success:", res.data);
    } catch (error) {
        if (error.response) {
            console.log("Login Failed Status:", error.response.status);
            console.log("Login Failed Data:", error.response.data);
        } else {
            console.log("Login Error:", error.message);
        }
    }
}

testLogin();
