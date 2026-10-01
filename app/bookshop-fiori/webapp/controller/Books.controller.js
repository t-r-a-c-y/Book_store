sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "ns/bookshopfiori/model/formatter"
], function (Controller, Fragment, Filter, FilterOperator, Sorter, formatter) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {},

    onRefresh: function () {
      this.getView().getModel().refresh();
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");
      var oBinding = this.byId("booksList").getBinding("items");

      if (sQuery) {
        oBinding.filter([
          new Filter("title", FilterOperator.Contains, sQuery)
        ]);
      } else {
        oBinding.filter([]);
      }
    },

    onSort: function () {
      var oBinding = this.byId("booksList").getBinding("items");
      oBinding.sort([new Sorter("title", false)]);
    },

    onBookPress: function (oEvent) {
      var oBookContext = oEvent.getSource().getBindingContext();
      var oView = this.getView();

      if (!this._pBookDialog) {
        this._pBookDialog = Fragment.load({
          id: oView.getId(),
          name: "ns.bookshopfiori.view.BookDetailsDialog",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pBookDialog.then(function (oDialog) {
        oDialog.bindElement(oBookContext.getPath());
        oDialog.open();
      });
    },

    onCloseDialog: function () {
      this.byId("bookDetailsDialog").close();
    }

  });
});