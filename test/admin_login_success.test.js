const request = require('supertest');
const shopRouter = require('../routes/shopRoutes'); // Import router
const baseUrl = 'http://localhost:8000'

describe('AdminLogin', () => {

  it('Đăng nhập thành công với email và mật khẩu đúng', async () => {
    let response = await request(baseUrl)
      .post('/api/admin')
      .send({ uname: 'admin@gmail.com', pwd: 'Admin123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
  });

  it('Đăng nhập thất bại với mật khẩu sai', async () => {
    let response = await request(baseUrl)
      .post('/api/admin')
      .send({ uname: 'admin@gmail.com', pwd: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid password');
  });

  it('Đăng nhập thất bại với email không tồn tại', async () => {
    let response = await request(baseUrl)
      .post('/api/admin')
      .send({ uname: 'notfound@example.com', pwd: 'Admin123' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid email');
  });
});
