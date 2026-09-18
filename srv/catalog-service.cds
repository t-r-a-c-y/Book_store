using my.bookshop as db from '../db/schema';

using { API_BUSINESS_PARTNER as external }
    from './external/API_BUSINESS_PARTNER';

@impl: 'srv/catalog-service.cjs'
@requires: 'authenticated-user'
service CatalogService {

    @restrict: [
    { grant: 'READ', to: 'Viewer' },
    { grant: '*', to: 'Admin' }
    ]
    entity Books as projection on db.Books actions {
        action restock(amount : Integer) returns Books;
    };
    @restrict: [
    { grant: 'READ', to: 'Viewer' },
    { grant: '*', to: 'Admin' }
    ]
    entity Authors as projection on db.Authors;

    @cds.redirection.target
    entity Users as projection on db.Users;

    @cds.redirection.target: false
    entity BudgetUsers as select from db.Users {
        ID,
        name,
        budget
    };

    entity Orders as projection on db.Orders actions {
        action cancelOrder() returns Orders;
    };

    entity PurchaseLogs as projection on db.PurchaseLogs;

    entity Suppliers as projection on external.A_BusinessPartner;
}