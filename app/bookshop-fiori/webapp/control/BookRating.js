sap.ui.define([
  "sap/ui/core/Control"
], function (Control) {
  "use strict";

  return Control.extend("ns.bookshopfiori.control.BookRating", {

    metadata: {
      properties: {
        value: { type: "int", defaultValue: 0 },
        maxValue: { type: "int", defaultValue: 5 },
        editable: { type: "boolean", defaultValue: true }
      },
      events: {
        change: {
          parameters: {
            value: { type: "int" }
          }
        }
      }
    },

    renderer: function (oRm, oControl) {
      var iValue = oControl.getValue() || 0;
      var iMax = oControl.getMaxValue() || 5;
      var bEditable = oControl.getEditable();

      oRm.openStart("div", oControl);
      oRm.style("display", "inline-block");
      oRm.style("cursor", bEditable ? "pointer" : "default");
      oRm.openEnd();

      for (var i = 1; i <= iMax; i++) {
        oRm.openStart("span");
        oRm.attr("data-star", i);
        oRm.style("margin-right", "4px");
        oRm.style("font-size", "1.25rem");
        oRm.style("color", i <= iValue ? "#f0a100" : "#cccccc");
        oRm.openEnd();
        oRm.text(i <= iValue ? "★" : "☆");
        oRm.close("span");
      }

      oRm.close("div");
    },

    onclick: function (oEvent) {
      if (!this.getEditable()) {
        return;
      }
      var oTarget = oEvent.target;
      var sStar = oTarget && oTarget.getAttribute("data-star");
      if (!sStar) {
        return;
      }
      var iValue = parseInt(sStar, 10);
      this.setValue(iValue);
      this.fireChange({ value: iValue });
    }

  });
});