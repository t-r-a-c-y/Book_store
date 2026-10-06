sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (
    UIComponent,
    JSONModel
) {
    "use strict";

    return UIComponent.extend("floorplans.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {

            UIComponent.prototype.init.apply(this, arguments);

            const data = {

                books: [
                    {
                        id: "1",
                        title: "Clean Code",
                        price: 35.50,
                        stock: 10,
                        description: "A practical guide to writing clean and maintainable code."
                    },
                    {
                        id: "2",
                        title: "Design Patterns",
                        price: 45.00,
                        stock: 5,
                        description: "Reusable solutions to common software design problems."
                    },
                    {
                        id: "3",
                        title: "The Pragmatic Programmer",
                        price: 40.00,
                        stock: 15,
                        description: "Practical techniques for becoming a better software developer."
                    },
                    {
                        id: "4",
                        title: "JavaScript: The Good Parts",
                        price: 30.00,
                        stock: 3,
                        description: "An introduction to important JavaScript concepts."
                    }
                ],

                lowStockBooks: [
                    {
                        id: "2",
                        title: "Design Patterns",
                        stock: 5
                    },
                    {
                        id: "4",
                        title: "JavaScript: The Good Parts",
                        stock: 3
                    }
                ]

            };

            const model = new JSONModel(data);

            this.setModel(model);
        }
    });
});