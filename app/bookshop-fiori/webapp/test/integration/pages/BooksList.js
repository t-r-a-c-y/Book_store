sap.ui.define([
  "sap/ui/test/Opa5",
  "sap/ui/test/actions/Press"
], function (Opa5, Press) {
  "use strict";

  Opa5.createPageObjects({
    onTheBooksList: {
      actions: {
        iClickOnTheFirstBook: function () {
          return this.waitFor({
            controlType: "sap.m.ObjectListItem",
            success: function (aItems) {
              new Press().executeOn(aItems[0]);
            },
            errorMessage: "Did not find any book in the list"
          });
        }
      },
      assertions: {
        iShouldSeeTheBooksList: function () {
          return this.waitFor({
            controlType: "sap.m.List",
            success: function (aLists) {
              Opa5.assert.ok(aLists.length > 0, "The books list is visible");
            },
            errorMessage: "The books list was not found"
          });
        }
      }
    }
  });
});