const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');

const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
// Add other models if needed for interconnected data
// const Cart = require('../models/Cart');
// const Order = require('../models/Order');
// const Quote = require('../models/Quote');
// const BusinessRequirement = require('../models/BusinessRequirement');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// --- Data Generation Functions ---

const generatePasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const generateUser = async (role) => {
  const fullName = faker.person.fullName();
  const email = faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase();
  const mobile = faker.phone.number('##########');
  const passwordHash = await generatePasswordHash('password123'); // Default password for seeded users

  const user = {
    fullName,
    email,
    mobile,
    passwordHash,
    role,
    isVerified: true,
    profilePicture: faker.image.avatar(),
    bio: faker.person.bio(),
  };

  if (role === 'farmer') {
    user.farmName = faker.company.name();
    user.farmAddress = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
    };
    user.farmGeolocation = {
      lat: faker.location.latitude(),
      lng: faker.location.longitude(),
    };
    user.cropsGrown = faker.helpers.arrayElements(['Wheat', 'Rice', 'Corn', 'Potatoes', 'Tomatoes', 'Apples', 'Oranges'], { min: 1, max: 3 });
    user.businessName = faker.company.name();
    user.bankDetails = {
      accountName: fullName,
      accountNumber: faker.finance.accountNumber(),
      bankName: faker.company.name() + ' Bank',
      branch: faker.location.city() + ' Branch',
      ifscCode: faker.finance.routingNumber(),
    };
    user.documents = [
      { name: 'Organic Certificate', url: faker.image.urlLoremFlickr({ category: 'documents' }), verificationStatus: 'approved' },
      { name: 'ID Proof', url: faker.image.urlLoremFlickr({ category: 'documents' }), verificationStatus: 'approved' },
    ];
    user.photos = [faker.image.urlLoremFlickr({ category: 'farm' }), faker.image.urlLoremFlickr({ category: 'farm' })];
  } else if (role === 'business') {
    user.companyName = faker.company.name();
    user.businessType = faker.commerce.department();
    user.companyAddress = faker.location.streetAddress(true);
    user.gstin = faker.string.alphanumeric(15).toUpperCase();
    user.cin = faker.string.alphanumeric(21).toUpperCase();
    user.contactPersonName = faker.person.fullName();
    user.contactPersonDesignation = faker.person.jobTitle();
    user.produceRequired = faker.helpers.arrayElements(['Vegetables', 'Fruits', 'Grains'], { min: 1, max: 2 });
    user.documents = [
      { name: 'Business License', url: faker.image.urlLoremFlickr({ category: 'documents' }), verificationStatus: 'approved' },
    ];
  } else if (role === 'customer') {
    user.deliveryAddress = faker.location.streetAddress(true);
    user.billingAddress = faker.location.streetAddress(true);
  }

  return user;
};

