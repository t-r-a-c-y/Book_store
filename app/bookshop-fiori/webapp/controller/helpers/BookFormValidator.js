sap.ui.define([], function () {
  "use strict";

  /**
   * Internal utility to update the validation state properties on the form data model.
   */
  function setFieldState(oFormModel, oBundle, sField, sState, sTextKey) { // Renamed from _setState
    oFormModel.setProperty("/" + sField + "State", sState);
    oFormModel.setProperty(
      "/" + sField + "StateText",
      sTextKey ? oBundle.getText(sTextKey) : ""
    );
  }

  /**
   * Validates the book form model data entries.
   * @param {sap.ui.core.mvc.Controller} oController
   * @param {boolean} bShowMessage - true on Save, false on live field modifications
   * @param {string} [sSourceId] - control element id used for single-field validation scoping
   * @returns {boolean} True if all checked items are clean and valid
   */
  function validate(oController, bShowMessage, sSourceId) {
    var oView = oController.getView();
    var oFormModel = oView.getModel("form");
    var oData = oFormModel.getData();
    var oBundle = oView.getModel("i18n").getResourceBundle();
    var bValid = true;

    // Title validation verification
    if (!sSourceId || sSourceId.endsWith("inTitle")) {
      var sTitle = (oData.title || "").trim();
      if (!sTitle) {
        if (bShowMessage) {
          setFieldState(oFormModel, oBundle, "title", "Error", "titleRequired");
        } else {
          setFieldState(oFormModel, oBundle, "title", "None", "");
        }
        bValid = false;
      } else if (sTitle.length < 2) {
        setFieldState(oFormModel, oBundle, "title", "Error", "titleTooShort");
        bValid = false;
      } else {
        setFieldState(oFormModel, oBundle, "title", "None", "");
      }
    }

    // Description validation checks
    if (!sSourceId || sSourceId.endsWith("inDescription")) {
      if ((oData.description || "").length > 1000) {
        setFieldState(oFormModel, oBundle, "description", "Error", "descriptionTooLong");
        bValid = false;
      } else {
        setFieldState(oFormModel, oBundle, "description", "None", "");
      }
    }

    // Price entry numerical checks
    if (!sSourceId || sSourceId.endsWith("inPrice")) {
      var fPrice = parseFloat(oData.price);
      if (oData.price === "" || oData.price === null || oData.price === undefined) {
        if (bShowMessage) {
          setFieldState(oFormModel, oBundle, "price", "Error", "priceRequired");
        } else {
          setFieldState(oFormModel, oBundle, "price", "None", "");
        }
        bValid = false;
      } else if (isNaN(fPrice) || fPrice < 0) {
        setFieldState(oFormModel, oBundle, "price", "Error", "priceInvalid");
        bValid = false;
      } else if (fPrice > 100000) {
        setFieldState(oFormModel, oBundle, "price", "Error", "priceTooHigh");
        bValid = false;
      } else {
        setFieldState(oFormModel, oBundle, "price", "None", "");
      }
    }

    // Stock allocation integer structural checks
    if (!sSourceId || sSourceId.endsWith("inStock")) {
      var iStock = parseInt(oData.stock, 10);
      if (oData.stock === "" || oData.stock === null || oData.stock === undefined) {
        if (bShowMessage) {
          setFieldState(oFormModel, oBundle, "stock", "Error", "stockRequired");
        } else {
          setFieldState(oFormModel, oBundle, "stock", "None", "");
        }
        bValid = false;
      } else if (isNaN(iStock) || iStock < 0 || String(oData.stock).indexOf(".") >= 0) {
        setFieldState(oFormModel, oBundle, "stock", "Error", "stockInvalid");
        bValid = false;
      } else if (iStock > 10000) {
        setFieldState(oFormModel, oBundle, "stock", "Error", "stockTooHigh");
        bValid = false;
      } else {
        setFieldState(oFormModel, oBundle, "stock", "None", "");
      }
    }

    // Relational Author choice check
    if (!sSourceId || sSourceId.endsWith("inAuthor")) {
      if (!oData.author_ID) {
        if (bShowMessage) {
          setFieldState(oFormModel, oBundle, "author", "Error", "authorRequired");
        } else {
          setFieldState(oFormModel, oBundle, "author", "None", "");
        }
        bValid = false;
      } else {
        setFieldState(oFormModel, oBundle, "author", "None", "");
      }
    }

    return bValid;
  }

  /**
   * Returns a baseline safe state object tracking empty configurations.
   */
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
