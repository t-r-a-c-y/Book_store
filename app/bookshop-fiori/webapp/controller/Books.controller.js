sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, formatter, BookDialogHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      // Clean naming convention (Hungarian Notation) properties - removed all underscores
      this.sSearchQuery = "";
      this.sStockKey = "ALL";
      this.sAuthorId = "ALL";
      this.sAuthorName = "";
      this.bSortDesc = false;
      var oMessageManager = sap.ui.getCore().getMessageManager();
this.getView().setModel(oMessageManager.getMessageModel(), "message");

      this.getView().setModel(new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]), "authors");

      this.loadAuthors(); // Updated call without underscore
    },

    
    /**
     * Helper function to fetch translation text from i18n bundle.
     */
    fetchText: function (sKey) { // Renamed from _text
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    /**
     * Loads author metadata items from the server backend.
     */
    loadAuthors: function () { // Renamed from _loadAuthors
      var oModel = this.getOwnerComponent().getModel();
      var that = this;
      if (!oModel) {
        return;
      }

      oModel.bindList("/Authors").requestContexts(0, 100).then(function (aContexts) {
        var aAuthors = [{ key: "ALL", text: "All Authors" }];
        aContexts.forEach(function (oContext) {
          var oAuthor = oContext.getObject();
          aAuthors.push({ key: oAuthor.ID, text: oAuthor.name });
        });
        that.getView().getModel("authors").setData(aAuthors);
      });
    },

    onSearch: function (oEvent) {
      this.sSearchQuery = oEvent.getParameter("newValue") || "";
      this.applyFilters(); // Updated call without underscore
    },

    onFilterStock: function (oEvent) {
      this.sStockKey = oEvent.getSource().getSelectedKey() || "ALL";
      this.applyFilters(); // Updated call without underscore
    },

    onFilterAuthor: function (oEvent) {
      var oItem = oEvent.getSource().getSelectedItem();
      this.sAuthorId = oEvent.getSource().getSelectedKey() || "ALL";
      this.sAuthorName = oItem ? oItem.getText() : "";
      this.applyFilters(); // Updated call without underscore
    },

    /**
     * Builds and aggregates operational query filters onto the books table dataset.
     */
    applyFilters: function () { // Renamed from _applyFilters
      var aFilters = [];
      if (this.sSearchQuery) {
        aFilters.push(new Filter("title", FilterOperator.Contains, this.sSearchQuery));
      }
      if (this.sAuthorId !== "ALL" && this.sAuthorName && this.sAuthorName !== "All Authors") {
        aFilters.push(new Filter("author/name", FilterOperator.EQ, this.sAuthorName));
      }
      if (this.sStockKey === "IN_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.GT, 0));
      } else if (this.sStockKey === "OUT_OF_STOCK") {
        aFilters.push(new Filter("stock", FilterOperator.EQ, 0));
      }
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    /**
     * Resets layout filter elements back to default criteria states.
     */
    clearFilters: function () { // Renamed from _clearFilters
      this.sSearchQuery = "";
      this.sStockKey = "ALL";
      this.sAuthorId = "ALL";
      this.sAuthorName = "";
      if (this.byId("searchField")) { this.byId("searchField").setValue(""); }
      if (this.byId("stockFilter")) { this.byId("stockFilter").setSelectedKey("ALL"); }
      if (this.byId("authorFilter")) { this.byId("authorFilter").setSelectedKey("ALL"); }
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) { oBinding.filter([]); }
    },

    onSort: function () {
      this.bSortDesc = !this.bSortDesc;
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.sort([new Sorter("title", this.bSortDesc)]);
      }
    },

    onRefresh: function () {
  var that = this;
  this._runWithBusy(function () {
    var oBinding = that.byId("booksTable").getBinding("items");
    if (oBinding) {
      return Promise.resolve(oBinding.refresh());
    }
  }).then(function () {
    that.loadAuthors && that.loadAuthors();
  });
},

    onBookPress: function (oEvent) {
      var sBookId = oEvent.getSource().getBindingContext().getProperty("ID");
      this.getOwnerComponent().setFclLayout("TwoColumnsMidExpanded");
      this.getOwnerComponent().getRouter().navTo("bookDetail", {
        bookId: sBookId
      });
    },

     onCreateOrder: function () {
  // if using FCL, show one column for this page
  if (this.getOwnerComponent().setFclLayout) {
    this.getOwnerComponent().setFclLayout("OneColumn");
  }
  this.getOwnerComponent().getRouter().navTo("createOrder");
},


    onCreateBook: function () {
      this.oEditContext = null; // Renamed from _oEditContext
      BookDialogHelper.openForm(this, {
        mode: "create",
        dialogTitle: this.fetchText("createBook"), // Updated function call
        confirmText: this.fetchText("create"),    // Updated function call
        title: "",
        description: "",
        price: "",
        stock: "",
        author_ID: ""
      });
    },

    onEditBook: function (oEvent) {
      // Accepts direct event source or mock event objects seamlessly
      var oSource = oEvent.getSource ? oEvent.getSource() : oEvent;
      var oCtx = oSource.getBindingContext();
      var oBook = oCtx.getObject();
      this.oEditContext = oCtx; // Renamed from _oEditContext
      
      BookDialogHelper.openForm(this, {
        mode: "edit",
        dialogTitle: this.fetchText("editBook"), // Updated function call
        confirmText: this.fetchText("save"),     // Updated function call
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      });
    },

    onBookFieldChange: function (oEvent) {
      BookDialogHelper.onFieldChange(this, oEvent);
    },

    onCloseBookForm: function () {
      BookDialogHelper.closeForm(this);
    },

    onSaveBook: function () {
      var that = this;
      BookDialogHelper.saveBook(this, {
        afterChange: function () {
          that.clearFilters(); // Updated call without underscore
          that.onRefresh();
        }
      });
    },

    onDeleteBook: function (oEvent) {
      BookDialogHelper.openDelete(this, oEvent.getSource().getBindingContext());
    },

    onCloseDeleteDialog: function () {
      BookDialogHelper.closeDelete(this);
    },

    onConfirmDelete: function () {
      var that = this;
      BookDialogHelper.confirmDelete(this, {
        afterDelete: function () {
          that.onRefresh();
        }
      });
    },

    onTableSelectionChange: function () {
      var aSelected = this.byId("booksTable").getSelectedItems();
      var iCount = aSelected.length;

      var oEditBtn = this.byId("btnEditSelected");
      var oDeleteBtn = this.byId("btnDeleteSelected");

      if (oEditBtn) {
        oEditBtn.setEnabled(iCount === 1);
      }
      if (oDeleteBtn) {
        oDeleteBtn.setEnabled(iCount >= 1);
      }
    },

    onEditSelected: function () {
      var aSelected = this.byId("booksTable").getSelectedItems();
      if (aSelected.length !== 1) {
        return;
      }
      // REUSE OPTIMIZATION: Calls clean onEditBook logic passing row source directly
      this.onEditBook(aSelected[0]);
    },

    onDeleteSelected: function () {
      var aSelected = this.byId("booksTable").getSelectedItems();
      if (!aSelected.length) {
        return;
      }

      if (aSelected.length === 1) {
        BookDialogHelper.openDelete(this, aSelected[0].getBindingContext());
        return;
      }

      var that = this;
      sap.m.MessageBox.confirm(
        "Delete " + aSelected.length + " selected books?",
        {
          title: this.fetchText("deleteBook"), // Updated function call
          actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
          emphasizedAction: sap.m.MessageBox.Action.DELETE,
          onClose: function (sAction) {
            if (sAction !== sap.m.MessageBox.Action.DELETE) {
              return;
            }
            that.deleteSelectedBooks(aSelected); // Updated call without underscore
          }
        }
      );
    },
    onOpenSmartBooks: function () {
  if (this.getOwnerComponent().setFclLayout) {
    this.getOwnerComponent().setFclLayout("OneColumn");
  }
  this.getOwnerComponent().getRouter().navTo("smartBooks");
},

  onMessagePopoverPress: function (oEvent) {
  var oButton = oEvent.getSource();
  var that = this;

  if (!this._pMessagePopover) {
    this._pMessagePopover = sap.ui.core.Fragment.load({
      id: this.getView().getId(),
      name: "ns.bookshopfiori.view.MessagePopover",
      controller: this
    }).then(function (oPopover) {
      that.getView().addDependent(oPopover);
      return oPopover;
    });
  }

  this._pMessagePopover.then(function (oPopover) {
    oPopover.openBy(oButton);
  });
},

