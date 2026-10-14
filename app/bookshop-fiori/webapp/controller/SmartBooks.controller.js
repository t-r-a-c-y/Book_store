sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "ns/bookshopfiori/Controller/helpers/NavHelper"
], function (Controller,
	History,
	Component, NavHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.SmartBooks", {

    onInit: function () {
  var oComponent = this.getOwnerComponent();
  oComponent.setFclLayout("OneColumn");

  var oV2Model = oComponent.getModel("v2");
  var oView = this.getView();

  if (oV2Model) {
    oView.setModel(oV2Model);
  }

  oView.attachEventOnce("afterRendering", function () {
    if (!oV2Model) {
      return;
    }
    var oFilter = this.byId("smartFilterBar");
    var oTable = this.byId("smartBooksTable");
    if (oFilter) {
      oFilter.setModel(oV2Model);
    }
    if (oTable) {
      oTable.setModel(oV2Model);
    }
  }.bind(this));
},

    onNavHome: function () {
  NavHelper.toBooks(this);
},

onNavBooks: function () {
  NavHelper.toBooks(this);
},

    onBeforeRebindTable: function () {
      // optional
    }

  });
});