sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * @param {object} oData - { title, description, price, stock, author_ID }
     * @param {function} fnText - (sKey) => string from i18n
     * @returns {{ valid: boolean, states: object }}
     */
    validate: function (oData, fnText) {
      var oStates = {
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
      var bValid = true;

      var sTitle = (oData.title || "").trim();
      if (sTitle.length < 2) {
        oStates.titleState = "Error";
        oStates.titleStateText = fnText("titleRequired");
        bValid = false;
      }

      var sDesc = oData.description || "";
      if (sDesc.length > 1000) {
        oStates.descriptionState = "Error";
        oStates.descriptionStateText = fnText("descriptionTooLong");
        bValid = false;
      }

      var fPrice = parseFloat(oData.price);
      if (isNaN(fPrice) || fPrice < 0 || fPrice > 100000) {
        oStates.priceState = "Error";
        oStates.priceStateText = fnText("priceInvalid");
        bValid = false;
      }

      var iStock = parseInt(oData.stock, 10);
      if (isNaN(iStock) || iStock < 0 || iStock > 10000) {
        oStates.stockState = "Error";
        oStates.stockStateText = fnText("stockInvalid");
        bValid = false;
      }

      if (!oData.author_ID) {
        oStates.authorState = "Error";
        oStates.authorStateText = fnText("authorRequired");
        bValid = false;
      }

      return { valid: bValid, states: oStates };
    }
  };
});