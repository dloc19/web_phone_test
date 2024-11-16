const request = require('supertest');
const shopRouter = require('../routes/shopRoutes'); // Import router
const baseUrl = 'http://localhost:8000'

describe('update a product', () => {
  
  it('should return 400 if no fields are provided to update', async () => {
    const response = await request(baseUrl)
      .put('/api/product/15')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('No fields to update.');
  });

  it('should return 404 if the product is not found', async () => {
    const updatedProductData = {
      prod_img: 'new_image.jpg',
      prod_name: 'Updated Product',
      prod_qty: '20',
      prod_price: '200',
      prod_cat: '8',
      prod_stat: '0'
    };

    const response = await request(baseUrl)
      .put('/api/product/133')
      .send(updatedProductData);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Product not found.');
  });

  it('should return 500 if there is a database error', async () => {
    const updatedProductData = {
      prod_img: 'new_image.jpg',
      prod_name: 'Updated Product',
      prod_qty: '20',
      prod_price: '200',
      prod_cat: '8',
      prod_stat: '0'
    };

    const response = await request(baseUrl)
      .put('/api/product/15')
      .send(updatedProductData);

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });

  it('should update product successfully and return a success message', async () => {
    const updatedProductData = {
      prod_img: 'new_image.jpg',
      prod_name: 'Product 1',
      prod_qty: '20',
      prod_price: '200',
      prod_cat: '8',
      prod_stat: '0'
    };

    const response = await request(baseUrl)
      .put('/api/product/15')
      .send(updatedProductData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Product updated successfully.');
  });
});
