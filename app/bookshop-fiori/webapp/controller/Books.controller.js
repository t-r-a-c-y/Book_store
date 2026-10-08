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

      var oBinding = this.byId("booksTable") && this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    _clearFilters: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";
      this._sAuthorName = "";

      if (this.byId("searchField")) {
        this.byId("searchField").setValue("");
      }
      if (this.byId("stockFilter")) {
        this.byId("stockFilter").setSelectedKey("ALL");
      }
      if (this.byId("authorFilter")) {
        this.byId("authorFilter").setSelectedKey("ALL");
      }

      var oBinding = this.byId("booksTable") && this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter([]);
      }
    },

    onSort: function () {
      var oBinding = this.byId("booksTable") && this.byId("booksTable").getBinding("items");
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
       FORM OPEN / CLOSE
    ========================= */
    _emptyFormStates: function () {
      return {
        titleState: "None",
        titleStateText: "",
        descriptionState: "None",
        descriptionStateText: "",
        priceState: "None",
        priceStateText: "",
        stockState: "None",
        stockStateText: "",
        authorState: "None",
        authorStateText: ""
      };
    },

    onCreateBook: function () {
      this._oEditContext = null;
      this._openBookForm(Object.assign({
        mode: "create",
        dialogTitle: this._text("createBook"),
        confirmText: this._text("create"),
        title: "",
        description: "",
        price: "",
        stock: "",
        author_ID: ""
      }, this._emptyFormStates()));
    },

    onEditBook: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;

      this._openBookForm(Object.assign({
        mode: "edit",
        dialogTitle: this._text("editBook"),
        confirmText: this._text("save"),
        id: oBook.ID,
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      }, this._emptyFormStates()));
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
      var oDialog = this.byId("bookFormDialog");
      if (oDialog) {
        oDialog.close();
      }
      this.getView().setModel(new JSONModel({}), "form");
    },

    /* =========================
       VALIDATION
    ========================= */
    onBookFieldChange: function (oEvent) {
  var oSource = oEvent.getSource();
  var sId = oSource.getId();
  var oFormModel = this.getView().getModel("form");

  // Keep model in sync during typing
  if (sId.endsWith("inTitle")) {
    oFormModel.setProperty("/title", oEvent.getParameter("value"));
  } else if (sId.endsWith("inDescription")) {
    oFormModel.setProperty("/description", oEvent.getParameter("value"));
  } else if (sId.endsWith("inPrice")) {
    oFormModel.setProperty("/price", oEvent.getParameter("value"));
  } else if (sId.endsWith("inStock")) {
    oFormModel.setProperty("/stock", oEvent.getParameter("value"));
  } else if (sId.endsWith("inAuthor")) {
    oFormModel.setProperty("/author_ID", oSource.getSelectedKey());
  }

  this._validateBookForm(false, sId);
},

    _validateBookForm: function (bShowMessage, sSourceId) {
      var oFormModel = this.getView().getModel("form");
      var oData = oFormModel.getData();
      var oBundle = this.getView().getModel("i18n").getResourceBundle();
      var bValid = true;

      var setState = function (sField, sState, sTextKey) {
        oFormModel.setProperty("/" + sField + "State", sState);
        oFormModel.setProperty("/" + sField + "StateText", sTextKey ? oBundle.getText(sTextKey) : "");
      };

      if (!sSourceId) {
        ["title", "description", "price", "stock", "author"].forEach(function (sField) {
          setState(sField, "None", "");
        });
      }

      if (!sSourceId || sSourceId.endsWith("inTitle")) {
  var sTitle = (oData.title || "").trim();

  if (!sTitle) {
    // While typing: clear error. On submit: show required.
    if (bShowMessage || !sSourceId) {
      setState("title", "Error", "titleRequired");
      bValid = false;
    } else {
      setState("title", "None", "");
      bValid = false;
    }
  } else if (sTitle.length < 2) {
    setState("title", "Error", "titleTooShort");
    bValid = false;
  } else {
    setState("title", "None", "");
  }
}

      if (!sSourceId || sSourceId.endsWith("inDescription")) {
        var sDesc = oData.description || "";
        if (sDesc.length > 1000) {
          setState("description", "Error", "descriptionTooLong");
          bValid = false;
        } else {
          setState("description", "None", "");
        }
      }

      if (!sSourceId || sSourceId.endsWith("inPrice")) {
        var fPrice = parseFloat(oData.price);
        if (oData.price === "" || oData.price === null || oData.price === undefined) {
          setState("price", "Error", "priceRequired");
          bValid = false;
        } else if (isNaN(fPrice) || fPrice < 0) {
          setState("price", "Error", "priceInvalid");
          bValid = false;
        } else if (fPrice > 100000) {
          setState("price", "Error", "priceTooHigh");
          bValid = false;
        } else {
          setState("price", "None", "");
        }
      }

      if (!sSourceId || sSourceId.endsWith("inStock")) {
        var iStock = parseInt(oData.stock, 10);
        if (oData.stock === "" || oData.stock === null || oData.stock === undefined) {
          setState("stock", "Error", "stockRequired");
          bValid = false;
        } else if (isNaN(iStock) || iStock < 0 || String(oData.stock).indexOf(".") >= 0) {
          setState("stock", "Error", "stockInvalid");
          bValid = false;
        } else if (iStock > 10000) {
          setState("stock", "Error", "stockTooHigh");
          bValid = false;
        } else {
          setState("stock", "None", "");
        }
      }

      if (!sSourceId || sSourceId.endsWith("inAuthor")) {
        if (!oData.author_ID) {
          setState("author", "Error", "authorRequired");
          bValid = false;
        } else {
          setState("author", "None", "");
        }
      }

      if (!bValid && bShowMessage) {
        MessageBox.error(oBundle.getText("formInvalid"));
      }

      return bValid;
    },

    /* =========================
       SAVE
    ========================= */
    onSaveBook: function () {
      if (!this._validateBookForm(true)) {
        return;
      }

      var oForm = this.getView().getModel("form").getData();
      var oModel = this.getView().getModel();
      var that = this;

      var oPayload = {
        title: String(oForm.title).trim(),
        description: oForm.description || "",
        price: parseFloat(oForm.price),
        stock: parseInt(oForm.stock, 10),
        author_ID: oForm.author_ID
      };

      if (oForm.mode === "create") {
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
          .then(function () {
            MessageToast.show(that._text("bookCreated"));
            that.onCloseBookForm();
            that._clearFilters();
            var oBinding = that.byId("booksTable").getBinding("items");
            if (oBinding) {
              oBinding.refresh();
            } else {
              oModel.refresh();
            }
          })
          .catch(function (oError) {
            console.error(oError);
            MessageBox.error(that._text("createFailed"));
          });
        return;
      }

      if (!this._oEditContext) {
        MessageBox.error(this._text("updateFailed"));
        return;
      }

      this._oEditContext.setProperty("title", oPayload.title);
      this._oEditContext.setProperty("description", oPayload.description);
      this._oEditContext.setProperty("price", oPayload.price);
      this._oEditContext.setProperty("stock", oPayload.stock);
      this._oEditContext.setProperty("author_ID", oPayload.author_ID);

      oModel.submitBatch("$auto").then(function () {
        MessageToast.show(that._text("bookUpdated"));
        that.onCloseBookForm();
        that.byId("booksTable").getBinding("items").refresh();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error(that._text("updateFailed"));
      });
    },

    /* =========================
       DELETE
    ========================= */
    onDeleteBook: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var oView = this.getView();

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
      var oDialog = this.byId("confirmDeleteDialog");
      if (oDialog) {
        oDialog.close();
      }
    },

    onConfirmDelete: function () {
      var oDeleteData = this.getView().getModel("delete").getData();
      var that = this;

      oDeleteData.context.delete("$auto").then(function () {
        MessageToast.show(that._text("bookDeleted"));
        that.onCloseDeleteDialog();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error(that._text("deleteFailed"));
      });
    }

  });
});