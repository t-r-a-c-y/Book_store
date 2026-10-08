sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, History, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.OrderWizard", {

    onInit: function () {
  var oWizardModel = new JSONModel({
    customerId: "",
    customerName: "",
    bookId: "",
    bookTitle: "",
    quantity: 1,
    step: 1,
    backEnabled: false,
    nextText: "Next",
    nextIcon: "sap-icon://navigation-right-arrow"
  });
  this.getView().setModel(oWizardModel, "wizard");

  var oRouter = this.getOwnerComponent().getRouter();
  oRouter.getRoute("createOrder").attachPatternMatched(this._onRouteMatched, this);

  // After the view is rendered, disable progress-bar clicks
  this.getView().addEventDelegate({
    onAfterRendering: function () {
      this._disableWizardProgressClick();
    }.bind(this)
  });
},

_disableWizardProgressClick: function () {
  var oWizard = this.byId("orderWizard");
  if (!oWizard) {
    return;
  }

  // Private API, but commonly used to block step-bar navigation
  try {
    var oNav = oWizard._getProgressNavigator && oWizard._getProgressNavigator();
    if (oNav) {
      oNav.ontap = function () {};
      oNav.onclick = function () {};
    }
  } catch (e) {
    // ignore if API not available
  }
},

    _onRouteMatched: function () {
  this.getView().getModel("wizard").setData({
    customerId: "",
    customerName: "",
    bookId: "",
    bookTitle: "",
    quantity: 1,
    step: 1,
    backEnabled: false,
    nextText: "Next",
    nextIcon: "sap-icon://navigation-right-arrow"
  });

  var oWizard = this.byId("orderWizard");
  if (oWizard) {
    var oFirstStep = this.byId("stepCustomer");
    oWizard.discardProgress(oFirstStep);
    oWizard.setCurrentStep(oFirstStep);
  }

  // Re-apply disable after reset
  setTimeout(function () {
    this._disableWizardProgressClick();
  }.bind(this), 0);
},

    onCustomerChange: function (oEvent) {
      var oItem = oEvent.getSource().getSelectedItem();
      var oModel = this.getView().getModel("wizard");
      if (oItem) {
        oModel.setProperty("/customerId", oItem.getKey());
        oModel.setProperty("/customerName", oItem.getText());
      }
    },

    onBookChange: function (oEvent) {
      var oItem = oEvent.getSource().getSelectedItem();
      var oModel = this.getView().getModel("wizard");
      if (oItem) {
        oModel.setProperty("/bookId", oItem.getKey());
        oModel.setProperty("/bookTitle", oItem.getText());
      }
    },

    onQuantityChange: function (oEvent) {
      var iQty = parseInt(oEvent.getParameter("value"), 10);
      if (isNaN(iQty) || iQty < 1) {
        iQty = 1;
      }
      this.getView().getModel("wizard").setProperty("/quantity", iQty);
    },

    /* ========== NEXT ========== */
    onWizardNext: function () {
      var oModel = this.getView().getModel("wizard");
      var iStep = oModel.getProperty("/step");
      var oWizard = this.byId("orderWizard");

      // Validate current step
      if (iStep === 1 && !oModel.getProperty("/customerId")) {
        MessageBox.error("Please select a customer before continuing.");
        return;
      }
      if (iStep === 2) {
        if (!oModel.getProperty("/bookId")) {
          MessageBox.error("Please select a book before continuing.");
          return;
        }
        if (!oModel.getProperty("/quantity") || oModel.getProperty("/quantity") < 1) {
          MessageBox.error("Quantity must be at least 1.");
          return;
        }
      }

      // Last step → Finish
      if (iStep === 3) {
        this._finishWizard();
        return;
      }

      // Go to next step
      oWizard.nextStep();
      iStep = iStep + 1;
      oModel.setProperty("/step", iStep);
      this._updateButtons(iStep);
    },

    /* ========== BACK ========== */
    onWizardBack: function () {
      var oModel = this.getView().getModel("wizard");
      var iStep = oModel.getProperty("/step");
      var oWizard = this.byId("orderWizard");

      if (iStep <= 1) {
        return;
      }

      oWizard.previousStep();
      iStep = iStep - 1;
      oModel.setProperty("/step", iStep);
      this._updateButtons(iStep);
    },

    _updateButtons: function (iStep) {
      var oModel = this.getView().getModel("wizard");

      oModel.setProperty("/backEnabled", iStep > 1);

      if (iStep === 3) {
        oModel.setProperty("/nextText", "Finish");
        oModel.setProperty("/nextIcon", "sap-icon://accept");
      } else {
        oModel.setProperty("/nextText", "Next");
        oModel.setProperty("/nextIcon", "sap-icon://navigation-right-arrow");
      }
    },

    _finishWizard: function () {
  var oData = this.getView().getModel("wizard").getData();
  var that = this;

  var oPayload = {
    user_ID: oData.customerId,
    orderDate: new Date().toISOString().split("T")[0],
    items: [
      {
        book_ID: oData.bookId,
        quantity: oData.quantity
      }
    ]
  };

  fetch("/odata/v4/catalog/Orders", {
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
    return oResponse.text();
  })
  .then(function () {
    MessageToast.show("Order created successfully");
    that.getOwnerComponent().getRouter().navTo("books");
  })
  .catch(function (oError) {
    console.error(oError);
    MessageBox.error("Order create failed. Check stock/budget and CAP logs.");
  });
},

    onWizardComplete: function () {
      // Called if Wizard internal complete is triggered
      this._finishWizard();
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    }

  });
});