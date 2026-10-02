sap.ui.define([
  "sap/ui/core/Control"
], function (Control) {
  "use strict";

  return Control.extend("ns.bookshopfiori.control.BookRating", {

    metadata: {
      properties: {
        value: { type: "float", defaultValue: 0 },   // rating 0–5
        maxValue: { type: "int", defaultValue: 5 }
      }
    },

    
    renderer: function (oRm, oControl) {
      var iValue = Math.round(oControl.getValue());
      var iMax = oControl.getMaxValue();

      oRm.openStart("div", oControl);
      oRm.class("myBookRating");
      oRm.openEnd();

      for (var i = 1; i <= iMax; i++) {
        oRm.openStart("span");
        oRm.class(i <= iValue ? "sapUiIcon" : "sapUiIcon");
        oRm.attr("style", i <= iValue
          ? "color: #f0a100; margin-right: 2px;"
          : "color: #ccc; margin-right: 2px;");
        oRm.openEnd();
        oRm.text(i <= iValue ? "★" : "☆");
        oRm.close("span");
      }

      oRm.close("div");
    }
  });
});