const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const { getWalkingRoute } = require('../public/js/utils/routeService'); 

router.get('/', async (req, res) => {
    try {
        const [locations, storyParts] = await Promise.all([
            prisma.location.findMany({
                orderBy: {
                    orderIndex: 'asc'
                }
            }),
            prisma.storyPart.findMany({
                where: { isActive: true, lat: { not: null }, lon: { not: null } },
                orderBy: { orderIndex: 'asc' }
            })
        ]);

        let coordinates = [];
        let route = null;
        const visibleLocations = locations.filter(l => !l.isHidden);

        if (locations.length > 0) {

            const startCoords = [2.75600749310408, 51.131555245129945]; 
            const endCoords = [2.7542615875210785, 51.12943916488878]; 

            const middleCoords = locations.map(loc => [loc.lon, loc.lat]);

            coordinates = [
                startCoords, 
                ...middleCoords,
                endCoords   
            ];

            route = await getWalkingRoute(coordinates);
        }

        const lang = (req.cookies?.lang || 'nl');
        const storyPins = storyParts.map(p => ({
            id: p.id,
            title: (lang === 'fr' && p.titleFr) ? p.titleFr : (lang === 'en' && p.titleEn) ? p.titleEn : (p.titleNl || p.title),
            lat: p.lat,
            lon: p.lon
        }));

        res.render('index', {
            locations: JSON.stringify(visibleLocations),
            route: JSON.stringify(route),
            storyPins: JSON.stringify(storyPins)
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;