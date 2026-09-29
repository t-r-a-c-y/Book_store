sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {
      console.log("Books controller has been created");
    },

    onAfterRendering: function () {
      console.log("Books view has been rendered");
    }

  });
});