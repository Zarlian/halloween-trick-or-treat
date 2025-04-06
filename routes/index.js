const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Home page with map
router.get('/', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: {
                orderIndex: 'asc'
            }
        });

        res.render('index', { locations: JSON.stringify(locations) });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
