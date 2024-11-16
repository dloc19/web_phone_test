const request = require('supertest');
const shopRouter = require('../routes/shopRoutes'); // Import router
const baseUrl = 'http://localhost:8000'

describe('REGISTER', () => {

  it('should return 401 if required fields are missing', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: '', pwd: 'password123', password_confirm: 'password123', addr: 'Address' });

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if email is not in correct format', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: 'john.doe', pwd: 'password123', password_confirm: 'password123', addr: 'Address' });

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if passwords do not match', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: 'john.doe@gmail.com', pwd: 'password123', password_confirm: 'password456', addr: 'Address' });

    expect(response.statusCode).toBe(401);
  });

  it('should return 401 if password length is less than 6 characters', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: 'john.doe@gmail.com', pwd: '123', password_confirm: '123', addr: 'Address' });

    expect(response.statusCode).toBe(401);
  });

/*  it('should return 401 if email already exists', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: 'john.doe@gmail.com', pwd: 'password123', password_confirm: 'password123', addr: 'Address' });

    expect(response.statusCode).toBe(401);
  });
*/
  it('should insert user successfully if all data is valid', async () => {
    const response = await request(baseUrl)
      .post('/register')
      .send({ fullname: 'John Doe', uname: 'john.doe@gmail.com', pwd: 'password123', password_confirm: 'password123', addr: 'Address' });

    expect(response.statusCode).toBe(302); // Redirect status code
  });
});
