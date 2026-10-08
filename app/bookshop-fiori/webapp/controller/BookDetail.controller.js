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

    _text: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
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

    onEditBook: function () {
      var oView = this.getView();
      var oCtx = oView.getBindingContext();

      if (!oCtx) {
        MessageBox.error("No book loaded.");
        return;
      }

      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;

      oView.setModel(new JSONModel(Object.assign({
        mode: "edit",
        dialogTitle: this._text("editBook"),
        confirmText: this._text("save"),
        id: oBook.ID,
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      }, this._emptyFormStates())), "form");

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
    },

    onBookFieldChange: function (oEvent) {
      var oSource = oEvent.getSource();
      var sId = oSource.getId();
      var oFormModel = this.getView().getModel("form");

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

      // Title
      if (!sSourceId || sSourceId.endsWith("inTitle")) {
        var sTitle = (oData.title || "").trim();
        if (!sTitle) {
          if (bShowMessage) {
            setState("title", "Error", "titleRequired");
          } else {
            setState("title", "None", "");
          }
          bValid = false;
        } else if (sTitle.length < 2) {
          setState("title", "Error", "titleTooShort");
          bValid = false;
        } else {
          setState("title", "None", "");
        }
      }

      // Description
      if (!sSourceId || sSourceId.endsWith("inDescription")) {
        if ((oData.description || "").length > 1000) {
          setState("description", "Error", "descriptionTooLong");
          bValid = false;
        } else {
          setState("description", "None", "");
        }
      }

      // Price
      if (!sSourceId || sSourceId.endsWith("inPrice")) {
        var fPrice = parseFloat(oData.price);
        if (oData.price === "" || oData.price === null || oData.price === undefined) {
          if (bShowMessage) {
            setState("price", "Error", "priceRequired");
          } else {
            setState("price", "None", "");
          }
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

      // Stock
      if (!sSourceId || sSourceId.endsWith("inStock")) {
        var iStock = parseInt(oData.stock, 10);
        if (oData.stock === "" || oData.stock === null || oData.stock === undefined) {
          if (bShowMessage) {
            setState("stock", "Error", "stockRequired");
          } else {
            setState("stock", "None", "");
          }
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

      // Author
      if (!sSourceId || sSourceId.endsWith("inAuthor")) {
        if (!oData.author_ID) {
          if (bShowMessage) {
            setState("author", "Error", "authorRequired");
          } else {
            setState("author", "None", "");
          }
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

    onSaveBook: function () {
      if (!this._validateBookForm(true)) {
        return;
      }

      var oForm = this.getView().getModel("form").getData();
      var oModel = this.getView().getModel();
      var that = this;

      if (!this._oEditContext) {
        MessageBox.error(this._text("updateFailed"));
        return;
      }

      this._oEditContext.setProperty("title", String(oForm.title).trim());
      this._oEditContext.setProperty("description", oForm.description || "");
      this._oEditContext.setProperty("price", parseFloat(oForm.price));
      this._oEditContext.setProperty("stock", parseInt(oForm.stock, 10));
      this._oEditContext.setProperty("author_ID", oForm.author_ID);

      oModel.submitBatch("$auto").then(function () {
        MessageToast.show(that._text("bookUpdated"));
        that.onCloseBookForm();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error(that._text("updateFailed"));
      });
    },

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
      var oDialog = this.byId("confirmDeleteDialog");
      if (oDialog) {
        oDialog.close();
      }
    },

    onConfirmDelete: function () {
  var oView = this.getView();
  var oCtx = oView.getBindingContext();
  var that = this;

  if (!oCtx) {
    MessageBox.error(this._text("deleteFailed"));
    return;
  }

  var sBookId = oCtx.getProperty("ID");
  if (!sBookId) {
    MessageBox.error(this._text("deleteFailed"));
    return;
  }

  // Direct CAP delete (reliable)
  fetch("/odata/v4/catalog/Books(" + sBookId + ")", {
    method: "DELETE",
    headers: {
      "Accept": "application/json"
    }
  })
    .then(function (oResponse) {
      // 204 No Content is normal for DELETE
      if (!oResponse.ok && oResponse.status !== 204) {
        return oResponse.text().then(function (sText) {
          throw new Error(sText || ("HTTP " + oResponse.status));
        });
      }
    })
    .then(function () {
      MessageToast.show(that._text("bookDeleted"));
      that.onCloseDeleteDialog();

      // Go back to list after delete
      that.getOwnerComponent().getRouter().navTo("books");
    })
    .catch(function (oError) {
      console.error("Delete failed:", oError);
      MessageBox.error(that._text("deleteFailed"));
    });
},

  });
});