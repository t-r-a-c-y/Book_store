const cds = require('@sap/cds');

const { POST, GET } = cds.test(__dirname + '/..');

describe('Draft Cancel', () => {

    test('cancels a new draft', async () => {

        const draft = await POST('/odata/v4/catalog/Books', {
            title: 'Cancel Test Book',
            description: 'This draft should be cancelled',
            price: 25,
            stock: 5,
            author_ID: 'author-1'
        });

        expect(draft.status).toBe(201);
        expect(draft.data.IsActiveEntity).toBe(false);

        const ID = draft.data.ID;

        const cancel = await POST(
            `/odata/v4/catalog/Books(ID=${ID},IsActiveEntity=false)/CatalogService.draftDiscard`
        );

        expect([200, 204]).toContain(cancel.status);

        const result = await GET(
            `/odata/v4/catalog/Books(ID=${ID},IsActiveEntity=false)`
        );

        expect(result.status).toBe(404);
    });
});