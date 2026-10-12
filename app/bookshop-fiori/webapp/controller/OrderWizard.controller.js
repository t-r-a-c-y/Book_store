sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "ns/bookshopfiori/controller/helpers/WizardStepHelper"
], function (Controller, History, JSONModel, MessageToast, MessageBox, WizardStepHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.OrderWizard", {

    onInit: function () {
      this.getView().setModel(new JSONModel(WizardStepHelper.getInitialData()), "wizard");

      this.getOwnerComponent()
        .getRouter()
        .getRoute("createOrder")
        .attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function () {
      this.getView().getModel("wizard").setData(WizardStepHelper.getInitialData());

      var oWizard = this.byId("orderWizard");
      var oFirstStep = this.byId("stepCustomer");
      if (oWizard && oFirstStep) {
        oWizard.discardProgress(oFirstStep);
        oWizard.setCurrentStep(oFirstStep);
      }
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

    onWizardNext: function () {
      var oModel = this.getView().getModel("wizard");
      var iStep = oModel.getProperty("/step");
      var oWizard = this.byId("orderWizard");

      if (!WizardStepHelper.validateStep(oModel, iStep)) {
        return;
      }

      if (iStep === 3) {
        this._finishWizard();
        return;
      }

      oWizard.nextStep();
      WizardStepHelper.updateButtons(oModel, iStep + 1);
    },

    onWizardBack: function () {
      var oModel = this.getView().getModel("wizard");
      var iStep = oModel.getProperty("/step");
      if (iStep <= 1) {
        return;
      }
      this.byId("orderWizard").previousStep();
      WizardStepHelper.updateButtons(oModel, iStep - 1);
    },

    _finishWizard: function () {
      var oData = this.getView().getModel("wizard").getData();
      var that = this;

      var oPayload = {
        user_ID: oData.customerId,
        orderDate: new Date().toISOString().split("T")[0],
        items: [{
          book_ID: oData.bookId,
          quantity: oData.quantity
        }]
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
        })
        .then(function () {
          MessageToast.show("Order created successfully");
          that.getOwnerComponent().getRouter().navTo("books");
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error("Order create failed. Check stock/budget.");
        });
    },

    onWizardComplete: function () {
      this._finishWizard();
    },

    onNavBack: function () {
      if (History.getInstance().getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    }

  });
});