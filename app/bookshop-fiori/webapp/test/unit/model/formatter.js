sap.ui.define([
  "ns/bookshopfiori/model/formatter"
], function (formatter) {
  "use strict";

  QUnit.module("Formatter");

  QUnit.test("Price formatter - normal value", function (assert) {
    assert.strictEqual(formatter.price(29.5), "29.50 EUR", "Formats 29.5 correctly");
  });

  QUnit.test("Price formatter - zero", function (assert) {
    assert.strictEqual(formatter.price(0), "0.00 EUR", "Formats 0 correctly");
  });

  QUnit.test("Price formatter - null", function (assert) {
    assert.strictEqual(formatter.price(null), "", "Returns empty string for null");
  });

  QUnit.test("Price formatter - undefined", function (assert) {
    assert.strictEqual(formatter.price(undefined), "", "Returns empty string for undefined");
  });
});