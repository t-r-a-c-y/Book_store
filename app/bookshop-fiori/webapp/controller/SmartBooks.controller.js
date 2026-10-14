sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.SmartBooks", {

    onInit: function () {
      var oV2Model = this.getOwnerComponent().getModel("v2");
      this.getView().setModel(oV2Model);
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
    },
    onOpenPdf: function () {
  var oView = this.getView();

  oView.setModel(new sap.ui.model.json.JSONModel({
    // public sample PDF for demo
    source: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    title: "Book Catalog Sample"
  }), "pdf");

  if (!this._pPdfDialog) {
    this._pPdfDialog = sap.ui.core.Fragment.load({
      id: oView.getId(),
      name: "ns.bookshopfiori.view.PdfPreviewDialog",
      controller: this
    }).then(function (oDialog) {
      oView.addDependent(oDialog);
      return oDialog;
    });
  }

  this._pPdfDialog.then(function (oDialog) {
    oDialog.open();
  });
},

onPdfError: function () {
  sap.m.MessageBox.error("Could not load the PDF document.");
},

onClosePdf: function () {
  this.byId("pdfDialog").close();
},

  });
});