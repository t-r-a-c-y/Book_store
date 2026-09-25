const cds = require('@sap/cds');
const { POST, GET, PATCH } = cds.test(__dirname + '/..');

describe('Draft Lifecycle', () => {

    test('creates a new draft', async () => {

        const response = await POST('/odata/v4/catalog/Books', {
            title: 'Draft Testing',
            description: 'Testing drafts',
            price: 30,
            stock: 5,
            author_ID: 'author-1'
        });

        expect(response.status).toBe(201);

        expect(response.data.IsActiveEntity).toBe(false);

        expect(response.data.HasActiveEntity).toBe(false);

    });

    test('updates the draft with PATCH', async () => {

    const draft = await POST('/odata/v4/catalog/Books', {
        title: 'Patch Book',
        description: 'Before',
        price: 20,
        stock: 5,
        author_ID: 'author-1'
    });

    const ID = draft.data.ID;

    const response = await PATCH(
    `/odata/v4/catalog/Books(ID='${ID}',IsActiveEntity=false)`,
    {
        price: 45
    }
);

    expect(response.status).toBe(200);

    const updated = await GET(
    `/odata/v4/catalog/Books(ID='${ID}',IsActiveEntity=false)`
);

    expect(Number(updated.data.price)).toBe(45);

});

});