const generateProduct = (farmerId) => {
  const category = faker.helpers.arrayElement(['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'flowers', 'other']);
  const unit = faker.helpers.arrayElement(['kg', 'g', 'lb', 'ton', 'piece', 'dozen', 'bunch', 'bag', 'box', 'quintal']);
  const grade = faker.helpers.arrayElement(['premium', 'grade-a', 'grade-b', 'standard', 'commercial']);
  const packaging = faker.helpers.arrayElement(['loose', 'plastic-bag', 'cardboard-box', 'wooden-crate', 'jute-bag', 'vacuum-sealed', 'other']);
  const status = faker.helpers.arrayElement(['draft', 'published', 'unlisted', 'private']);
  const shippingOptions = faker.helpers.arrayElements(['pickup', 'delivery', 'express-delivery', 'cold-chain'], { min: 1, max: 2 });
  const certifications = faker.helpers.arrayElements(['organic', 'fssai', 'iso', 'halal', 'kosher', 'fair-trade', 'rainforest-alliance', 'other'], { min: 0, max: 2 });

  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category,
    subcategory: faker.commerce.productAdjective(),
    origin: faker.location.city(),
    price: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
    currency: 'INR',
    discount: faker.number.int({ min: 0, max: 20 }),
    unit,
    quantity: faker.number.int({ min: 10, max: 1000 }),
    moq: faker.number.int({ min: 1, max: 10 }),
    harvestDate: faker.date.past({ years: 1 }),
    shelfLife: faker.helpers.arrayElement(['1 week', '2 weeks', '1 month', '3 months', '6 months']),
    grade,
    packaging,
    sku: faker.string.alphanumeric(10).toUpperCase(),
    images: [faker.image.urlLoremFlickr({ category: category }), faker.image.urlLoremFlickr({ category: category })],
    video: faker.internet.url(),
    shippingOptions,
    deliveryRadius: faker.number.int({ min: 5, max: 100 }) + 'km',
    shippingCharges: faker.commerce.price({ min: 0, max: 50, dec: 2 }),
    leadTime: faker.helpers.arrayElement(['1-2 days', '2-3 days', '3-5 days']),
    tags: faker.helpers.arrayElements([category, unit, grade, packaging, 'fresh', 'local', 'organic'], { min: 2, max: 5 }),
    certifications,
    status,
    farmer: farmerId,
    additionalInfo: faker.lorem.paragraph(),
    keywords: faker.helpers.arrayElements([faker.commerce.productMaterial(), faker.commerce.productAdjective()], { min: 1, max: 3 }),
    seo: {
      slug: faker.lorem.slug(),
      metaDesc: faker.lorem.sentence(),
    },
    isAvailable: faker.datatype.boolean(),
    isFeatured: faker.datatype.boolean(),
  };
};

// --- Seeding Logic ---
const seedDB = async () => {
  await connectDB();

  try {
    console.log('Starting data seeding...');

    // Clear existing data (optional, but good for fresh seeds)
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared.');

    // 1. Create Users
    const usersToCreate = [];
    const businessCount = 3;
    const customerCount = 5;
    const adminCount = 1;

    // Create Vicky the farmer
    const vickyPasswordHash = await generatePasswordHash('password123');
    const vicky = new User({
      fullName: 'Vicky',
      email: 'vicky@example.com', // Assuming a default email for Vicky
      mobile: faker.phone.number('##########'),
      passwordHash: vickyPasswordHash,
      role: 'farmer',
      isVerified: true,
      profilePicture: faker.image.avatar(),
      bio: faker.person.bio(),
      farmName: 'Vicky's Farm',
      farmAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
      farmGeolocation: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
      cropsGrown: faker.helpers.arrayElements(['Wheat', 'Rice', 'Corn', 'Potatoes', 'Tomatoes', 'Apples', 'Oranges'], { min: 1, max: 3 }),
      businessName: 'Vicky's Fresh Produce',
      bankDetails: {
        accountName: 'Vicky',
        accountNumber: faker.finance.accountNumber(),
        bankName: faker.company.name() + ' Bank',
        branch: faker.location.city() + ' Branch',
        ifscCode: faker.finance.routingNumber(),
      },
      documents: [
        { name: 'Organic Certificate', url: faker.image.urlLoremFlickr({ category: 'documents' }), verificationStatus: 'approved' },
        { name: 'ID Proof', url: faker.image.urlLoremFlickr({ category: 'documents' }), verificationStatus: 'approved' },
      ],
      photos: [faker.image.urlLoremFlickr({ category: 'farm' }), faker.image.urlLoremFlickr({ category: 'farm' })],
    });
    await vicky.save();
    console.log('Seeded Vicky the farmer.');

    for (let i = 0; i < businessCount; i++) usersToCreate.push(await generateUser('business'));
    for (let i = 0; i < customerCount; i++) usersToCreate.push(await generateUser('customer'));
    for (let i = 0; i < adminCount; i++) usersToCreate.push(await generateUser('admin'));

    const createdOtherUsers = await User.insertMany(usersToCreate);
    console.log(`Seeded ${createdOtherUsers.length} other users.`);

    // 2. Create Products for Vicky
    const productsToCreate = [];
    const numProductsForVicky = faker.number.int({ min: 5, max: 10 }); // Vicky has 5-10 products
    for (let i = 0; i < numProductsForVicky; i++) {
      productsToCreate.push(generateProduct(vicky._id));
    }

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Seeded ${createdProducts.length} products for Vicky.`);

    // Add seeding for other models here if needed, linking to createdUsers and createdProducts

    console.log('Data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();