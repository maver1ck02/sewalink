/**
 * Demo seed — fictional people and businesses only.
 * Run: npm run seed --prefix server
 *
 * Admin comes from ADMIN_EMAIL / ADMIN_PASSWORD in .env
 * Other demo users share SEED_PASSWORD.
 */
import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Portfolio from '../models/Portfolio.js';
import Favorite from '../models/Favorite.js';
import Settings from '../models/Settings.js';
import { calculateTrustScore } from '../services/trustScore.js';

const categoriesSeed = [
  { name: 'Plumbing', slug: 'plumbing', icon: 'FiDroplet', description: 'Pipes, leaks, bathrooms' },
  { name: 'Electrical', slug: 'electrical', icon: 'FiZap', description: 'Wiring, fans, lighting' },
  { name: 'Computer Repair', slug: 'computer-repair', icon: 'FiMonitor', description: 'Laptops and desktops' },
  { name: 'Mobile Repair', slug: 'mobile-repair', icon: 'FiSmartphone', description: 'Phone screens and batteries' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'FiWind', description: 'Home and office cleaning' },
  { name: 'Carpentry', slug: 'carpentry', icon: 'FiTool', description: 'Furniture and woodwork' },
  { name: 'Painting', slug: 'painting', icon: 'FiEdit3', description: 'Interior and exterior' },
  { name: 'Photography', slug: 'photography', icon: 'FiCamera', description: 'Events and portraits' },
  { name: 'Tutoring', slug: 'tutoring', icon: 'FiBookOpen', description: 'School and exam prep' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'FiCpu', description: 'Fridge, AC, washer' },
  { name: 'Bike Repair', slug: 'bike-repair', icon: 'FiTruck', description: 'Motorcycle servicing' },
  { name: 'Graphic Design', slug: 'graphic-design', icon: 'FiPenTool', description: 'Logos and print' },
];

const providerSeeds = [
  {
    city: 'Kathmandu',
    lng: 85.324,
    lat: 27.7172,
    businessName: 'Himal Tech Repair',
    owner: 'Sajan Magar',
    email: 'sajan.provider@sewalink.local',
    cat: 'computer-repair',
    title: 'Laptop diagnosis & repair',
    priceType: 'starting',
    startingPrice: 1500,
    price: 1500,
    desc: 'Same-day laptop repair in Kathmandu. Hardware, OS, data recovery.',
    rating: 4.8,
    jobs: 128,
    reviews: 46,
    featured: true,
    verified: true,
  },
  {
    city: 'Kathmandu',
    lng: 85.31,
    lat: 27.71,
    businessName: 'Valley Plumbers',
    owner: 'Ramesh Karki',
    email: 'ramesh.provider@sewalink.local',
    cat: 'plumbing',
    title: 'Leak repair visit',
    priceType: 'fixed',
    startingPrice: 800,
    price: 800,
    desc: 'Licensed plumbing for apartments and homes across the valley.',
    rating: 4.6,
    jobs: 210,
    reviews: 72,
    featured: true,
    verified: true,
  },
  {
    city: 'Lalitpur',
    lng: 85.3247,
    lat: 27.6588,
    businessName: 'Patan Electric Works',
    owner: 'Bina Shrestha',
    email: 'bina.provider@sewalink.local',
    cat: 'electrical',
    title: 'Home wiring check',
    priceType: 'quotation',
    startingPrice: 0,
    price: 0,
    desc: 'Safe electrical upgrades, inverter wiring, and lighting.',
    rating: 4.9,
    jobs: 96,
    reviews: 31,
    featured: true,
    verified: true,
  },
  {
    city: 'Pokhara',
    lng: 83.9856,
    lat: 28.2096,
    businessName: 'Lakeside Lens Studio',
    owner: 'Anil Gurung',
    email: 'anil.provider@sewalink.local',
    cat: 'photography',
    title: 'Event photography (half day)',
    priceType: 'starting',
    startingPrice: 12000,
    price: 12000,
    desc: 'Weddings, portraits, and lakeside couple shoots.',
    rating: 4.7,
    jobs: 64,
    reviews: 22,
    featured: false,
    verified: true,
  },
  {
    city: 'Kathmandu',
    lng: 85.34,
    lat: 27.72,
    businessName: 'Sparkle Home Care',
    owner: 'Maya Tamang',
    email: 'maya.provider@sewalink.local',
    cat: 'cleaning',
    title: '2BHK deep clean',
    priceType: 'fixed',
    startingPrice: 3500,
    price: 3500,
    desc: 'Eco-friendly home cleaning with trained staff.',
    rating: 4.5,
    jobs: 80,
    reviews: 28,
    featured: true,
    verified: false,
  },
];

