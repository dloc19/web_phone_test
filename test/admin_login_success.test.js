// shopRouter.test.js
const request = require('supertest');
const express = require('express');
const shopRouter = require('../routes/shopRoutes');

const app = express();
app.use(express.json()); // Để parse JSON request body
app.use(shopRouter);

describe('POST /admin', () => {
  it('should respond with 200 and success message for valid credentials', async () => {
    const response = await request(app)
      .post('/admin')
      .send({ username: 'admin@gmail.com', password: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Login successful' });
  });

  it('should respond with 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/admin')
      .send({ username: 'admin@gmail.com', password: 'admin' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });
});
