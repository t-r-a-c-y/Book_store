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
      var iValue = parseInt(iStock, 10);
      if (isNaN(iValue)) {
        return "";
      }
      return iValue > 0 ? "In Stock (" + iValue + ")" : "Out of Stock";
    },

    stockStatusState: function (iStock) {
      var iValue = parseInt(iStock, 10);
      if (isNaN(iValue)) {
        return "None";
      }
      return iValue > 0 ? "Success" : "Error";
    }
  };
});