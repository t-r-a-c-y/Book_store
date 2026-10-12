sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, formatter, BookDialogHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";
      this._bSortDesc = false;

      this.getView().setModel(new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]), "authors");

      this._loadAuthors();
    },

    _text: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    _loadAuthors: function () {
      var oModel = this.getOwnerComponent().getModel();
      var that = this;
      if (!oModel) {
        return;
      }

      oModel.bindList("/Authors").requestContexts(0, 100).then(function (aContexts) {
        var aAuthors = [{ key: "ALL", text: "All Authors" }];
        aContexts.forEach(function (oContext) {
          var oAuthor = oContext.getObject();
          aAuthors.push({ key: oAuthor.ID, text: oAuthor.name });
        });
        that.getView().getModel("authors").setData(aAuthors);
      });
    },

    onSearch: function (oEvent) {
      this._sSearchQuery = oEvent.getParameter("newValue") || "";
      this._applyFilters();
    },

    onFilterStock: function (oEvent) {
      this._sStockKey = oEvent.getSource().getSelectedKey() || "ALL";
      this._applyFilters();
    },

    onFilterAuthor: function (oEvent) {
      var oItem = oEvent.getSource().getSelectedItem();
      this._sAuthorId = oEvent.getSource().getSelectedKey() || "ALL";
      this._sAuthorName = oItem ? oItem.getText() : "";
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];
      if (this._sSearchQuery) {
        aFilters.push(new Filter("title", FilterOperator.Contains, this._sSearchQuery));
      }
      if (this._sAuthorId !== "ALL" && this._sAuthorName && this._sAuthorName !== "All Authors") {
        aFilters.push(new Filter("author/name", FilterOperator.EQ, this._sAuthorName));
      }
      if (this._sStockKey === "IN_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.GT, 0));
      } else if (this._sStockKey === "OUT_OF_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
      }
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    _clearFilters: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";
      if (this.byId("searchField")) { this.byId("searchField").setValue(""); }
      if (this.byId("stockFilter")) { this.byId("stockFilter").setSelectedKey("ALL"); }
      if (this.byId("authorFilter")) { this.byId("authorFilter").setSelectedKey("ALL"); }
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) { oBinding.filter([]); }
    },

    onSort: function () {
      this._bSortDesc = !this._bSortDesc;
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.sort([new Sorter("title", this._bSortDesc)]);
      }
    },

    onRefresh: function () {
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) { oBinding.refresh(); }
      this._loadAuthors();
    },

    onBookPress: function (oEvent) {
      var sBookId = oEvent.getSource().getBindingContext().getProperty("ID");
      this.getOwnerComponent().getRouter().navTo("bookDetail", { bookId: sBookId });
    },

    onCreateOrder: function () {
      this.getOwnerComponent().getRouter().navTo("createOrder");
    },

    /* ===== dialogs via helper ===== */
    onCreateBook: function () {
      this._oEditContext = null;
      BookDialogHelper.openForm(this, {
        mode: "create",
        dialogTitle: this._text("createBook"),
        confirmText: this._text("create"),
        title: "",
        description: "",
        price: "",
        stock: "",
        author_ID: ""
      });
    },

    onEditBook: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;
      BookDialogHelper.openForm(this, {
        mode: "edit",
        dialogTitle: this._text("editBook"),
        confirmText: this._text("save"),
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      });
    },

    onBookFieldChange: function (oEvent) {
      BookDialogHelper.onFieldChange(this, oEvent);
    },

    onCloseBookForm: function () {
      BookDialogHelper.closeForm(this);
    },

    onSaveBook: function () {
      var that = this;
      BookDialogHelper.saveBook(this, {
        afterChange: function () {
          that._clearFilters();
          that.onRefresh();
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
      var that = this;
      BookDialogHelper.confirmDelete(this, {
        afterDelete: function () {
          that.onRefresh();
        }
      });
    }

  });
});