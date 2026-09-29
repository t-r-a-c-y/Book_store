using from '@cap-js/change-tracking';   

using my.bookshop from './schema';

annotate my.bookshop.Books with @changelog: [title] {
    title       @changelog;
    description @changelog;
    price       @changelog;
    stock       @changelog;
    author      @changelog: [author.name];
}

annotate my.bookshop.Orders with @changelog: [orderDate] {
    status @changelog;
}

annotate my.bookshop.OrderItems with @changelog: [book.title] {
    quantity @changelog;
}