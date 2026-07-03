import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Imperial Solitaire Gold Ring',
    sku: 'RG-IMP-101',
    description: 'A solid 24K gold maharaja signet ring featuring traditional filigree carvings, perfect for auspicious occasions.',
    price: 85000,
    category: 'Rings',
    purity: '24K',
    weight: 11.5,
    images: ['/images/ring.png'],
    stock: 12
  },
  {
    name: 'Royal Heritage Bridal Choker',
    sku: 'NK-HER-201',
    description: 'An intricate traditional 22K gold bridal choker necklace handcrafted by master goldsmiths in Mumbai.',
    price: 195000,
    category: 'Necklaces',
    purity: '22K',
    weight: 28.2,
    images: ['/images/necklace.png'],
    stock: 5
  },
  {
    name: 'Divine Blossom Jhumka Set',
    sku: 'ER-DIV-301',
    description: 'A pair of traditional gold jhumka earrings featuring delicate floral motif carvings and dangling beads.',
    price: 125000,
    category: 'Earrings',
    purity: '22K',
    weight: 16.8,
    images: ['/images/earrings.png'],
    stock: 8
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('Product catalog cleared.');

    // Insert sample items
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} premium products.`);

    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
