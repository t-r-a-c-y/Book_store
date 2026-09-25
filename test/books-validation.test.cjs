const cds = require('@sap/cds');
const { POST } = cds.test(__dirname + '/..');

describe('Book Validations', () => {

    test('rejects negative price', async () => {

        const response = await POST('/odata/v4/catalog/Books', {
            title: 'Bad Book',
            description: 'Invalid',
            price: -5,
            stock: 10,
            author_ID: 'author-1'
        });

        expect(response.status).toBe(400);

    });

    test('rejects duplicate title', async () => {

        const response = await POST('/odata/v4/catalog/Books', {
            title: 'Clean Code',
            description: 'Duplicate',
            price: 40,
            stock: 5,
            author_ID: 'author-1'
        });

        expect(response.status).toBe(400);

    });

    test('creates valid book', async () => {

        const response = await POST('/odata/v4/catalog/Books', {
            title: 'Domain Driven Design',
            description: 'Valid',
            price: 55,
            stock: 8,
            author_ID: 'author-1'
        });

        expect(response.status).toBe(201);

    });

    

});