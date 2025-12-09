import request from 'supertest';
import app from '../app.js'; // Import Express app
import prisma from '../utils/prisma.js'; // Import Prisma Client

// Test credentials
const testUser = {
  name: 'Test User',
  email: 'test@crm.com',
  password: 'securepassword123',
};

const baseUrl = '/api/v1/auth';
let authToken; // Store JWT token after login

// Use beforeAll to clean and set up database
beforeAll(async () => {
  // Ensure tables are clean (delete order matters)
  await prisma.activity.deleteMany(); // 1. Clear activities first
  await prisma.lead.deleteMany();     // 2. Then leads
  await prisma.user.deleteMany();     // 3. Finally users
  console.log('Database cleared before all auth tests.');
});

// Clean database after tests
afterAll(async () => {
  // Ensure database is clean again
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
  console.log('Database cleared after all auth tests.');
});

describe('Auth Routes (Registration and Login)', () => {
  
  // 3. Register Test: Successful registration of a new user
  it('should register a new user successfully (201)', async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser)
      .expect(201); // 201 Created

    expect(response.body.status).toBe('success');
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.role).toBe('SALES_EXECUTIVE'); // Default role check
  });

  // 4. Duplicate Register Test: Should fail with duplicate email
  it('should return 400 for duplicate user registration (P2002)', async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser)
      .expect(400); // 400 Bad Request

    expect(response.body.message).toMatch(/already exists/i);
  });

  // 5. Login Test: Successful login with correct credentials
  it('should log in with correct credentials and return a token (200)', async () => {
    const response = await request(app)
      .post(`${baseUrl}/login`)
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200); // 200 OK

    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(testUser.email);
    
    // Store JWT token for future RBAC and authentication tests
    authToken = response.body.token;
  });

  // 5. Login Test: Should fail with incorrect password
  it('should return 401 for incorrect password', async () => {
    await request(app)
      .post(`${baseUrl}/login`)
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })
      .expect(401); // 401 Unauthorized
  });

  // 5. Login Test: Should fail for non-existent user
  it('should return 401 for non-existent user', async () => {
    await request(app)
      .post(`${baseUrl}/login`)
      .send({
        email: 'nonexistent@user.com',
        password: testUser.password,
      })
      .expect(401); // 401 Unauthorized
  });

  // Verify JWT token is stored (for use in other tests)
  it('should have a valid authentication token stored', () => {
    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe('string');
  });

});