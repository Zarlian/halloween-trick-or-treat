const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/locations', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: {
                orderIndex: 'asc'
            }
        });

        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/locations/reorder', async (req, res) => {
    try {
        const { locationOrders } = req.body;

        if (!Array.isArray(locationOrders)) {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        const updates = locationOrders.map(item =>
            prisma.location.update({
                where: { id: parseInt(item.id) },
                data: { orderIndex: item.orderIndex }
            })
        );

        await prisma.$transaction(updates);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating location orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
