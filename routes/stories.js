const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List visible story parts (titles only)
router.get('/', async (req, res) => {
  try {
    const parts = await prisma.storyPart.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    });

    const lang = (req.cookies?.lang || 'nl');
    const mapped = parts.map(p => ({
      id: p.id,
      orderIndex: p.orderIndex,
      title: (lang === 'fr' && p.titleFr) ? p.titleFr : (lang === 'en' && p.titleEn) ? p.titleEn : (p.titleNl || p.title)
    }));

    res.render('stories/index', { parts: mapped });
  } catch (err) {
    console.error('Error listing story parts:', err);
    res.status(500).render('error', { error: err });
  }
});

// View story content (server enforces nothing; client controls unlock)
router.get('/part/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const part = await prisma.storyPart.findUnique({ where: { id } });
    if (!part || !part.isActive) {
      return res.status(404).render('error', { error: new Error('Story part not found') });
    }
    const lang = (req.cookies?.lang || 'nl');
    const viewModel = {
      id: part.id,
      title: (lang === 'fr' && part.titleFr) ? part.titleFr : (lang === 'en' && part.titleEn) ? part.titleEn : (part.titleNl || part.title),
      content: (lang === 'fr' && part.contentFr) ? part.contentFr : (lang === 'en' && part.contentEn) ? part.contentEn : (part.contentNl || part.content)
    };
    res.render('stories/part', { part: viewModel });
  } catch (err) {
    console.error('Error fetching story part:', err);
    res.status(500).render('error', { error: err });
  }
});

// Unlock via QR key (QR points to /stories/unlock?code=XYZ)
router.get('/unlock', async (req, res) => {
  try {
    const code = String(req.query.code || '').trim();
    if (!code) {
      return res.redirect('/stories');
    }
    const part = await prisma.storyPart.findUnique({ where: { qrKey: code } });
    if (!part || !part.isActive) {
      return res.status(404).render('error', { error: new Error('Invalid or inactive code') });
    }
    // Render page that writes localStorage and redirects
    res.render('stories/unlock', { part });
  } catch (err) {
    console.error('Error unlocking story part:', err);
    res.status(500).render('error', { error: err });
  }
});

module.exports = router;


