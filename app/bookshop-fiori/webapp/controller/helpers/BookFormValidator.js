sap.ui.define([], function () {
  "use strict";

  function _setState(oFormModel, oBundle, sField, sState, sTextKey) {
    oFormModel.setProperty("/" + sField + "State", sState);
    oFormModel.setProperty(
      "/" + sField + "StateText",
      sTextKey ? oBundle.getText(sTextKey) : ""
    );
  }

  /**
   * Validates the book form model.
   * @param {sap.ui.core.mvc.Controller} oController
   * @param {boolean} bShowMessage - true on Save
   * @param {string} [sSourceId] - control id for single-field validation
   * @returns {boolean}
   */
  function validate(oController, bShowMessage, sSourceId) {
    var oView = oController.getView();
    var oFormModel = oView.getModel("form");
    var oData = oFormModel.getData();
    var oBundle = oView.getModel("i18n").getResourceBundle();
    var bValid = true;


    if (!sSourceId || sSourceId.endsWith("inTitle")) {
      var sTitle = (oData.title || "").trim();
      if (!sTitle) {
        if (bShowMessage) {
          _setState(oFormModel, oBundle, "title", "Error", "titleRequired");
        } else {
          _setState(oFormModel, oBundle, "title", "None", "");
        }
        bValid = false;
      } else if (sTitle.length < 2) {
        _setState(oFormModel, oBundle, "title", "Error", "titleTooShort");
        bValid = false;
      } else {
        _setState(oFormModel, oBundle, "title", "None", "");
      }
    }

    
    if (!sSourceId || sSourceId.endsWith("inDescription")) {
      if ((oData.description || "").length > 1000) {
        _setState(oFormModel, oBundle, "description", "Error", "descriptionTooLong");
        bValid = false;
      } else {
        _setState(oFormModel, oBundle, "description", "None", "");
      }
    }

   
    if (!sSourceId || sSourceId.endsWith("inPrice")) {
      var fPrice = parseFloat(oData.price);
      if (oData.price === "" || oData.price === null || oData.price === undefined) {
        if (bShowMessage) {
          _setState(oFormModel, oBundle, "price", "Error", "priceRequired");
        } else {
          _setState(oFormModel, oBundle, "price", "None", "");
        }
        bValid = false;
      } else if (isNaN(fPrice) || fPrice < 0) {
        _setState(oFormModel, oBundle, "price", "Error", "priceInvalid");
        bValid = false;
      } else if (fPrice > 100000) {
        _setState(oFormModel, oBundle, "price", "Error", "priceTooHigh");
        bValid = false;
      } else {
        _setState(oFormModel, oBundle, "price", "None", "");
      }
    }

    
    if (!sSourceId || sSourceId.endsWith("inStock")) {
      var iStock = parseInt(oData.stock, 10);
      if (oData.stock === "" || oData.stock === null || oData.stock === undefined) {
        if (bShowMessage) {
          _setState(oFormModel, oBundle, "stock", "Error", "stockRequired");
        } else {
          _setState(oFormModel, oBundle, "stock", "None", "");
        }
        bValid = false;
      } else if (isNaN(iStock) || iStock < 0 || String(oData.stock).indexOf(".") >= 0) {
        _setState(oFormModel, oBundle, "stock", "Error", "stockInvalid");
        bValid = false;
      } else if (iStock > 10000) {
        _setState(oFormModel, oBundle, "stock", "Error", "stockTooHigh");
        bValid = false;
      } else {
        _setState(oFormModel, oBundle, "stock", "None", "");
      }
    }

    
    if (!sSourceId || sSourceId.endsWith("inAuthor")) {
      if (!oData.author_ID) {
        if (bShowMessage) {
          _setState(oFormModel, oBundle, "author", "Error", "authorRequired");
        } else {
          _setState(oFormModel, oBundle, "author", "None", "");
        }
        bValid = false;
      } else {
        _setState(oFormModel, oBundle, "author", "None", "");
      }
    }

    return bValid;
  }

  function emptyStates() {
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
  }

  return {
    validate: validate,
    emptyStates: emptyStates
  };
});