sap.ui.define([
  "sap/ui/test/Opa5"
], function (Opa5) {
  "use strict";

  Opa5.createPageObjects({
    onTheBookDetail: {
      assertions: {
        iShouldSeeTheDetailPage: function () {
          return this.waitFor({
            controlType: "sap.m.ObjectHeader",
            success: function () {
              Opa5.assert.ok(true, "The book detail page is displayed");
            },
            errorMessage: "The book detail page was not found"
          });
        }
      }
    }
  });
});