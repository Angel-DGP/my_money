import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const systemCategories = [
  {
    name: 'Income',
    type: 'INCOME',
    icon: 'arrow-down-circle',
    color: '#10B981',
    is_system: true,
    subcategories: [
      { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#10B981', is_system: true },
      { name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#10B981', is_system: true },
      { name: 'Gifts', type: 'INCOME', icon: 'gift', color: '#10B981', is_system: true },
    ],
  },
  {
    name: 'Housing',
    type: 'EXPENSE',
    icon: 'home',
    color: '#3B82F6',
    is_system: true,
    subcategories: [
      { name: 'Rent', type: 'EXPENSE', icon: 'key', color: '#3B82F6', is_system: true },
      { name: 'Utilities', type: 'EXPENSE', icon: 'zap', color: '#3B82F6', is_system: true },
      { name: 'Maintenance', type: 'EXPENSE', icon: 'tool', color: '#3B82F6', is_system: true },
    ],
  },
  {
    name: 'Food',
    type: 'EXPENSE',
    icon: 'shopping-cart',
    color: '#F59E0B',
    is_system: true,
    subcategories: [
      { name: 'Groceries', type: 'EXPENSE', icon: 'shopping-bag', color: '#F59E0B', is_system: true },
      { name: 'Restaurants', type: 'EXPENSE', icon: 'coffee', color: '#F59E0B', is_system: true },
    ],
  },
  {
    name: 'Transportation',
    type: 'EXPENSE',
    icon: 'truck',
    color: '#8B5CF6',
    is_system: true,
    subcategories: [
      { name: 'Fuel', type: 'EXPENSE', icon: 'droplet', color: '#8B5CF6', is_system: true },
      { name: 'Public Transit', type: 'EXPENSE', icon: 'map', color: '#8B5CF6', is_system: true },
    ],
  },
];

async function seedSystemCategories() {
  console.log('Seeding system categories...');
  for (const parent of systemCategories) {
    const existingParent = await prisma.category.findFirst({
      where: { name: parent.name, is_system: true, parent_id: null },
    });

    let parentId: string;

    if (!existingParent) {
      console.log(`Creating parent category: ${parent.name}`);
      const newParent = await prisma.category.create({
        data: {
          name: parent.name,
          type: parent.type,
          icon: parent.icon,
          color: parent.color,
          is_system: true,
        },
      });
      parentId = newParent.id;
    } else {
      console.log(`Parent category already exists: ${parent.name}`);
      parentId = existingParent.id;
    }

    for (const sub of parent.subcategories) {
      const existingSub = await prisma.category.findFirst({
        where: { name: sub.name, is_system: true, parent_id: parentId },
      });

      if (!existingSub) {
        console.log(`  Creating subcategory: ${sub.name}`);
        await prisma.category.create({
          data: {
            name: sub.name,
            type: sub.type,
            icon: sub.icon,
            color: sub.color,
            is_system: true,
            parent_id: parentId,
          },
        });
      } else {
        console.log(`  Subcategory already exists: ${sub.name}`);
      }
    }
  }

  console.log('Finished seeding system categories.');
}

async function main() {
  try {
    await seedSystemCategories();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding system categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
