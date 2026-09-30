sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"          // ← we need this
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {

      // 1. Create some dummy data
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

      // 2. Create a JSONModel with that data
      var oModel = new JSONModel(oData);

      // 3. Set the model on the view
      this.getView().setModel(oModel);

      console.log("JSON Model has been set");
    }

  });
});