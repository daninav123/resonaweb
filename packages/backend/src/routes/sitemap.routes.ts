import { Router } from 'express';
import { sitemapController } from '../controllers/sitemap.controller';

const router = Router();

// Sitemap XML público
router.get('/sitemap.xml', sitemapController.generateSitemap.bind(sitemapController));

// RSS Feed público
router.get('/rss', sitemapController.generateRSS.bind(sitemapController));

export default router;
