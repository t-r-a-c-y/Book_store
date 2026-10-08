sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper"
], function (
  Controller,
  Filter,
  FilterOperator,
  Sorter,
  JSONModel,
  MessageBox,
  formatter,
  BookDialogHelper
) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";

      this.getView().setModel(new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]), "authors");

      this._loadAuthors();
    },

    // keep your _loadAuthors, filters, sort, refresh, onBookPress, onCreateOrder...

    onCreateBook: function () {
      this._oEditContext = null;
      BookDialogHelper.openForm(this, {
        mode: "create",
        dialogTitle: this._text("createBook", "Create Book"),
        confirmText: this._text("create", "Create"),
        title: "",
        description: "",
        price: 0,
        stock: 0,
        author_ID: ""
      });
    },

    onEditBook: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;

      BookDialogHelper.openForm(this, {
        mode: "edit",
        dialogTitle: this._text("editBook", "Edit Book"),
        confirmText: this._text("save", "Save"),
        id: oBook.ID,
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      });
    },

    onCloseBookForm: function () {
      BookDialogHelper.closeForm(this);
    },

    onSaveBook: function () {
      var that = this;
      var oTableBinding = this.byId("booksTable").getBinding("items");

      BookDialogHelper.saveBook(this, {
        listBinding: oTableBinding,
        afterChange: function () {
          that._clearFilters();
          if (oTableBinding) {
            oTableBinding.refresh();
          }
        }
      });
    },

    onDeleteBook: function (oEvent) {
      BookDialogHelper.openDelete(this, oEvent.getSource().getBindingContext());
    },

    onCloseDeleteDialog: function () {
      BookDialogHelper.closeDelete(this);
    },

    onConfirmDelete: function () {
      BookDialogHelper.confirmDelete(this);
    },

    _text: function (sKey, sDefault) {
      var oI18n = this.getView().getModel("i18n");
      return oI18n ? oI18n.getResourceBundle().getText(sKey) : sDefault;
    }

  });
});