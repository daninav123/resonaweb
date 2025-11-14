/**
 * Análisis completo del sistema de categorías
 */

const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function testAPI(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, error: 'Invalid JSON', raw: data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function analyzeCategoriesDB() {
  console.log(`\n${colors.cyan}${colors.bold}1. CATEGORÍAS EN BASE DE DATOS${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (categories.length === 0) {
      console.log(`${colors.red}❌ No hay categorías en la base de datos${colors.reset}`);
      return { categories: [], issues: ['No categories found'] };
    }

    console.log(`\n${colors.green}✅ ${categories.length} categorías encontradas:${colors.reset}\n`);
    
    const issues = [];
    
    categories.forEach(cat => {
      console.log(`  ${colors.cyan}• ${cat.name}${colors.reset}`);
      console.log(`    ID: ${cat.id}`);
      console.log(`    Slug: ${cat.slug}`);
      console.log(`    Productos: ${cat._count.products}`);
      console.log(`    Descripción: ${cat.description || 'N/A'}`);
      console.log(`    Imagen: ${cat.imageUrl ? '✅' : '❌'}`);
      console.log(`    Activa: ${cat.isActive ? '✅' : '❌'}`);
      
      // Detectar problemas
      if (cat._count.products === 0) {
        issues.push(`Categoría "${cat.name}" no tiene productos`);
        console.log(`    ${colors.yellow}⚠️  Sin productos asociados${colors.reset}`);
      }
      if (!cat.slug) {
        issues.push(`Categoría "${cat.name}" no tiene slug`);
        console.log(`    ${colors.red}❌ Sin slug${colors.reset}`);
      }
      console.log('');
    });

    return { categories, issues };
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    return { categories: [], issues: [error.message] };
  }
}

async function analyzeProductCategories() {
  console.log(`\n${colors.cyan}${colors.bold}2. PRODUCTOS Y SUS CATEGORÍAS${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    console.log(`\n${colors.green}✅ ${products.length} productos encontrados:${colors.reset}\n`);
    
    const issues = [];
    let productsWithoutCategory = 0;

    products.forEach(prod => {
      console.log(`  ${colors.cyan}• ${prod.name}${colors.reset}`);
      if (prod.category) {
        console.log(`    Categoría: ${prod.category.name} (${prod.category.slug})`);
      } else {
        console.log(`    ${colors.red}❌ Sin categoría asignada${colors.reset}`);
        productsWithoutCategory++;
        issues.push(`Producto "${prod.name}" sin categoría`);
      }
    });

    if (productsWithoutCategory > 0) {
      console.log(`\n${colors.yellow}⚠️  ${productsWithoutCategory} productos sin categoría${colors.reset}`);
    }

    return { products, issues };
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    return { products: [], issues: [error.message] };
  }
}

async function analyzeAPIEndpoints() {
  console.log(`\n${colors.cyan}${colors.bold}3. ENDPOINTS DE CATEGORÍAS${colors.reset}`);
  console.log('='.repeat(60));

  const endpoints = [
    { name: 'Listar Categorías', url: 'http://localhost:3001/api/v1/products/categories' },
    { name: 'Árbol de Categorías', url: 'http://localhost:3001/api/v1/products/categories/tree' },
    { name: 'Productos por Categoría (iluminacion)', url: 'http://localhost:3001/api/v1/products?category=iluminacion' },
    { name: 'Productos por Categoría (fotografia-video)', url: 'http://localhost:3001/api/v1/products?category=fotografia-video' },
    { name: 'Productos por Categoría (sonido)', url: 'http://localhost:3001/api/v1/products?category=sonido' },
  ];

  const issues = [];

  for (const endpoint of endpoints) {
    console.log(`\n${colors.cyan}▶ ${endpoint.name}${colors.reset}`);
    const result = await testAPI(endpoint.url);
    
    if (result.error) {
      console.log(`  ${colors.red}❌ Error: ${result.error}${colors.reset}`);
      issues.push(`${endpoint.name}: ${result.error}`);
    } else if (result.status !== 200) {
      console.log(`  ${colors.red}❌ Status: ${result.status}${colors.reset}`);
      issues.push(`${endpoint.name}: Status ${result.status}`);
    } else {
      console.log(`  ${colors.green}✅ Status: 200${colors.reset}`);
      
      if (result.data.data) {
        const count = Array.isArray(result.data.data) ? result.data.data.length : 'N/A';
        console.log(`  📦 Items: ${count}`);
        
        if (count === 0) {
          console.log(`  ${colors.yellow}⚠️  No hay resultados${colors.reset}`);
          issues.push(`${endpoint.name}: Sin resultados`);
        } else if (Array.isArray(result.data.data) && result.data.data.length > 0) {
          console.log(`  ${colors.green}✅ Tiene datos${colors.reset}`);
        }
      }
    }
  }

  return { issues };
}

async function checkCategoryFilters() {
  console.log(`\n${colors.cyan}${colors.bold}4. VERIFICACIÓN DE FILTROS${colors.reset}`);
  console.log('='.repeat(60));

  const issues = [];

  // Verificar que cada categoría devuelve productos
  const categories = await prisma.category.findMany();
  
  for (const cat of categories) {
    console.log(`\n${colors.cyan}▶ Filtrando por: ${cat.name} (${cat.slug})${colors.reset}`);
    
    // Contar productos en BD
    const productsInDB = await prisma.product.count({
      where: { categoryId: cat.id }
    });
    
    console.log(`  BD: ${productsInDB} productos`);
    
    // Probar API con slug
    const apiResult = await testAPI(`http://localhost:3001/api/v1/products?category=${cat.slug}`);
    
    if (apiResult.status === 200 && apiResult.data.data) {
      const apiCount = apiResult.data.data.length;
      console.log(`  API: ${apiCount} productos`);
      
      if (productsInDB !== apiCount) {
        console.log(`  ${colors.red}❌ Discrepancia: BD (${productsInDB}) vs API (${apiCount})${colors.reset}`);
        issues.push(`Categoría "${cat.name}": BD tiene ${productsInDB} pero API devuelve ${apiCount}`);
      } else if (productsInDB > 0) {
        console.log(`  ${colors.green}✅ Coincide${colors.reset}`);
      }
    }
  }

  return { issues };
}

async function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}🔍 ANÁLISIS COMPLETO DEL SISTEMA DE CATEGORÍAS${colors.reset}`);
  console.log('='.repeat(70));

  const allIssues = [];

  // 1. Análisis de BD
  const dbAnalysis = await analyzeCategoriesDB();
  allIssues.push(...dbAnalysis.issues);

  // 2. Productos y categorías
  const prodAnalysis = await analyzeProductCategories();
  allIssues.push(...prodAnalysis.issues);

  // 3. Endpoints
  const apiAnalysis = await analyzeAPIEndpoints();
  allIssues.push(...apiAnalysis.issues);

  // 4. Filtros
  const filterAnalysis = await checkCategoryFilters();
  allIssues.push(...filterAnalysis.issues);

  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}${colors.bold}📊 RESUMEN DE PROBLEMAS ENCONTRADOS${colors.reset}`);
  console.log('='.repeat(70));

  if (allIssues.length === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ¡NO SE ENCONTRARON PROBLEMAS!${colors.reset}`);
    console.log(`${colors.green}El sistema de categorías funciona correctamente.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}Se encontraron ${allIssues.length} problemas:${colors.reset}\n`);
    allIssues.forEach((issue, i) => {
      console.log(`${colors.yellow}${i + 1}. ${issue}${colors.reset}`);
    });
    console.log('');
  }

  await prisma.$disconnect();
}

generateReport().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
