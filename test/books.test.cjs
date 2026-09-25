const cds = require('@sap/cds');

// 1. Force Jest to wait up to 30 seconds for any setup hooks to complete
jest.setTimeout(30000);

// 2. Start your local CAP instance safely using standard directory resolution
const { GET } = cds.test(__dirname + '/..');

describe('Bookshop', () => {

    test('CAP server starts', async () => {

        const response = await GET('/odata/v4/catalog/Books');

        expect(response.status).toBe(200);

    });

});
