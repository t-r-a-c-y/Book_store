sap.ui.define([
  "sap/m/MessageBox"
], function (MessageBox) {
  "use strict";

  function validateStep(oWizardModel, iStep, oBundle) {
    if (iStep === 1 && !oWizardModel.getProperty("/customerId")) {
      MessageBox.error(oBundle ? oBundle.getText("customerRequired") : "Please select a customer.");
      return false;
    }

    if (iStep === 2) {
      if (!oWizardModel.getProperty("/bookId")) {
        MessageBox.error(oBundle ? oBundle.getText("bookRequired") : "Please select a book.");
        return false;
      }
      var iQty = oWizardModel.getProperty("/quantity");
      if (!iQty || iQty < 1) {
        MessageBox.error(oBundle ? oBundle.getText("quantityInvalid") : "Quantity must be at least 1.");
        return false;
      }
    }

    return true;
  }

  function updateButtons(oWizardModel, iStep) {
    oWizardModel.setProperty("/step", iStep);
    oWizardModel.setProperty("/backEnabled", iStep > 1);

    if (iStep === 3) {
      oWizardModel.setProperty("/nextText", "Finish");
      oWizardModel.setProperty("/nextIcon", "sap-icon://accept");
    } else {
      oWizardModel.setProperty("/nextText", "Next");
      oWizardModel.setProperty("/nextIcon", "sap-icon://navigation-right-arrow");
    }
  }

  function getInitialData() {
    return {
      customerId: "",
      customerName: "",
      bookId: "",
      bookTitle: "",
      quantity: 1,
      step: 1,
      backEnabled: false,
      nextText: "Next",
      nextIcon: "sap-icon://navigation-right-arrow"
    };
  }

  return {
    validateStep: validateStep,
    updateButtons: updateButtons,
    getInitialData: getInitialData
  };
});