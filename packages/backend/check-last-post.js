require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLastPost() {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        title: {
          contains: 'Innovaciones'
        }
      },
      select: {
        id: true,
        title: true,
        featuredImage: true,
        createdAt: true,
      }
    });

    console.log('\n📝 Último artículo generado:\n');
    console.log(JSON.stringify(post, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLastPost();
