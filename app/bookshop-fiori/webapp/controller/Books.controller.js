sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/odata/v4/ODataModel"
], function (Controller, ODataModel) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {
      
      var oModel = new ODataModel({
        serviceUrl: "/odata/v4/catalog/",
        synchronizationMode: "None",
        operationMode: "Server",
        autoExpandSelect: true
      });

      
      this.getView().setModel(oModel);

      console.log("OData Model connected to CAP service");
    }

  });
});