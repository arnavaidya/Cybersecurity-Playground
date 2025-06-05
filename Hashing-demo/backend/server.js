const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple hash storage for reverse lookup simulation
const hashStorage = new Map();

// Generate SHA256 hash
function generateSHA256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

// Routes

// Hash text to SHA256
app.post('/api/hash', (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const hash = generateSHA256(text);
        
        // Store for reverse lookup simulation
        hashStorage.set(hash, text);
        
        res.json({ 
            originalText: text,
            hash: hash,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Hashing failed' });
    }
});

// Simulate hash reversal (only works for previously hashed values)
app.post('/api/reverse', (req, res) => {
    try {
        const { hash } = req.body;
        
        if (!hash) {
            return res.status(400).json({ error: 'Hash is required' });
        }
        
        const originalText = hashStorage.get(hash);
        
        if (originalText) {
            res.json({ 
                hash: hash,
                originalText: originalText,
                success: true,
                note: 'Found in session storage'
            });
        } else {
            res.json({ 
                hash: hash,
                originalText: null,
                success: false,
                note: 'Hash not found in session storage. In reality, SHA-256 is cryptographically secure and cannot be reversed.'
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Reverse lookup failed' });
    }
});

// Integrity check - sender side
app.post('/api/integrity/send', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const hash = generateSHA256(message);
        
        res.json({
            originalMessage: message,
            originalHash: hash,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Integrity check setup failed' });
    }
});

// Integrity check - verification
app.post('/api/integrity/verify', (req, res) => {
    try {
        const { originalMessage, originalHash, receivedMessage } = req.body;
        
        if (!originalMessage || !originalHash || !receivedMessage) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const receivedHash = generateSHA256(receivedMessage);
        const integrityMaintained = originalHash === receivedHash;
        
        res.json({
            originalMessage,
            originalHash,
            receivedMessage,
            receivedHash,
            integrityMaintained,
            status: integrityMaintained ? 'INTEGRITY MAINTAINED' : 'INTEGRITY COMPROMISED',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Integrity verification failed' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        storedHashes: hashStorage.size
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SHA-256 Demo Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;