async function run() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Category.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Portfolio.deleteMany({}),
    Favorite.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(env.seedPassword, 10);
  const adminHash = await bcrypt.hash(env.adminPassword, 10);

  const admin = await User.create({
    name: 'SewaLink Admin',
    email: env.adminEmail,
    passwordHash: adminHash,
    role: 'admin',
    emailVerified: true,
    locationLabel: 'Kathmandu',
  });

  const customer = await User.create({
    name: 'Niraj Customer',
    email: 'customer@sewalink.local',
    phone: '9800000001',
    passwordHash,
    role: 'customer',
    emailVerified: true,
    locationLabel: 'Kathmandu',
    location: { type: 'Point', coordinates: [85.324, 27.7172] },
  });

  const cats = await Category.insertMany(categoriesSeed);
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const providers = [];
  for (const p of providerSeeds) {
    const user = await User.create({
      name: p.owner,
      email: p.email,
      phone: '9801112233',
      passwordHash,
      role: 'provider',
      emailVerified: true,
      locationLabel: p.city,
      location: { type: 'Point', coordinates: [p.lng, p.lat] },
    });
    const profile = await ProviderProfile.create({
      user: user._id,
      businessName: p.businessName,
      ownerName: p.owner,
      description: p.desc,
      phone: '9801112233',
      email: p.email,
      categories: [bySlug[p.cat]._id],
      serviceAreas: [p.city, 'Nearby areas'],
      locationLabel: p.city,
      location: { type: 'Point', coordinates: [p.lng, p.lat] },
      experienceYears: 5,
      verificationStatus: p.verified ? 'approved' : 'pending',
      averageRating: p.rating,
      totalReviews: p.reviews,
      completedJobs: p.jobs,
      responseRate: 96,
      featured: p.featured,
      isAvailable: true,
    });
    profile.trustScore = calculateTrustScore(profile, { accountCreatedAt: user.createdAt, reportCount: 0 });
    await profile.save();

    await Service.create({
      provider: profile._id,
      category: bySlug[p.cat]._id,
      title: p.title,
      description: p.desc,
      priceType: p.priceType,
      price: p.price,
      startingPrice: p.startingPrice,
      serviceArea: p.city,
    });

    await Portfolio.create({
      provider: profile._id,
      title: 'Recent completed job',
      description: 'Sample portfolio item for demo.',
      category: bySlug[p.cat]._id,
      completedAt: new Date(),
    });

    providers.push({ profile, user, seed: p });
  }

  const tech = providers[0];
  const completed = await Booking.create({
    customer: customer._id,
    provider: tech.profile._id,
    scheduledAt: new Date(Date.now() - 5 * 86400000),
    address: 'Baneshwor, Kathmandu',
    locationLabel: 'Kathmandu',
    description: 'Laptop overheating during work.',
    status: 'COMPLETED',
    quotedPrice: 2500,
    finalPrice: 2500,
    statusHistory: [{ status: 'COMPLETED', by: customer._id }],
  });

  await Review.create({
    booking: completed._id,
    customer: customer._id,
    provider: tech.profile._id,
    overallRating: 5,
    serviceQuality: 5,
    communication: 5,
    professionalism: 4,
    comment: 'Fixed my laptop the same afternoon. Clear pricing.',
  });

  await Booking.create({
    customer: customer._id,
    provider: providers[1].profile._id,
    scheduledAt: new Date(Date.now() + 2 * 86400000),
    address: 'Maharajgunj, Kathmandu',
    locationLabel: 'Kathmandu',
    description: 'Kitchen sink leak.',
    status: 'SCHEDULED',
    quotedPrice: 800,
    statusHistory: [{ status: 'SCHEDULED', by: customer._id }],
  });

  await Favorite.create({ customer: customer._id, provider: tech.profile._id });
  await Notification.create({
    user: customer._id,
    type: 'welcome',
    title: 'Welcome to SewaLink',
    message: 'Find trusted people for every job.',
  });
  await Settings.create({ key: 'platform' });

  console.log('Seed complete.');
  console.log('Admin:', env.adminEmail, env.adminPassword);
  console.log('Customer: customer@sewalink.local /', env.seedPassword);
  console.log('Provider:', providerSeeds[0].email, '/', env.seedPassword);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
