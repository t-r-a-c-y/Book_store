sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment"
], function (Controller, Fragment) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    onInit: function () {
      // OData model is already created by the manifest
    },

    onRefresh: function () {
      this.getView().getModel().refresh();
    },

    /* =========================================================== */
    /*  Open the Book Details Dialog                               */
    /* =========================================================== */
    onBookPress: function (oEvent) {
      var oBookContext = oEvent.getSource().getBindingContext();
      var oView = this.getView();

      // Load the fragment only once
      if (!this._pBookDialog) {
        this._pBookDialog = Fragment.load({
          id: oView.getId(),
          name: "ns.bookshopfiori.view.BookDetailsDialog",
          controller: this          // important: the controller of the fragment
        }).then(function (oDialog) {
          oView.addDependent(oDialog);   // important for model propagation
          return oDialog;
        });
      }

      this._pBookDialog.then(function (oDialog) {
        // Bind the dialog to the clicked book
        oDialog.bindElement(oBookContext.getPath());
        oDialog.open();
      });
    },

    /* =========================================================== */
    /*  Close the Dialog                                           */
    /* =========================================================== */
    onCloseDialog: function () {
      this.byId("bookDetailsDialog").close();
    }

  });
});