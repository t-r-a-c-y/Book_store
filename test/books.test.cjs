const cds = require('@sap/cds');

// Start your local CAP instance using standard directory resolution
const { GET } = cds.test(__dirname + '/..');

// We append 15000 (15 seconds) as the 3rd argument to give the compiler enough setup time
describe('Bookshop', () => {

    test('CAP server starts', async () => {

        const response = await GET('/odata/v4/catalog/Books');

        expect(response.status).toBe(200);

    }, 15000);

}, 15000);
