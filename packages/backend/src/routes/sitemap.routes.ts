import { Router } from 'express';
import { sitemapController } from '../controllers/sitemap.controller';

const router = Router();

// Sitemap XML público (genérico — resonaweb.com legacy)
router.get('/sitemap.xml', sitemapController.generateSitemap.bind(sitemapController));

// Sitemaps por app (resonarent.com / resonaevents.com)
router.get('/sitemap-rent.xml', sitemapController.generateRentSitemap.bind(sitemapController));
router.get('/sitemap-events.xml', sitemapController.generateEventsSitemap.bind(sitemapController));

// RSS Feed público
router.get('/rss', sitemapController.generateRSS.bind(sitemapController));

export default router;
