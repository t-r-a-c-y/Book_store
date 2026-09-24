const cds = require('@sap/cds');

const {
    SELECT,
    INSERT,
    UPDATE
} = cds.ql;

module.exports = cds.service.impl(function () {

    this.before('CREATE', 'Authors', async (req) => {
        const name = req.data.name?.trim();
        if (!name) {
            return req.reject(
                400,
                'AUTHOR_NAME_REQUIRED'
            );
        }

        const existingAuthor = await SELECT.one
            .from('my.bookshop.Authors')
            .where({ name });

        if (existingAuthor) {
            return req.reject(
                400,
                'AUTHOR_ALREADY_EXISTS'
            );
        }
    });

    this.before('CREATE', 'Books', async (req) => {
        const title = req.data.title?.trim();
        if (!title) {
            return req.reject(
                400,
                'BOOK_TITLE_REQUIRED'
            );
        }

        const existingBook = await SELECT.one
            .from('my.bookshop.Books')
            .where({ title });

        if (existingBook) {
            return req.reject(
                400,
                'BOOK_ALREADY_EXISTS'
            );
        }
    });

    this.after('READ', 'Books', async (books) => {
        const list = Array.isArray(books) ? books : [books];
        for (const book of list) {
            if (!book) {
                continue;
            }
            book.stockStatus =
                book.stock > 0
                    ? 'In Stock'
                    : 'Out of Stock';
        }
    });

    this.on('restock', 'Books', async (req) => {
        const { amount } = req.data;
        const bookId = req.params[0].ID;

        if (!Number.isInteger(amount) || amount <= 0) {
            return req.reject(
                400,
                'INVALID_RESTOCK_AMOUNT'
            );
        }

        const book = await SELECT.one
            .from('my.bookshop.Books')
            .where({ ID: bookId });

        if (!book) {
            return req.reject(
                404,
                'BOOK_NOT_FOUND'
            );
        }

        await UPDATE('my.bookshop.Books')
            .set({
                stock: { '+=': amount }
            })
            .where({ ID: bookId });

        return SELECT.one
            .from('my.bookshop.Books')
            .where({ ID: bookId });
    });

    this.on('cancelOrder', 'Orders', async (req) => {
        const orderId = req.params[0].ID;
        const order = await SELECT.one
            .from('my.bookshop.Orders')
            .where({ ID: orderId });

        if (!order) {
            return req.reject(
                404,
                'ORDER_NOT_FOUND'
            );
        }

        if (order.status === 'Cancelled') {
            return req.reject(
                400,
                'ORDER_ALREADY_CANCELLED'
            );
        }

        await UPDATE('my.bookshop.Orders')
            .set({ status: 'Cancelled' })
            .where({ ID: orderId });

        return SELECT.one
            .from('my.bookshop.Orders')
            .where({ ID: orderId });
    });

    this.on('CREATE', 'Orders', async (req) => {
        const tx = cds.tx(req);
        const { user_ID, orderDate, items } = req.data;

        if (!user_ID) {
            return req.reject(400, 'USER_REQUIRED');
        }

        if (!items || items.length === 0) {
            return req.reject(400, 'ORDER_EMPTY');
        }

        const quantities = new Map();
        for (const item of items) {
            if (!item.book_ID) {
                return req.reject(400, 'BOOK_NOT_FOUND');
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return req.reject(400, 'INVALID_QUANTITY');
            }

            const currentQuantity = quantities.get(item.book_ID) || 0;
            quantities.set(item.book_ID, currentQuantity + item.quantity);
        }

        const user = await tx.run(
            SELECT.one
                .from('my.bookshop.Users')
                .where({ ID: user_ID })
        );

        if (!user) {
            return req.reject(404, 'USER_NOT_FOUND');
        }

        const bookIds = [...quantities.keys()];
        const books = await tx.run(
            SELECT.from('my.bookshop.Books')
                .where({ ID: { in: bookIds } })
        );

        const booksMap = new Map(books.map(book => [book.ID, book]));
        let totalAmount = 0;

        for (const [bookId, quantity] of quantities) {
            const book = booksMap.get(bookId);
            if (!book) {
                return req.reject(404, 'BOOK_NOT_FOUND');
            }
            if (quantity > book.stock) {
                return req.reject(400, 'INSUFFICIENT_STOCK');
            }
            totalAmount += Number(book.price) * quantity;
        }

        if (totalAmount > Number(user.budget)) {
            return req.reject(400, 'INSUFFICIENT_BUDGET');
        }

        const orderId = cds.utils.uuid();
        await tx.run(
            INSERT.into('my.bookshop.Orders').entries({
                ID: orderId,
                orderDate: orderDate || new Date().toISOString().split('T')[0],
                user_ID,
                status: 'Active'
            })
        );

        for (const [bookId, quantity] of quantities) {
            const book = booksMap.get(bookId);

            await tx.run(
                INSERT.into('my.bookshop.OrderItems').entries({
                    ID: cds.utils.uuid(),
                    quantity,
                    order_ID: orderId,
                    book_ID: bookId
                })
            );

            await tx.run(
                UPDATE('my.bookshop.Books')
                    .set({ stock: { '-=': quantity } })
                    .where({ ID: bookId })
            );

            await tx.run(
                INSERT.into('my.bookshop.PurchaseLogs').entries({
                    ID: cds.utils.uuid(),
                    user_ID,
                    order_ID: orderId,
                    book_ID: bookId,
                    quantity,
                    amount: Number(book.price) * quantity
                })
            );
        }
    });

    this.on('READ', 'Suppliers', async (req) => {

        try {

            const bupa =
                await cds.connect.to(
                    'API_BUSINESS_PARTNER'
                );

            return await bupa.run(
                SELECT
                    .from(
                        bupa.entities.A_BusinessPartner
                    )
                    .columns(
                        'BusinessPartner',
                        'BusinessPartnerFullName',
                        'BusinessPartnerIsBlocked'
                    )
            );

        } catch (error) {

            console.error(
                'Business Partner service failed:',
                error
            );

            return req.reject(
                503,
                'SUPPLIER_SERVICE_UNAVAILABLE'
            );
        }
    });
    this.before('SAVE', 'Books', async (req) => {
    const { title, ID } = req.data;

    const existing = await SELECT.one
        .from('my.bookshop.Books')
        .where({ title });

    if (existing && existing.ID !== ID) {
        req.error(400, 'A book with this title already exists.');
    }
});
    
});
