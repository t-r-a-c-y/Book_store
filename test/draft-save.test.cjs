const cds = require('@sap/cds');

const { POST, PATCH } = cds.test(__dirname + '/..');

describe('Draft Save', () => {

    test('saves a draft and activates it', async () => {

        const draft = await POST('/odata/v4/catalog/Books', {
            title: 'Save Test Book',
            description: 'Testing draft activation',
            price: 30,
            stock: 5,
            author_ID: 'author-1'
        });

        expect(draft.status).toBe(201);
        expect(draft.data.IsActiveEntity).toBe(false);

        const ID = draft.data.ID;

       const response = await POST(
    `/odata/v4/catalog/Books(ID=${ID},IsActiveEntity=false)/CatalogService.draftActivate`
);

console.log('ACTIVATE STATUS:', response.status);
console.log('ACTIVATE DATA:', response.data);

expect(response.status).toBe(200);

        // expect([200, 204]).toContain(response.status);
    });
}); 