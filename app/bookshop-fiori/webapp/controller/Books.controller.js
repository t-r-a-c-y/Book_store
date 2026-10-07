sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "ns/bookshopfiori/model/formatter",
  "sap/ui/core/Fragment",
"sap/m/MessageToast",
"sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, formatter, Fragment, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";

      // Local model for author dropdown (includes "All Authors")
      var oAuthorsModel = new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]);
      this.getView().setModel(oAuthorsModel, "authors");

      // Load real authors from CAP
      this._loadAuthors();
    },

    _loadAuthors: function () {
      var oModel = this.getOwnerComponent().getModel();
      var that = this;

      if (!oModel) {
        return;
      }

      // OData V4 way to read a list
      var oListBinding = oModel.bindList("/Authors");
      oListBinding.requestContexts(0, 100).then(function (aContexts) {
        var aAuthors = [
          { key: "ALL", text: "All Authors" }
        ];

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
      this.getView().getModel().refresh();
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

  // Title search
  if (this._sSearchQuery) {
    aFilters.push(new Filter("title", FilterOperator.Contains, this._sSearchQuery));
  }

  // Author filter by name
  if (this._sAuthorId && this._sAuthorId !== "ALL" && this._sAuthorName) {
    aFilters.push(new Filter("author/name", FilterOperator.EQ, this._sAuthorName));
  }

  // Stock filter
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
   CREATE
========================= */
onCreateBook: function () {
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

/* =========================
   EDIT
========================= */
onEditBook: function (oEvent) {
  var oCtx = oEvent.getSource().getBindingContext();
  var oBook = oCtx.getObject();

  // IMPORTANT for OData V4 edit
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

/* =========================
   OPEN FORM FRAGMENT
========================= */
_openBookForm: function (oFormData) {
  var oView = this.getView();

  // local model for the dialog fields
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

/* =========================
   SAVE (Create or Edit)
========================= */
onSaveBook: function () {
  var oView = this.getView();
  var oForm = oView.getModel("form").getData();
  var oModel = oView.getModel();
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

  /* ========== CREATE ========== */
  if (oForm.mode === "create") {
    var oListBinding = oModel.bindList("/Books");
    var oContext = oListBinding.create(oPayload);

    oContext.created().then(function () {
      MessageToast.show("Book created");
      that.byId("bookFormDialog").close();

      // refresh the table binding so the new book appears
      var oTableBinding = that.byId("booksTable").getBinding("items");
      if (oTableBinding) {
        oTableBinding.refresh();
      } else {
        oModel.refresh();
      }
    }).catch(function (oError) {
      console.error(oError);
      MessageBox.error("Create failed. Check console / CAP logs.");
    });

    return;
  }

  /* ========== EDIT ========== */
  // Use the context stored when opening Edit
  var oEditContext = this._oEditContext;
  if (!oEditContext) {
    MessageBox.error("No book context found for edit.");
    return;
  }

  oEditContext.setProperty("title", oPayload.title);
  oEditContext.setProperty("description", oPayload.description);
  oEditContext.setProperty("price", oPayload.price);
  oEditContext.setProperty("stock", oPayload.stock);
  if (oPayload.author_ID) {
    oEditContext.setProperty("author_ID", oPayload.author_ID);
  }

  oModel.submitBatch("$auto").then(function () {
    MessageToast.show("Book updated");
    that.byId("bookFormDialog").close();

    var oTableBinding = that.byId("booksTable").getBinding("items");
    if (oTableBinding) {
      oTableBinding.refresh();
    }
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
    path: oCtx.getPath(),
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
  var oContext = oDeleteData.context;
  var that = this;

  oContext.delete("$auto").then(function () {
    MessageToast.show("Book deleted");
    that.byId("confirmDeleteDialog").close();
  }).catch(function (oError) {
    MessageBox.error("Delete failed");
    console.error(oError);
  });
}

  });
});