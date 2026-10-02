QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
  sap.ui.require([
    "ns/bookshopfiori/test/unit/model/formatter"
  ], function () {
    QUnit.start();
  });
});