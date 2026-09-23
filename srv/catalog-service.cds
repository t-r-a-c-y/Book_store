using my.bookshop as db from '../db/schema';

using { API_BUSINESS_PARTNER as external }
    from './external/API_BUSINESS_PARTNER';

using {
    UI,
    Common
} from '@sap/cds/common';

@impl: 'srv/catalog-service.cjs'
service CatalogService {

    // Keep the header info and field groups here for now if you like, 
    // but the duplicate LineItem and SelectionFields blocks must be removed.
    annotate CatalogService.Books with @(
        UI.HeaderInfo: {
            TypeName: '{i18n>Book}',
            TypeNamePlural: '{i18n>Books}',
            Title: {
                Value: title
            },
            Description: {
                Value: author.name
            }
        }
    );

    annotate CatalogService.Books with @(
        UI.FieldGroup #BookInformation: {
            Label: '{i18n>BookInformation}',
            Data: [
                { Value: title },
                { Value: description },
                { Value: author.name }
            ]
        },

        UI.FieldGroup #Inventory: {
            Label: '{i18n>Inventory}',
            Data: [
                { Value: price },
                { Value: stock }
            ]
        }
    );

    entity Books as projection on db.Books actions {
        action restock(amount : Integer) returns Books;
    };

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
