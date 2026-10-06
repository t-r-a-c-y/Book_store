sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "ns/bookshopfiori/model/formatter"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, formatter) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this._sSearchQuery = "";
      this._sStockKey = "ALL";
      this._sAuthorId = "ALL";

      // Local model for author dropdown (includes "All Authors")
      var oAuthorsModel = new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]);
      this.getView().setModel(oAuthorsModel, "authors");

      // Load real authors from CAP
      this._loadAuthors();
    },

    _loadAuthors: function () {
      var oModel = this.getOwnerComponent().getModel();
      var that = this;

      if (!oModel) {
        return;
      }

      // OData V4 way to read a list
      var oListBinding = oModel.bindList("/Authors");
      oListBinding.requestContexts(0, 100).then(function (aContexts) {
        var aAuthors = [
          { key: "ALL", text: "All Authors" }
        ];

        aContexts.forEach(function (oContext) {
          var oAuthor = oContext.getObject();
          aAuthors.push({
            key: oAuthor.ID,
            text: oAuthor.name
          });
        });

        that.getView().getModel("authors").setData(aAuthors);
      }).catch(function (oError) {
        console.error("Failed to load authors", oError);
      });
    },

    onRefresh: function () {
      this.getView().getModel().refresh();
      this._loadAuthors();
    },

    onSearch: function (oEvent) {
      this._sSearchQuery = oEvent.getParameter("newValue") || "";
      this._applyFilters();
    },

    onFilterStock: function (oEvent) {
      this._sStockKey = oEvent.getSource().getSelectedKey() || "ALL";
      this._applyFilters();
    },

    onFilterAuthor: function (oEvent) {
      this._sAuthorId = oEvent.getSource().getSelectedKey() || "ALL";
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];

      // 1) Title search
      if (this._sSearchQuery) {
        aFilters.push(new Filter("title", FilterOperator.Contains, this._sSearchQuery));
      }

      // 2) Author filter
      if (this._sAuthorId && this._sAuthorId !== "ALL") {
        // Try author_ID first (normal CAP association key)
        aFilters.push(new Filter("author_ID", FilterOperator.EQ, this._sAuthorId));
      }

      // 3) Stock filter
      if (this._sStockKey === "IN_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.GT, 0));
      } else if (this._sStockKey === "OUT_OF_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
      }

      var oTable = this.byId("booksTable");
      if (!oTable) {
        return;
      }

      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    onSort: function () {
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.sort([new Sorter("title", false)]);
      }
    },

    onBookPress: function (oEvent) {
      var sBookId = oEvent.getSource().getBindingContext().getProperty("ID");
      this.getOwnerComponent().getRouter().navTo("bookDetail", {
        bookId: sBookId
      });
    }

  });
});