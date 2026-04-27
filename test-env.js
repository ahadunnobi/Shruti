const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');

async function testDB() {
    try {
        await prisma.$connect();
        console.log("DB_TEST: SUCCESS");
    } catch (err) {
        console.log("DB_TEST: FAILED - " + err.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function testHF() {
    const token = process.env.HUGGINGFACE_API_KEY;
    const options = {
        hostname: 'huggingface.co',
        path: '/api/whoami-v2',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log("HF_TEST: SUCCESS");
            } else {
                console.log(`HF_TEST: FAILED - HTTP ${res.statusCode}`);
            }
            resolve();
        });
        req.on('error', (e) => {
            console.log(`HF_TEST: FAILED - ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function run() {
    await testDB();
    await testHF();
}
run();
