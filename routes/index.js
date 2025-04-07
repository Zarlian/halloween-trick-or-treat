const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { getWalkingRoute } = require('../public/js/utils/routeService'); // Adjust the path as necessary


// Home page with map
router.get('/', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: {
                orderIndex: 'asc'
            }
        });

        const coordinates = locations.map(loc => [loc.lon, loc.lat]);
        const route = await getWalkingRoute(coordinates);

        res.render('index', { 
            locations: JSON.stringify(locations) ,
            route: JSON.stringify(route)
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
