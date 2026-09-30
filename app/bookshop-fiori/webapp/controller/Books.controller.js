sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {
      var oData = {
        Books: [
          {
            title: "Clean Code",
            price: 35.00,
            author: { name: "Robert C. Martin" }
          },
          {
            title: "Domain-Driven Design",
            price: 49.99,
            author: { name: "Eric Evans" }
          },
          {
            title: "The Pragmatic Programmer",
            price: 42.50,
            author: { name: "Andrew Hunt" }
          }
        ]
      };

      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "books");

      console.log("JSON Model with books has been set");
    }

  });
});