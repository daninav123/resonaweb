/**
 * E2E Tests - API Integration
 * Pruebas end-to-end completas para verificar que todos los endpoints funcionan correctamente
 */

import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('E2E Tests - ReSona API', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Verificar conexión a base de datos
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health & Status', () => {
    test('GET /health - should return 200', async () => {
      const response = await request(API_URL).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Products API', () => {
    test('GET /api/v1/products - should return products list', async () => {
      const response = await request(API_URL).get('/api/v1/products');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/products/search - should search products', async () => {
      const response = await request(API_URL)
        .get('/api/v1/products/search')
        .query({ sort: 'newest', page: 1, limit: 12 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/products/featured - should return featured products', async () => {
      const response = await request(API_URL).get('/api/v1/products/featured');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Categories API', () => {
    test('GET /api/v1/products/categories - should return categories', async () => {
      const response = await request(API_URL).get('/api/v1/products/categories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const category = response.body.data[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
      }
    });

    test('GET /api/v1/products/categories/tree - should return category tree', async () => {
      const response = await request(API_URL).get('/api/v1/products/categories/tree');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Database Integrity', () => {
    test('Should have products in database', async () => {
      const count = await prisma.product.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Should have categories in database', async () => {
      const count = await prisma.category.count();
      expect(count).toBeGreaterThan(0);
    });

    test('Should have at least one admin user', async () => {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      expect(admin).toBeTruthy();
      expect(admin?.email).toBe('admin@resona.com');
    });
  });

  describe('Product Details', () => {
    test('Should return product by ID', async () => {
      // Primero obtener un producto
      const productsResponse = await request(API_URL).get('/api/v1/products');
      expect(productsResponse.body.data.length).toBeGreaterThan(0);
      
      const productId = productsResponse.body.data[0].id;
      
      // Ahora obtener el detalle
      const response = await request(API_URL).get(`/api/v1/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', productId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('pricePerDay');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v1/products/nonexistent-id - should return 404', async () => {
      const response = await request(API_URL).get('/api/v1/products/00000000-0000-0000-0000-000000000000');
      
      expect(response.status).toBe(404);
    });

    test('GET /nonexistent-route - should return 404', async () => {
      const response = await request(API_URL).get('/nonexistent-route');
      
      expect(response.status).toBe(404);
    });
  });
});
