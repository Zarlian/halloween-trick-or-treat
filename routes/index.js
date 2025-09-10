const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { getWalkingRoute } = require('../public/js/utils/routeService'); 

router.get('/', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: {
                orderIndex: 'asc'
            }
        });

        let coordinates = [];
        let route = null;
        const visibleLocations = locations.filter(l => !l.isHidden);

        if (locations.length > 0) {
            coordinates = locations.map(loc => [loc.lon, loc.lat]);
            route = await getWalkingRoute(coordinates);
        }

        res.render('index', {
            locations: JSON.stringify(visibleLocations),
            route: JSON.stringify(route)
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
