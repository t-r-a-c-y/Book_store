sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend("floorplans.controller.Books", {

        onSearch: function (oEvent) {

            const value = oEvent.getParameter("newValue");

            const table = this.byId("booksTable");
            const binding = table.getBinding("items");

            if (!value) {
                binding.filter([]);
                return;
            }

            const filter = new Filter(
                "title",
                FilterOperator.Contains,
                value
            );

            binding.filter([filter]);
        },

        onBookPress: function (oEvent) {

            const item = oEvent.getSource();

            const context = item.getBindingContext();

            const bookId = context.getProperty("id");

            this.getOwnerComponent()
                .getRouter()
                .navTo("bookDetail", {
                    bookId: bookId
                });
        },

        onHome: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("home");
        },

        onOverview: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("overview");
        }

    });
});