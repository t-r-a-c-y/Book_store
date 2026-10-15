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

    toBookCreate: function (oController) {
      var oComponent = oController.getOwnerComponent();
      oComponent.setFclLayout("OneColumn");
      oComponent.getRouter().navTo("bookCreate", {}, true);
    },

    toBookDetail: function (oController, sBookId, bEdit) {
      var oComponent = oController.getOwnerComponent();
      oComponent.setFclLayout("TwoColumnsMidExpanded");
      oComponent.getRouter().navTo("bookDetail", {
        bookId: sBookId
      });
      // edit mode is set on Detail when needed
      if (bEdit) {
        oComponent._bOpenBookInEdit = true;
      }
    }
  };
});