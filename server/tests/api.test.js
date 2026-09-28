import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../app.js';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import bcrypt from 'bcryptjs';

const app = createApp();
let mongo;
let customerAgent;
let providerAgent;
let adminAgent;
let category;
let providerProfile;
let service;
let bookingId;

test('setup database', async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const passwordHash = await bcrypt.hash('TestPass123!', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@test.local',
    passwordHash,
    role: 'admin',
    emailVerified: true,
  });
  const providerUser = await User.create({
    name: 'Prov',
    email: 'prov@test.local',
    passwordHash,
    role: 'provider',
    emailVerified: true,
  });
  category = await Category.create({ name: 'Computer Repair', slug: 'computer-repair' });
  providerProfile = await ProviderProfile.create({
    user: providerUser._id,
    businessName: 'Test Repair',
    ownerName: 'Prov',
    email: 'prov@test.local',
    categories: [category._id],
    verificationStatus: 'approved',
    isAvailable: true,
    averageRating: 4.5,
  });
  service = await Service.create({
    provider: providerProfile._id,
    category: category._id,
    title: 'Laptop repair',
    priceType: 'starting',
    startingPrice: 1000,
    price: 1000,
  });
  customerAgent = request.agent(app);
  providerAgent = request.agent(app);
  adminAgent = request.agent(app);
});

test('registration', async () => {
  const res = await customerAgent.post('/api/auth/register').send({
    name: 'Cust',
    email: 'cust@test.local',
    password: 'TestPass123!',
    role: 'customer',
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  await User.updateOne({ email: 'cust@test.local' }, { emailVerified: true });
});

test('login customer', async () => {
  const res = await customerAgent.post('/api/auth/login').send({
    email: 'cust@test.local',
    password: 'TestPass123!',
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user.role, 'customer');
});

test('login provider', async () => {
  const res = await providerAgent.post('/api/auth/login').send({
    email: 'prov@test.local',
    password: 'TestPass123!',
  });
  assert.equal(res.status, 200);
});

test('login admin', async () => {
  const res = await adminAgent.post('/api/auth/login').send({
    email: 'admin@test.local',
    password: 'TestPass123!',
  });
  assert.equal(res.status, 200);
});

test('customer cannot access admin', async () => {
  const res = await customerAgent.get('/api/admin/dashboard');
  assert.equal(res.status, 403);
});

test('admin authorization', async () => {
  const res = await adminAgent.get('/api/admin/dashboard');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('provider profile exists', async () => {
  const res = await providerAgent.get('/api/providers/me');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.provider.businessName, 'Test Repair');
});

test('service creation', async () => {
  const res = await providerAgent.post('/api/providers/me/services').send({
    category: String(category._id),
    title: 'Screen replacement',
    priceType: 'fixed',
    price: 4500,
  });
  assert.equal(res.status, 201);
});

test('booking creation', async () => {
  const res = await customerAgent.post('/api/bookings').send({
    providerId: String(providerProfile._id),
    serviceId: String(service._id),
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    address: 'Kathmandu',
    description: 'Fan noise',
  });
  assert.equal(res.status, 201);
  bookingId = res.body.data.booking._id;
});

test('booking status transitions', async () => {
  let res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'ACCEPTED' });
  assert.equal(res.status, 200);
  res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'SCHEDULED' });
  assert.equal(res.status, 200);
  res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'PROVIDER_ON_THE_WAY' });
  assert.equal(res.status, 200);
  res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'IN_PROGRESS' });
  assert.equal(res.status, 200);
  res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'COMPLETED' });
  assert.equal(res.status, 200);
});

test('invalid transition rejected', async () => {
  const res = await providerAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'REQUESTED' });
  assert.equal(res.status, 400);
});

test('review permissions', async () => {
  const bad = await providerAgent.post('/api/reviews').send({
    bookingId,
    overallRating: 5,
    serviceQuality: 5,
    communication: 5,
    professionalism: 5,
  });
  assert.equal(bad.status, 403);
  const ok = await customerAgent.post('/api/reviews').send({
    bookingId,
    overallRating: 5,
    serviceQuality: 5,
    communication: 4,
    professionalism: 5,
    comment: 'Great',
  });
  assert.equal(ok.status, 201);
  const dup = await customerAgent.post('/api/reviews').send({
    bookingId,
    overallRating: 4,
    serviceQuality: 4,
    communication: 4,
    professionalism: 4,
  });
  assert.equal(dup.status, 409);
});

test('favorite functionality', async () => {
  const res = await customerAgent.post('/api/favorites').send({ providerId: String(providerProfile._id) });
  assert.equal(res.status, 201);
  const dup = await customerAgent.post('/api/favorites').send({ providerId: String(providerProfile._id) });
  assert.equal(dup.status, 409);
});

test('cleanup', async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
