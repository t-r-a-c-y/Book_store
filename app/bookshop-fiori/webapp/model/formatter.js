sap.ui.define([], function () {
  "use strict";

  return {
    price: function (vValue) {
      if (vValue === null || vValue === undefined || vValue === "") {
        return "";
      }
      return parseFloat(vValue).toFixed(2) + " EUR";
    },

    stockStatusText: function (iStock) {
      return iStock > 0 ? "In Stock (" + iStock + ")" : "Out of Stock";
    },

    stockStatusState: function (iStock) {
      return iStock > 0 ? "Success" : "Error";
    }
  };
});