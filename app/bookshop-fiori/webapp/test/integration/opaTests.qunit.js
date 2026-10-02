QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
  sap.ui.require([
    "ns/bookshopfiori/test/integration/BookJourney"
  ], function () {
    QUnit.start();
  });
});