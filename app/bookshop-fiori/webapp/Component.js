sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/f/library"
], function (UIComponent, JSONModel, fLibrary) {
  "use strict";

  var LayoutType = fLibrary.LayoutType;

  return UIComponent.extend("ns.bookshopfiori.Component", {

    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(new JSONModel({
        layout: LayoutType.OneColumn
      }), "fcl");

      this.getRouter().initialize();
    },

    /**
     * Helper used by controllers to change FCL layout
     */
    setFclLayout: function (sLayout) {
      this.getModel("fcl").setProperty("/layout", sLayout);
    }

  });
});