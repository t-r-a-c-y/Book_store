sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, History, Fragment, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookDetail", {

    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("bookDetail").attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      var sBookId = oEvent.getParameter("arguments").bookId;

      this.getView().bindElement({
        path: "/Books(" + sBookId + ")",
        parameters: {
          $expand: "author"
        }
      });
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    },

    /* ===== EDIT ===== */
    onEditBook: function () {
      var oView = this.getView();
      var oCtx = oView.getBindingContext();

      if (!oCtx) {
        MessageBox.error("No book loaded.");
        return;
      }

      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;

      oView.setModel(new JSONModel({
        mode: "edit",
        dialogTitle: "Edit Book",
        confirmText: "Save",
        id: oBook.ID,
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      }), "form");

      if (!this._pBookFormDialog) {
        this._pBookFormDialog = Fragment.load({
          id: oView.getId(),
          name: "ns.bookshopfiori.view.BookFormDialog",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pBookFormDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    onCloseBookForm: function () {
      this.byId("bookFormDialog").close();
    },

    onSaveBook: function () {
      var oForm = this.getView().getModel("form").getData();
      var oModel = this.getView().getModel();
      var that = this;

      if (!this._oEditContext) {
        MessageBox.error("No book context.");
        return;
      }

      this._oEditContext.setProperty("title", oForm.title);
      this._oEditContext.setProperty("description", oForm.description || "");
      this._oEditContext.setProperty("price", parseFloat(oForm.price));
      this._oEditContext.setProperty("stock", parseInt(oForm.stock, 10));

      if (oForm.author_ID) {
        this._oEditContext.setProperty("author_ID", oForm.author_ID);
      }

      oModel.submitBatch("$auto").then(function () {
        MessageToast.show("Book updated");
        that.byId("bookFormDialog").close();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error("Update failed");
      });
    },

    /* ===== DELETE ===== */
    onDeleteBook: function () {
      var oView = this.getView();
      var oCtx = oView.getBindingContext();

      if (!oCtx) {
        return;
      }

      oView.setModel(new JSONModel({
        title: oCtx.getProperty("title"),
        context: oCtx
      }), "delete");

      if (!this._pDeleteDialog) {
        this._pDeleteDialog = Fragment.load({
          id: oView.getId(),
          name: "ns.bookshopfiori.view.ConfirmDeleteDialog",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pDeleteDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    onCloseDeleteDialog: function () {
      this.byId("confirmDeleteDialog").close();
    },

    onConfirmDelete: function () {
      var oDelete = this.getView().getModel("delete").getData();
      var that = this;

      oDelete.context.delete("$auto").then(function () {
        MessageToast.show("Book deleted");
        that.byId("confirmDeleteDialog").close();
        that.getOwnerComponent().getRouter().navTo("books");
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error("Delete failed");
      });
    }

  });
});