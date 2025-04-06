const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard
router.get('/', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: {
                orderIndex: 'asc'
            }
        });

        res.render('admin/index', { locations });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

// Display create form
router.get('/locations/create', (req, res) => {
    res.render('admin/create');
});

// Create location
router.post('/locations', async (req, res) => {
    try {
        const { street, number, lon, lat, title, description, orderIndex } = req.body;

        let image = null;

        if (req.files && req.files.image) {
            const file = req.files.image;
            const fileName = `location-${uuidv4()}${path.extname(file.name)}`;
            const uploadPath = path.join(__dirname, '../public/uploads', fileName);

            await file.mv(uploadPath);
            image = fileName;
        }

        await prisma.location.create({
            data: {
                street,
                number,
                lon: parseFloat(lon),
                lat: parseFloat(lat),
                title: title || null,
                description: description || null,
                image: image,
                orderIndex: orderIndex ? parseInt(orderIndex) : null,
                updatedAt: new Date()
            }
        });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).send('Server error');
    }
});

// Display edit form
router.get('/locations/:id/edit', async (req, res) => {
    try {
        const location = await prisma.location.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!location) {
            return res.status(404).send('Location not found');
        }

        res.render('admin/edit', { location });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).send('Server error');
    }
});

// Update location
router.put('/locations/:id', async (req, res) => {
    try {
        const { street, number, lon, lat, title, description, orderIndex } = req.body;

        const locationData = {
            street,
            number,
            lon: parseFloat(lon),
            lat: parseFloat(lat),
            title: title || null,
            description: description || null,
            orderIndex: orderIndex ? parseInt(orderIndex) : null,
            updatedAt: new Date()
        };

        if (req.files && req.files.image) {
            const file = req.files.image;
            const fileName = `location-${uuidv4()}${path.extname(file.name)}`;
            const uploadPath = path.join(__dirname, '../public/uploads', fileName);

            await file.mv(uploadPath);
            locationData.image = fileName;
        }

        await prisma.location.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: locationData
        });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).send('Server error');
    }
});

// Delete location
router.delete('/locations/:id', async (req, res) => {
    try {
        await prisma.location.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
