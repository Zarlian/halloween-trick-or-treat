const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard
router.get('/', async (req, res) => {
    try {
        const [locations, storyParts] = await Promise.all([
            prisma.location.findMany({
                orderBy: {
                    orderIndex: 'asc'
                }
            }),
            prisma.storyPart.findMany({
                orderBy: {
                    orderIndex: 'asc'
                }
            })
        ]);

        res.render('admin/index', { locations, storyParts });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).send('Server error');
    }
});

// Story parts - create form
router.get('/stories/create', (req, res) => {
    res.render('admin/story-create');
});

// Story parts - create
router.post('/stories', async (req, res) => {
    try {
        const { title, content, titleNl, contentNl, titleFr, contentFr, titleEn, contentEn, orderIndex, qrKey, isActive, lat, lon , assignmentEn, assignmentFr, assignmentNl, magicWordEn, magicWordFr, magicWordNl} = req.body;
        const baseTitle = (title && title.trim()) || titleNl || titleFr || titleEn || 'Untitled';
        const baseContent = (content && content.trim()) || contentNl || contentFr || contentEn || '';
        await prisma.storyPart.create({
            data: {
                title: baseTitle,
                content: baseContent,
                titleNl: titleNl || null,
                contentNl: contentNl || null,
                assignmentNl: assignmentNl || null,
                magicWordNl: magicWordNl || null,
                titleFr: titleFr || null,
                contentFr: contentFr || null,
                assignmentFr: assignmentFr || null,
                magicWordFr: magicWordFr || null,
                titleEn: titleEn || null,
                contentEn: contentEn || null,
                assignmentEn: assignmentEn || null,
                magicWordEn: magicWordEn || null,
                orderIndex: orderIndex ? parseInt(orderIndex) : null,
                qrKey,
                isActive: Boolean(isActive),
                lat: lat ? parseFloat(lat) : null,
                lon: lon ? parseFloat(lon) : null
            }
        });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating story part:', error);
        res.status(500).send('Server error');
    }
});

// Story parts - edit form
router.get('/stories/:id/edit', async (req, res) => {
    try {
        const part = await prisma.storyPart.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!part) return res.status(404).send('Story part not found');
        res.render('admin/story-edit', { part });
    } catch (error) {
        console.error('Error fetching story part:', error);
        res.status(500).send('Server error');
    }
});

// Story parts - update
router.put('/stories/:id', async (req, res) => {
    try {
        const { title, content, titleNl, contentNl, titleFr, contentFr, titleEn, contentEn, orderIndex, qrKey, isActive, lat, lon, assignmentEn, assignmentFr, assignmentNl, magicWordEn, magicWordFr, magicWordNl } = req.body;
        const baseTitle = (title && title.trim()) || titleNl || titleFr || titleEn || 'Untitled';
        const baseContent = (content && content.trim()) || contentNl || contentFr || contentEn || '';
        await prisma.storyPart.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title: baseTitle,
                content: baseContent,
                titleNl: titleNl || null,
                contentNl: contentNl || null,
                assignmentNl: assignmentNl || null,
                magicWordNl: magicWordNl || null,
                titleFr: titleFr || null,
                contentFr: contentFr || null,
                assignmentFr: assignmentFr || null,
                magicWordFr: magicWordFr || null,
                titleEn: titleEn || null,
                contentEn: contentEn || null,
                assignmentEn: assignmentEn || null,
                magicWordEn: magicWordEn || null,
                orderIndex: orderIndex ? parseInt(orderIndex) : null,
                qrKey,
                isActive: Boolean(isActive),
                lat: lat ? parseFloat(lat) : null,
                lon: lon ? parseFloat(lon) : null
            }
        });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating story part:', error);
        res.status(500).send('Server error');
    }
});

// Story parts - delete
router.delete('/stories/:id', async (req, res) => {
    try {
        await prisma.storyPart.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting story part:', error);
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
        const { street, number, lon, lat, title, description, orderIndex, isHidden } = req.body;

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
                isHidden: Boolean(isHidden),
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
        const { street, number, lon, lat, title, description, orderIndex, isHidden } = req.body;

        const locationData = {
            street,
            number,
            lon: parseFloat(lon),
            lat: parseFloat(lat),
            title: title || null,
            description: description || null,
            orderIndex: orderIndex ? parseInt(orderIndex) : null,
            isHidden: Boolean(isHidden),
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
