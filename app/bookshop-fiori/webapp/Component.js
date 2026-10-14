sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("ns.bookshopfiori.Component", {

    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(new JSONModel({
        layout: "OneColumn"
      }), "fcl");

      this.getRouter().initialize();
    },

    setFclLayout: function (sLayout) {
  var oModel = this.getModel("fcl");
  if (oModel) {
    oModel.setProperty("/layout", sLayout);
  }
},

  });
});