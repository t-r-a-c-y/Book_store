sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox"
], function (Controller, History, JSONModel, Fragment, MessageBox) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.SmartBooks", {

    onInit: function () {
      var oV2Model = this.getOwnerComponent().getModel("v2");
      var oView = this.getView();

      if (oV2Model) {
        oView.setModel(oV2Model);
      }

      oView.attachEventOnce("afterRendering", function () {
        if (!oV2Model) {
          return;
        }
        var oFilter = this.byId("smartFilterBar");
        var oTable = this.byId("smartBooksTable");
        if (oFilter) {
          oFilter.setModel(oV2Model);
        }
        if (oTable) {
          oTable.setModel(oV2Model);
        }
      }.bind(this));
    },

    onNavBack: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      if (History.getInstance().getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    },

    onBeforeRebindTable: function () {
      // optional filters
    },

    onOpenPdf: function () {
      var oView = this.getView();
      oView.setModel(new JSONModel({
        source: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        title: "Book Catalog Sample"
      }), "pdf");

      if (!this.pPdfDialog) {
        this.pPdfDialog = Fragment.load({
          id: oView.getId(),
          name: "ns.bookshopfiori.view.PdfPreviewDialog",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this.pPdfDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    onPdfError: function () {
      MessageBox.error("Could not load the PDF document.");
    },

    onClosePdf: function () {
      this.byId("pdfDialog").close();
    }

  });
});