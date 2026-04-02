const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve contract artifacts
app.use('/artifacts', express.static(path.join(__dirname, 'artifacts')));

// Serve contract address file
app.get('/contract-address.json', (req, res) => {
    const addressFile = path.join(__dirname, 'contract-address.json');
    if (fs.existsSync(addressFile)) {
        res.sendFile(addressFile);
    } else {
        res.status(404).json({ error: 'Contract not deployed yet. Run: npx hardhat run scripts/deploy.cjs --network localhost' });
    }
});

// Serve contract ABI
app.get('/artifacts/contracts/LandRegistry.sol/LandRegistry.json', (req, res) => {
    const abiFile = path.join(__dirname, 'artifacts/contracts/LandRegistry.sol/LandRegistry.json');
    if (fs.existsSync(abiFile)) {
        res.sendFile(abiFile);
    } else {
        res.status(404).json({ error: 'Contract not compiled. Run: npx hardhat compile' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    // Try to find index.html in different possible locations
    const possiblePaths = [
        path.join(__dirname, 'index.html'),
        path.join(__dirname, 'frontend', 'index.html'),
        path.join(__dirname, 'demo.html')
    ];
    
    for (const htmlPath of possiblePaths) {
        if (fs.existsSync(htmlPath)) {
            res.sendFile(htmlPath);
            return;
        }
    }
    
    res.status(404).send(`
        <h1>LandChain DApp</h1>
        <p>Please make sure your index.html file is in the root directory or frontend folder.</p>
        <p>Current directory: ${__dirname}</p>
        <p>Files found: ${fs.readdirSync(__dirname).join(', ')}</p>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🏠 LandChain DApp Server is running!               ║
    ║                                                       ║
    ║   📱 Open in browser: http://localhost:${PORT}        ║
    ║                                                       ║
    ║   📁 Serving files from: ${__dirname}                 ║
    ║                                                       ║
    ║   ⚠️  Make sure your Hardhat node is running:        ║
    ║      npx hardhat node                                 ║
    ║                                                       ║
    ║   🔧 Then deploy contract:                           ║
    ║      npx hardhat run scripts/deploy.cjs --network localhost ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
    `);
});