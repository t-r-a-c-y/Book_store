sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookDetail", {

    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();

      
      oRouter.getRoute("bookDetail").attachPatternMatched(this._onObjectMatched, this);
    },

    
    _onObjectMatched: function (oEvent) {
      var sBookId = oEvent.getParameter("arguments").bookId;

      
      this.getView().bindElement({
        path: "/Books(" + sBookId + ")",
        parameters: {
          $expand: "author"
        }
      });
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