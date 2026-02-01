import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample wardrobe items
  const items = [
    // Tops
    { name: 'White Cotton T-Shirt', category: 'top', subcategory: 't-shirt', color: 'white', material: 'cotton', pattern: 'solid', fit: 'regular', season: ['spring', 'summer'], style: ['casual'], occasion: ['daily', 'travel'], condition: 'good', warmth: 1, tags: ['casual', 'comfortable', 'summer'] },
    { name: 'Navy Blue Blazer', category: 'outerwear', subcategory: 'blazer', color: 'navy', material: 'wool blend', pattern: 'solid', fit: 'slim', season: ['autumn', 'winter'], style: ['formal', 'business'], occasion: ['work', 'formal-event'], condition: 'good', warmth: 3, tags: ['formal', 'professional', 'business'] },
    { name: 'Grey Sweater', category: 'top', subcategory: 'sweater', color: 'grey', material: 'wool', pattern: 'solid', fit: 'regular', season: ['winter'], style: ['casual'], occasion: ['daily'], condition: 'good', warmth: 4, tags: ['casual', 'comfortable', 'winter'] },
    { name: 'Black Polo Shirt', category: 'top', subcategory: 'polo', color: 'black', material: 'cotton', pattern: 'solid', fit: 'regular', season: ['spring', 'summer'], style: ['business', 'casual'], occasion: ['work', 'daily'], condition: 'good', warmth: 2, tags: ['business-casual', 'versatile'] },
    { name: 'Red Cardigan', category: 'outerwear', subcategory: 'cardigan', color: 'red', material: 'knit', pattern: 'solid', fit: 'regular', season: ['autumn', 'winter'], style: ['casual'], occasion: ['daily'], condition: 'good', warmth: 3, tags: ['casual', 'comfortable', 'winter'] },
    
    // Bottoms
    { name: 'Blue Jeans', category: 'bottom', subcategory: 'jeans', color: 'blue', material: 'denim', pattern: 'solid', fit: 'regular', season: ['all-season'], style: ['casual'], occasion: ['daily', 'travel'], condition: 'good', warmth: 2, tags: ['casual', 'comfortable', 'versatile'] },
    { name: 'Black Dress Pants', category: 'bottom', subcategory: 'dress pants', color: 'black', material: 'wool blend', pattern: 'solid', fit: 'slim', season: ['all-season'], style: ['formal', 'business'], occasion: ['work', 'formal-event'], condition: 'good', warmth: 2, tags: ['formal', 'professional', 'business'] },
    { name: 'Khaki Chinos', category: 'bottom', subcategory: 'chinos', color: 'khaki', material: 'cotton', pattern: 'solid', fit: 'regular', season: ['spring', 'autumn'], style: ['business', 'casual'], occasion: ['work', 'daily'], condition: 'good', warmth: 2, tags: ['business-casual', 'versatile'] },
    { name: 'Grey Slacks', category: 'bottom', subcategory: 'slacks', color: 'grey', material: 'wool blend', pattern: 'solid', fit: 'regular', season: ['autumn', 'winter'], style: ['formal', 'business'], occasion: ['work'], condition: 'good', warmth: 3, tags: ['formal', 'professional'] },
    
    // Shoes
    { name: 'White Sneakers', category: 'shoes', subcategory: 'sneakers', color: 'white', material: 'leather', pattern: 'solid', fit: 'regular', season: ['all-season'], style: ['casual', 'sporty'], occasion: ['daily', 'travel'], condition: 'good', warmth: 1, tags: ['casual', 'comfortable', 'sporty'] },
    { name: 'Black Oxford Shoes', category: 'shoes', subcategory: 'oxfords', color: 'black', material: 'leather', pattern: 'solid', fit: 'regular', season: ['all-season'], style: ['formal', 'business'], occasion: ['work', 'formal-event'], condition: 'good', warmth: 1, tags: ['formal', 'professional', 'business'] },
    { name: 'Brown Loafers', category: 'shoes', subcategory: 'loafers', color: 'brown', material: 'leather', pattern: 'solid', fit: 'regular', season: ['spring', 'summer'], style: ['business', 'casual'], occasion: ['work', 'daily'], condition: 'good', warmth: 1, tags: ['business-casual', 'comfortable'] },
    
    // Accessories
    { name: 'Black Leather Belt', category: 'accessory', subcategory: 'belt', color: 'black', material: 'leather', pattern: 'solid', fit: 'regular', season: ['all-season'], style: ['formal', 'business'], occasion: ['work'], condition: 'good', tags: ['formal', 'professional'] },
    { name: 'Silver Watch', category: 'accessory', subcategory: 'watch', color: 'silver', material: 'metal', pattern: 'solid', fit: 'regular', season: ['all-season'], style: ['formal', 'business'], occasion: ['work', 'formal-event'], condition: 'good', tags: ['versatile', 'elegant'] },
    { name: 'Blue Scarf', category: 'accessory', subcategory: 'scarf', color: 'blue', material: 'wool', pattern: 'solid', fit: 'regular', season: ['winter'], style: ['casual'], occasion: ['daily'], condition: 'good', warmth: 4, tags: ['casual', 'winter', 'stylish'] },
  ];

  for (const item of items) {
    await prisma.wardrobeItem.create({
      data: {
        ...item,
        season: JSON.stringify(item.season || []),
        style: JSON.stringify(item.style || []),
        occasion: JSON.stringify(item.occasion || []),
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
