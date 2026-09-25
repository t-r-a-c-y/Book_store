    const cds = require('@sap/cds');

describe('Bookshop', () => {

    test('CAP server starts', async () => {

        const { GET } = cds.test();

        const response = await GET('/odata/v4/catalog/Books');

        expect(response.status).toBe(200);

    });

});