sap.ui.define([
  "sap/ui/test/opaQunit",
  "ns/bookshopfiori/test/integration/pages/BooksList",
  "ns/bookshopfiori/test/integration/pages/BookDetail"
], function (opaTest) {
  "use strict";

  QUnit.module("Book Journey");

  opaTest("Should see the books list", function (Given, When, Then) {
    Given.iStartMyUIComponent({
      componentConfig: {
        name: "ns.bookshopfiori"
      }
    });

    Then.onTheBooksList.iShouldSeeTheBooksList();
    Given.iTeardownMyApp();
  });

  opaTest("Should navigate to book detail when clicking a book", function (Given, When, Then) {
    Given.iStartMyUIComponent({
      componentConfig: {
        name: "ns.bookshopfiori"
      }
    });

    When.onTheBooksList.iClickOnTheFirstBook();
    Then.onTheBookDetail.iShouldSeeTheDetailPage();
    Given.iTeardownMyApp();
  });
});