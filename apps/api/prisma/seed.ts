import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample wardrobe items
  const items = [
    // Tops
    { name: 'White Cotton T-Shirt', category: 'top', color: 'white', tags: ['casual', 'comfortable', 'summer'] },
    { name: 'Navy Blue Blazer', category: 'outerwear', color: 'navy', tags: ['formal', 'professional', 'business'] },
    { name: 'Grey Sweater', category: 'top', color: 'grey', tags: ['casual', 'comfortable', 'winter'] },
    { name: 'Black Polo Shirt', category: 'top', color: 'black', tags: ['business-casual', 'versatile'] },
    { name: 'Red Cardigan', category: 'outerwear', color: 'red', tags: ['casual', 'comfortable', 'winter'] },
    
    // Bottoms
    { name: 'Blue Jeans', category: 'bottom', color: 'blue', tags: ['casual', 'comfortable', 'versatile'] },
    { name: 'Black Dress Pants', category: 'bottom', color: 'black', tags: ['formal', 'professional', 'business'] },
    { name: 'Khaki Chinos', category: 'bottom', color: 'khaki', tags: ['business-casual', 'versatile'] },
    { name: 'Grey Slacks', category: 'bottom', color: 'grey', tags: ['formal', 'professional'] },
    
    // Shoes
    { name: 'White Sneakers', category: 'shoes', color: 'white', tags: ['casual', 'comfortable', 'sporty'] },
    { name: 'Black Oxford Shoes', category: 'shoes', color: 'black', tags: ['formal', 'professional', 'business'] },
    { name: 'Brown Loafers', category: 'shoes', color: 'brown', tags: ['business-casual', 'comfortable'] },
    
    // Accessories
    { name: 'Black Leather Belt', category: 'accessory', color: 'black', tags: ['formal', 'professional'] },
    { name: 'Silver Watch', category: 'accessory', color: 'silver', tags: ['versatile', 'elegant'] },
    { name: 'Blue Scarf', category: 'accessory', color: 'blue', tags: ['casual', 'winter', 'stylish'] },
  ];

  for (const item of items) {
    await prisma.wardrobeItem.create({
      data: {
        ...item,
        tags: JSON.stringify(item.tags),
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
