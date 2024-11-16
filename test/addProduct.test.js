const request = require('supertest');
const shopRouter = require('../routes/shopRoutes'); // Import router
const baseUrl = 'http://localhost:8000'

describe('Add a product', () => {

  it('should return 400 if no image is uploaded', async () => {
    const response = await request(baseUrl)
      .post('/admin/addProduct')
      .send({
        prod_name: 'Product 1',
        prod_qty: '10',
        prod_price: '100',
        prod_cat: '1'
      });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(baseUrl)
      .post('/admin/addProduct')
      .send({
        prod_name: '',
        prod_qty: '10',
        prod_price: '100',
        prod_cat: '1'
      });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if quantity or price is not a valid number', async () => {
    const response = await request(baseUrl)
      .post('/admin/addProduct')
      .send({
        prod_name: 'Product 1',
        prod_qty: 'invalid_qty',
        prod_price: '100',
        prod_cat: '1'
      });

    expect(response.statusCode).toBe(400);
  });

  it('should add product successfully and return success message', async () => {
    const response = await request(baseUrl)
      .post('/admin/addProduct')
      .field('prod_name', 'Product 1')
      .field('prod_qty', '10')
      .field('prod_price', '100')
      .field('prod_cat', '1')
      .attach('prod_img', Buffer.from('dummy'), 'dummy_image.jpg');

    expect(response.statusCode).toBe(200);
  });

});
