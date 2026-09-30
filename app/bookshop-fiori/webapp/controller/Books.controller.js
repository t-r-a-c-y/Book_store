sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/odata/v4/ODataModel"
], function (Controller, ODataModel) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {
      
    },

    onRefresh: function () {
      this.getView().getModel().refresh();
    },

    onBookPress: function (oEvent) {
      var oBook = oEvent.getSource().getBindingContext().getObject();
      console.log("Book clicked:", oBook.title);
    }

  });
});