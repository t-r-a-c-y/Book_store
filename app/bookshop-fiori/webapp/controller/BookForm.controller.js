sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "ns/bookshopfiori/controller/helpers/NavHelper"
], function (Controller, JSONModel, MessageBox, MessageToast, NavHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookForm", {

    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("bookCreate").attachPatternMatched(this.onCreateMatched, this);
      oRouter.getRoute("bookEdit").attachPatternMatched(this.onEditMatched, this);
    },

    fetchText: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    resetFormModel: function (oData) {
      this.getView().setModel(new JSONModel(oData), "form");
    },

    onCreateMatched: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.sMode = "create";
      this.sBookId = null;

      this.resetFormModel({
        pageTitle: this.fetchText("createBook"),
        saveText: this.fetchText("create"),
        title: "",
        description: "",
        price: "",
        stock: "",
        author_ID: "",
        titleState: "None",
        titleStateText: "",
        descriptionState: "None",
        descriptionStateText: "",
        priceState: "None",
        priceStateText: "",
        stockState: "None",
        stockStateText: ""
      });
    },

    onEditMatched: function (oEvent) {
      var sBookId = oEvent.getParameter("arguments").bookId;
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.sMode = "edit";
      this.sBookId = sBookId;

      this.resetFormModel({
        pageTitle: this.fetchText("editBook"),
        saveText: this.fetchText("save"),
        title: "",
        description: "",
        price: "",
        stock: "",
        author_ID: "",
        titleState: "None",
        titleStateText: "",
        descriptionState: "None",
        descriptionStateText: "",
        priceState: "None",
        priceStateText: "",
        stockState: "None",
        stockStateText: ""
      });

      this.loadBook(sBookId);
    },

    loadBook: function (sBookId) {
      var oModel = this.getOwnerComponent().getModel();
      var that = this;
      var sPath = "/Books(" + sBookId + ")";

      // V4 style read
      oModel.bindContext(sPath + "?$expand=author").requestObject().then(function (oBook) {
        var oForm = that.getView().getModel("form");
        oForm.setProperty("/title", oBook.title || "");
        oForm.setProperty("/description", oBook.description || "");
        oForm.setProperty("/price", oBook.price);
        oForm.setProperty("/stock", oBook.stock);
        oForm.setProperty("/author_ID", oBook.author_ID || (oBook.author && oBook.author.ID) || "");
        oForm.setProperty("/pageTitle", that.fetchText("editBook") + ": " + (oBook.title || ""));
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error("Could not load book");
        NavHelper.toBooks(that);
      });
    },

    onFieldChange: function () {
      this.validateForm(false);
    },

    validateForm: function (bShowMessage) {
      var oForm = this.getView().getModel("form");
      var oData = oForm.getData();
      var bOk = true;

      function setState(sField, bValid, sText) {
        oForm.setProperty("/" + sField + "State", bValid ? "None" : "Error");
        oForm.setProperty("/" + sField + "StateText", bValid ? "" : sText);
        if (!bValid) {
          bOk = false;
        }
      }

      var sTitle = (oData.title || "").trim();
      setState("title", sTitle.length >= 2, this.fetchText("titleRequired"));

      var sDesc = oData.description || "";
      setState("description", sDesc.length <= 1000, this.fetchText("descriptionTooLong"));

      var fPrice = parseFloat(oData.price);
      setState("price", !isNaN(fPrice) && fPrice >= 0 && fPrice <= 100000, this.fetchText("priceInvalid"));

      var iStock = parseInt(oData.stock, 10);
      setState("stock", !isNaN(iStock) && iStock >= 0 && iStock <= 10000, this.fetchText("stockInvalid"));

      if (!oData.author_ID) {
        bOk = false;
        if (bShowMessage) {
          MessageBox.error(this.fetchText("authorRequired"));
        }
      }

      if (!bOk && bShowMessage) {
        MessageBox.error(this.fetchText("formInvalid"));
      }

      return bOk;
    },

    onSave: function () {
      if (!this.validateForm(true)) {
        return;
      }

      var oData = this.getView().getModel("form").getData();
      var oPayload = {
        title: (oData.title || "").trim(),
        description: oData.description || "",
        price: parseFloat(oData.price),
        stock: parseInt(oData.stock, 10),
        author_ID: oData.author_ID
      };

      var that = this;
      var oView = this.getView();
      oView.setBusy(true);

      var oPromise;
      if (this.sMode === "create") {
        oPromise = fetch("/odata/v4/catalog/Books", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(oPayload)
        });
      } else {
        oPromise = fetch("/odata/v4/catalog/Books(" + this.sBookId + ")", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(oPayload)
        });
      }

      oPromise
        .then(function (oResponse) {
          if (!oResponse.ok) {
            return oResponse.text().then(function (sText) {
              throw new Error(sText || ("HTTP " + oResponse.status));
            });
          }
          MessageToast.show(
            that.sMode === "create" ? that.fetchText("bookCreated") : that.fetchText("bookUpdated")
          );
          NavHelper.toBooks(that);
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error(that.sMode === "create" ? that.fetchText("createFailed") : that.fetchText("updateFailed"));
        })
        .finally(function () {
          oView.setBusy(false);
        });
    },

    onCancel: function () {
      NavHelper.toBooks(this);
    },

    onNavBooks: function () {
      NavHelper.toBooks(this);
    }

  });
});