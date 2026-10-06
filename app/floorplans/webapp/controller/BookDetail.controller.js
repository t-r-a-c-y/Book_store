sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("floorplans.controller.BookDetail", {

        onInit: function () {

            const router = this.getOwnerComponent().getRouter();

            router
                .getRoute("bookDetail")
                .attachPatternMatched(
                    this._onBookMatched,
                    this
                );
        },

        _onBookMatched: function (oEvent) {

            const bookId = oEvent
                .getParameter("arguments")
                .bookId;

            const model = this.getView().getModel();

            const books = model.getProperty("/books");

            const book = books.find(function (item) {
                return item.id === bookId;
            });

            this.getView().setBindingContext(
                new sap.ui.model.Context(model, "/books/" + books.indexOf(book))
            );
        },

        onBack: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("books");
        }

    });
});