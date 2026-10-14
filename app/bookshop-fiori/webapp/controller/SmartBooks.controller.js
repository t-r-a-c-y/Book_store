sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.SmartBooks", {

    onInit: function () {
      var oV2Model = this.getOwnerComponent().getModel("v2");
      var oView = this.getView();

      // This view uses V2 only (Smart controls need it)
      oView.setModel(oV2Model);

      // Also set explicitly on the smart controls when they exist
      this.getView().attachEventOnce("afterRendering", function () {
        var oFilter = this.byId("smartFilterBar");
        var oTable = this.byId("smartBooksTable");
        if (oFilter && oV2Model) {
          oFilter.setModel(oV2Model);
        }
        if (oTable && oV2Model) {
          oTable.setModel(oV2Model);
        }
      }.bind(this));
    },

    onNavBack: function () {
      if (History.getInstance().getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    },

    onBeforeRebindTable: function (oEvent) {
      // optional extra filters
    }

  });
});