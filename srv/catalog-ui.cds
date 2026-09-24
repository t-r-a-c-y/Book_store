using CatalogService as service from './catalog-service';

annotate service.Authors with @cds.odata.valuelist;

annotate service.Books with @(

    UI.HeaderInfo: {
        TypeName: '{i18n>Book}',
        TypeNamePlural: '{i18n>Books}',
        Title: {
            Value: title
        },
        Description: {
            Value: author.name
        }
    },

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Title}',
            Value: title
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Description}',
            Value: description
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Price}',
            Value: price
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>Stock}',
            Value: stock
        }
    ],

    UI.SelectionFields: [
        title,
        description,
        price,
        stock,
        author_ID
    ],

    UI.FieldGroup #BookInformation: {
        Label: '{i18n>BookInformation}',
        Data: [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Title}',
                Value: title
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Description}',
                Value: description
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Author}',
                Value: author_ID
            }
        ]
    },

    UI.FieldGroup #Inventory: {
        Label: '{i18n>Inventory}',
        Data: [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Price}',
                Value: price
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>Stock}',
                Value: stock
            }
        ]
    },

    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BookInformation',
            Label: '{i18n>BookInformation}',
            Target: '@UI.FieldGroup#BookInformation'
        },
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'Inventory',
            Label: '{i18n>Inventory}',
            Target: '@UI.FieldGroup#Inventory'
        }
    ]
);

annotate service.Books with {
    author @Common.ValueList: {
        $Type: 'Common.ValueListType',
        CollectionPath: 'Authors',
        Parameters: [
            {
                $Type: 'Common.ValueListParameterInOut',
                LocalDataProperty: author_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type: 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            },
            {
                $Type: 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'country'
            }
        ]
    };

    author_ID @Common.Text: author.name;
};