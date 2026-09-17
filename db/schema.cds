namespace my.bookshop;


using { cuid, managed } from '@sap/cds/common';


// Order status
type OrderStatus : String enum {
    Active;
    Cancelled;
    Completed;
};

//authors
entity Authors : cuid, managed {

    @mandatory
    name : localized String(100);

    @mandatory
    @assert.format: '^[A-Z]{2}$'
    country : String(2);

    books : Association to many Books
        on books.author = $self;
}


//Books
entity Books : cuid, managed {
    @mandatory
    title : localized String(100);

    description : localized String(1000);

    @mandatory
    @assert.range: [0, 100000]
    price : Decimal(9,2);

    @assert.range: [0, 10000]
    stock : Integer default 10;

    @mandatory
    author : Association to Authors;


}


//users
entity Users : cuid, managed {

    @mandatory
    name : String(100);

    @assert.range: [0, 1000000]
    budget : Decimal(12,2) default 0;
}


//orders
entity Orders : cuid, managed {

    @mandatory
    orderDate : Date;

    @mandatory
    user : Association to Users;

    status : OrderStatus default #Active;

    items : Composition of many OrderItems
        on items.order = $self;
}


//OrderItems
entity OrderItems : cuid {

    @assert.range: [1, 1000]
    quantity : Integer;

    @mandatory
    order : Association to Orders;

    @mandatory
    book : Association to Books;
}


entity PurchaseLogs : cuid, managed {

    @mandatory
    user : Association to Users;

    @mandatory
    order : Association to Orders;

    @mandatory
    book : Association to Books;

    @assert.range: [1, 1000]
    quantity : Integer;

    @mandatory
    @assert.range: [0, 1000000]
    amount : Decimal(12,2);
}


