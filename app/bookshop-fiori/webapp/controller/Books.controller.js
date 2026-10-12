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
    },
    onTableSelectionChange: function () {
  var aSelected = this.byId("booksTable").getSelectedItems();
  var iCount = aSelected.length;

  var oEditBtn = this.byId("btnEditSelected");
  var oDeleteBtn = this.byId("btnDeleteSelected");

  // 0 selected → both disabled
  // 1 selected → both enabled
  // 2+ selected → only delete enabled
  if (oEditBtn) {
    oEditBtn.setEnabled(iCount === 1);
  }
  if (oDeleteBtn) {
    oDeleteBtn.setEnabled(iCount >= 1);
  }
},

onEditSelected: function () {
  var aSelected = this.byId("booksTable").getSelectedItems();
  if (aSelected.length !== 1) {
    return;
  }

  // reuse same edit flow as before
  var oCtx = aSelected[0].getBindingContext();
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

onDeleteSelected: function () {
  var aSelected = this.byId("booksTable").getSelectedItems();
  if (!aSelected.length) {
    return;
  }

  // one selected → existing single delete dialog
  if (aSelected.length === 1) {
    BookDialogHelper.openDelete(this, aSelected[0].getBindingContext());
    return;
  }

  // many selected → confirm then delete all
  var that = this;
  sap.m.MessageBox.confirm(
    "Delete " + aSelected.length + " selected books?",
    {
      title: this._text("deleteBook"),
      actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
      emphasizedAction: sap.m.MessageBox.Action.DELETE,
      onClose: function (sAction) {
        if (sAction !== sap.m.MessageBox.Action.DELETE) {
          return;
        }
        that._deleteSelectedBooks(aSelected);
      }
    }
  );
},

_deleteSelectedBooks: function (aSelected) {
  var that = this;
  var aPromises = aSelected.map(function (oItem) {
    var sId = oItem.getBindingContext().getProperty("ID");
    return fetch("/odata/v4/catalog/Books(" + sId + ")", {
      method: "DELETE",
      headers: { "Accept": "application/json" }
    }).then(function (oResponse) {
      if (oResponse.status === 404) {
        return;
      }
      if (!oResponse.ok && oResponse.status !== 204) {
        return oResponse.text().then(function (sText) {
          throw new Error(sText || ("HTTP " + oResponse.status));
        });
      }
    });
  });

  Promise.all(aPromises)
    .then(function () {
      sap.m.MessageToast.show(that._text("bookDeleted"));
      that.byId("booksTable").removeSelections(true);
      that.onTableSelectionChange();
      that.onRefresh();
    })
    .catch(function (oError) {
      console.error(oError);
      sap.m.MessageBox.error(that._text("deleteFailed"));
    });
},

  });
});