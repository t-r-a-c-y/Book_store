sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "ns/bookshopfiori/model/formatter"
], function (
  Controller,
  Filter,
  FilterOperator,
  Sorter,
  JSONModel,
  Fragment,
  MessageToast,
  MessageBox,
  formatter
) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";

      var oAuthorsModel = new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]);
      this.getView().setModel(oAuthorsModel, "authors");

      this._loadAuthors();
    },

    _loadAuthors: function () {
      var oModel = this.getOwnerComponent().getModel();
      var that = this;

      if (!oModel) {
        return;
      }

      var oListBinding = oModel.bindList("/Authors");
      oListBinding.requestContexts(0, 100).then(function (aContexts) {
        var aAuthors = [{ key: "ALL", text: "All Authors" }];

        aContexts.forEach(function (oContext) {
          var oAuthor = oContext.getObject();
          aAuthors.push({
            key: oAuthor.ID,
            text: oAuthor.name
          });
        });

        that.getView().getModel("authors").setData(aAuthors);
      }).catch(function (oError) {
        console.error("Failed to load authors", oError);
      });
    },

    onRefresh: function () {
      var oBinding = this.byId("booksTable") && this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.refresh();
      } else {
        this.getView().getModel().refresh();
      }
      this._loadAuthors();
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
      var oSelect = oEvent.getSource();
      var oItem = oSelect.getSelectedItem();

      this._sAuthorId = oSelect.getSelectedKey() || "ALL";
      this._sAuthorName = oItem ? oItem.getText() : "";
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];

      if (this._sSearchQuery) {
        aFilters.push(new Filter("title", FilterOperator.Contains, this._sSearchQuery));
      }

      if (this._sAuthorId && this._sAuthorId !== "ALL" && this._sAuthorName && this._sAuthorName !== "All Authors") {
        aFilters.push(new Filter("author/name", FilterOperator.EQ, this._sAuthorName));
      }

      if (this._sStockKey === "IN_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.GT, 0));
      } else if (this._sStockKey === "OUT_OF_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
      }

      var oTable = this.byId("booksTable");
      if (!oTable) {
        return;
      }

      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    _clearFilters: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";

      var oSearch = this.byId("searchField");
      if (oSearch) {
        oSearch.setValue("");
      }

      var oStock = this.byId("stockFilter");
      if (oStock) {
        oStock.setSelectedKey("ALL");
      }

      var oAuthor = this.byId("authorFilter");
      if (oAuthor) {
        oAuthor.setSelectedKey("ALL");
      }

      var oBinding = this.byId("booksTable") && this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter([]);
      }
    },

    onSort: function () {
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.sort([new Sorter("title", false)]);
      }
    },

    onBookPress: function (oEvent) {
      var sBookId = oEvent.getSource().getBindingContext().getProperty("ID");
      this.getOwnerComponent().getRouter().navTo("bookDetail", {
        bookId: sBookId
      });
    },

    onCreateOrder: function () {
      this.getOwnerComponent().getRouter().navTo("createOrder");
    },

    /* =========================
       CREATE / EDIT FORM
    ========================= */
    onCreateBook: function () {
      this._oEditContext = null;
      this._openBookForm({
        mode: "create",
        dialogTitle: "Create Book",
        confirmText: "Create",
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

      this._openBookForm({
        mode: "edit",
        dialogTitle: "Edit Book",
        confirmText: "Save",
        id: oBook.ID,
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      });
    },

    _openBookForm: function (oFormData) {
      var oView = this.getView();
      oView.setModel(new JSONModel(oFormData), "form");

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

      if (!oForm.title || oForm.title.trim() === "") {
        MessageBox.error("Title is required.");
        return;
      }

      var iPrice = parseFloat(oForm.price);
      var iStock = parseInt(oForm.stock, 10);

      if (isNaN(iPrice) || iPrice < 0) {
        MessageBox.error("Please enter a valid price.");
        return;
      }
      if (isNaN(iStock) || iStock < 0) {
        MessageBox.error("Please enter a valid stock.");
        return;
      }

      var oPayload = {
        title: oForm.title,
        description: oForm.description || "",
        price: iPrice,
        stock: iStock
      };

      if (oForm.author_ID) {
        oPayload.author_ID = oForm.author_ID;
      }

      /* ===== CREATE on the TABLE binding ===== */
      /* ===== CREATE ===== */
if (oForm.mode === "create") {
  // Direct CAP create (reliable with OData V4)
  fetch("/odata/v4/catalog/Books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(oPayload)
  })
  .then(function (oResponse) {
    if (!oResponse.ok) {
      return oResponse.text().then(function (sText) {
        throw new Error(sText || ("HTTP " + oResponse.status));
      });
    }
    return oResponse.json();
  })
  .then(function (oCreated) {
    console.log("Created book:", oCreated);
    MessageToast.show("Book created");
    that.byId("bookFormDialog").close();

    // Clear filters so the new book is visible
    that._clearFilters();

    // Refresh table data from server
    var oTableBinding = that.byId("booksTable").getBinding("items");
    if (oTableBinding) {
      oTableBinding.refresh();
    } else {
      oModel.refresh();
    }
  })
  .catch(function (oError) {
    console.error("Create failed:", oError);
    MessageBox.error("Create failed. Check console.");
  });

  return;
}

      /* ===== EDIT ===== */
      if (!this._oEditContext) {
        MessageBox.error("No book context found for edit.");
        return;
      }

      this._oEditContext.setProperty("title", oPayload.title);
      this._oEditContext.setProperty("description", oPayload.description);
      this._oEditContext.setProperty("price", oPayload.price);
      this._oEditContext.setProperty("stock", oPayload.stock);
      if (oPayload.author_ID) {
        this._oEditContext.setProperty("author_ID", oPayload.author_ID);
      }

      oModel.submitBatch("$auto").then(function () {
        MessageToast.show("Book updated");
        that.byId("bookFormDialog").close();
        that.byId("booksTable").getBinding("items").refresh();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error("Update failed. Check console / CAP logs.");
      });
    },

    /* =========================
       DELETE
    ========================= */
    onDeleteBook: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var oBook = oCtx.getObject();
      var oView = this.getView();

      oView.setModel(new JSONModel({
        title: oBook.title,
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
      var oDeleteData = this.getView().getModel("delete").getData();
      var that = this;

      oDeleteData.context.delete("$auto").then(function () {
        MessageToast.show("Book deleted");
        that.byId("confirmDeleteDialog").close();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error("Delete failed");
      });
    },

    onTableSelectionChange: function () {
  var oTable = this.byId("booksTable");
  var aSelected = oTable.getSelectedItems();
  var oBtn = this.byId("btnViewSelected");

  // Enable View only when exactly 1 book is selected
  if (oBtn) {
    oBtn.setEnabled(aSelected.length === 1);
  }
},

onViewSelected: function () {
  var oTable = this.byId("booksTable");
  var aSelected = oTable.getSelectedItems();

  if (aSelected.length !== 1) {
    MessageBox.information("Please select exactly one book to view.");
    return;
  }

  var oContext = aSelected[0].getBindingContext();
  var sBookId = oContext.getProperty("ID");

  this.getOwnerComponent().getRouter().navTo("bookDetail", {
    bookId: sBookId
  });
},

  });
});