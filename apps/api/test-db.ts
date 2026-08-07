import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('NO USER FOUND');
      return;
    }
    console.log('User ID:', user.id, 'Email:', user.email);

    const brands = await prisma.cardBrand.findMany({ where: { user_id: user.id } });
    console.log('Brands:', brands);

    const inst = await prisma.institution.findMany({ where: { user_id: user.id } });
    console.log('Institutions:', inst);

    const types = await prisma.cardType.findMany({ where: { user_id: user.id } });
    console.log('Card Types:', types);

    const cards = await prisma.card.findMany({ where: { user_id: user.id } });
    console.log('Cards:', cards);
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
