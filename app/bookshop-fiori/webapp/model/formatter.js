sap.ui.define([], function () {
  "use strict";

  return {

    
    price: function (sValue) {
      if (!sValue && sValue !== 0) {
        return "";
      }
      return parseFloat(sValue).toFixed(2) + " EUR";
    },

    
    stock: function (iStock) {
      if (iStock === 0) {
        return "Out of Stock";
      }
      return iStock + " pieces available";
    },

    
    stockState: function (iStock) {
      return iStock > 0 ? "Success" : "Error";
    }
  };
});