sap.ui.define([
  "ns/bookshopfiori/model/formatter"
], function (formatter) {
  "use strict";

  QUnit.module("formatter");

  QUnit.test("price formatter returns correct format", function (assert) {
    var sResult = formatter.price(29.5);
    assert.strictEqual(sResult, "29.50 EUR", "Price was formatted correctly");
  });

  QUnit.test("price formatter handles null", function (assert) {
    var sResult = formatter.price(null);
    assert.strictEqual(sResult, "", "Null returns empty string");
  });
});