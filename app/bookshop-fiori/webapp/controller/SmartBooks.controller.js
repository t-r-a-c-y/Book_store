sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.SmartBooks", {

    onInit: function () {
      // SmartTable uses the default OData model from manifest (mainService)
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      if (oHistory.getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    },

    onSmartFilterSearch: function () {
      // SmartFilterBar triggers table rebind via smartFilterId link
      // Optional extra logic can go here
    },

    /**
     * Called before SmartTable binds to OData.
     * You can add fixed filters (e.g. only in-stock) here.
     */
    onBeforeRebindTable: function (oEvent) {
      var oBindingParams = oEvent.getParameter("bindingParams");

      // Example: always expand author if your service supports it
      // For V4 SmartTable support varies; keep simple first.
      if (!oBindingParams.parameters) {
        oBindingParams.parameters = {};
      }

      // Optional fixed filter example (uncomment if needed):
      // oBindingParams.filters = oBindingParams.filters || [];
      // oBindingParams.filters.push(
      //   new sap.ui.model.Filter("stock", "GT", 0)
      // );
    }

  });
});