addMessage: function (sText, sType) {
  sap.ui.getCore().getMessageManager().addMessages(
    new sap.ui.core.message.Message({
      message: sText,
      type: sType || sap.ui.core.MessageType.Error,
      processor: this.getView().getModel()
    })
  );
},

runWithBusy: function (fnJob) {
  var oView = this.getView();
  oView.setBusyIndicatorDelay(0);
  oView.setBusy(true);

  return Promise.resolve()
    .then(fnJob)
    .catch(function (oError) {
      console.error(oError);
      sap.m.MessageBox.error("Request failed");
      throw oError;
    })
    .finally(function () {
      oView.setBusy(false);
    });
},
    /**
     * Loops through all checked records to execute batch deletion requests against the CAP server.
     */
    deleteSelectedBooks: function (aSelected) { // Renamed from _deleteSelectedBooks to remove underscore
      var that = this;
      var aPromises = aSelected.map(function (oItem) {
        var sId = oItem.getBindingContext().getProperty("ID");
        return fetch("/odata/v4/catalog/Books(" + sId + ")", {
          method: "DELETE",
          headers: { "Accept": "application/json" }
        }).then(function (oResponse) {
          if (oResponse.status === 404) {
            return;
          }
          if (!oResponse.ok && oResponse.status !== 204) {
            return oResponse.text().then(function (sText) {
              throw new Error(sText || ("HTTP " + oResponse.status));
            });
          }
        });
      });

      this._runWithBusy(function () {
  return Promise.all(aPromises);
}).then(function () {
  sap.m.MessageToast.show(that.fetchText("bookDeleted"));
  that.byId("booksTable").removeSelections(true);
  that.onTableSelectionChange();
  that.onRefresh();
}).catch(function (oError) {
          console.error(oError);
          // Replaced _text call with clean fetchText method
          sap.m.MessageBox.error(that.fetchText("deleteFailed"));
        });
    }

  });
});
