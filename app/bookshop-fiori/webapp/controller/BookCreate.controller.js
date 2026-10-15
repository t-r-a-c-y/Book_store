sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "ns/bookshopfiori/controller/helpers/NavHelper",
  "ns/bookshopfiori/controller/helpers/BookFormValidator"
], function (Controller, JSONModel, MessageBox, MessageToast, NavHelper, BookFormValidator) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookCreate", {

    onInit: function () {
      this.getOwnerComponent().getRouter()
        .getRoute("bookCreate")
        .attachPatternMatched(this.onMatched, this);
    },

    fetchText: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    onMatched: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.getView().setModel(new JSONModel({
        title: "",
        description: "",
        price: "",
        stock: "10",
        author_ID: "",
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
      }), "form");
    },

    onFieldChange: function () {
      this.applyValidation(false);
    },

    applyValidation: function (bShowBox) {
      var oForm = this.getView().getModel("form");
      var oResult = BookFormValidator.validate(oForm.getData(), this.fetchText.bind(this));
      Object.keys(oResult.states).forEach(function (sKey) {
        oForm.setProperty("/" + sKey, oResult.states[sKey]);
      });
      if (!oResult.valid && bShowBox) {
        MessageBox.error(this.fetchText("formInvalid"));
      }
      return oResult.valid;
    },

    onSave: function () {
      if (!this.applyValidation(true)) {
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
      oView.setBusyIndicatorDelay(0);
      oView.setBusy(true);

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
          MessageToast.show(that.fetchText("bookCreated"));
          NavHelper.toBooks(that);
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error(that.fetchText("createFailed"));
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