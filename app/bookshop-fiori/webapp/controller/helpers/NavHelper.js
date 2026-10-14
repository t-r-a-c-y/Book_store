sap.ui.define([], function () {
  "use strict";

  return {
    
    toBooks: function (oController) {
      var oComponent = oController.getOwnerComponent();
      oComponent.setFclLayout("OneColumn");
      oComponent.getRouter().navTo("books", {}, true);
    },

    toSmartBooks: function (oController) {
      var oComponent = oController.getOwnerComponent();
      oComponent.setFclLayout("OneColumn");
      oComponent.getRouter().navTo("smartBooks", {}, true);
    },

   
    toCreateOrder: function (oController) {
      var oComponent = oController.getOwnerComponent();
      oComponent.setFclLayout("OneColumn");
      oComponent.getRouter().navTo("createOrder", {}, true);
    },

    back: function (oController) {
      var oHistory = sap.ui.core.routing.History.getInstance();
      if (oHistory.getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.toBooks(oController);
      }
    }
  };
});