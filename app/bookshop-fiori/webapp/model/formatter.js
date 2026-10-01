sap.ui.define([], function () {
  "use strict";

  return {
    
    price: function (sValue) {
      if (!sValue) {
        return "";
      }
      return parseFloat(sValue).toFixed(2) + " EUR";
    }
  };
});