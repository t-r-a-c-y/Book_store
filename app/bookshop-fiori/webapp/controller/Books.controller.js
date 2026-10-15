sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/core/message/Message",
  "sap/ui/core/library",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper"
], function (
  Controller, Filter, FilterOperator, Sorter, JSONModel,
  Fragment, MessageToast, MessageBox, Message, coreLibrary,
  formatter, BookDialogHelper
) {
  "use strict";

  var MessageType = coreLibrary.MessageType;

  // ... rest of controller

  return Controller.extend("ns.bookshopfiori.controller.Books", {

    formatter: formatter,

    onInit: function () {
      this.sSearchQuery = "";
      this.sStockKey = "ALL";
      this.sAuthorId = "ALL";
      this.sAuthorName = "";
      this.bSortDesc = false;
      this.oEditContext = null;

      var oMessageManager = sap.ui.getCore().getMessageManager();
      this.getView().setModel(oMessageManager.getMessageModel(), "message");

      this.getView().setModel(new JSONModel([
        { key: "ALL", text: "All Authors" }
      ]), "authors");

      this.loadAuthors();
    },

    fetchText: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    loadAuthors: function () {
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
      this.applyFilters();
    },

    onFilterStock: function (oEvent) {
      this.sStockKey = oEvent.getSource().getSelectedKey() || "ALL";
      this.applyFilters();
    },

    onFilterAuthor: function (oEvent) {
      var oItem = oEvent.getSource().getSelectedItem();
      this.sAuthorId = oEvent.getSource().getSelectedKey() || "ALL";
      this.sAuthorName = oItem ? oItem.getText() : "";
      this.applyFilters();
    },

    applyFilters: function () {
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

    clearFilters: function () {
      this.sSearchQuery = "";
      this.sStockKey = "ALL";
      this.sAuthorId = "ALL";
      this.sAuthorName = "";

      if (this.byId("searchField")) {
        this.byId("searchField").setValue("");
      }
      if (this.byId("stockFilter")) {
        this.byId("stockFilter").setSelectedKey("ALL");
      }
      if (this.byId("authorFilter")) {
        this.byId("authorFilter").setSelectedKey("ALL");
      }

      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.filter([]);
      }
    },

    onSort: function () {
      this.bSortDesc = !this.bSortDesc;
      var oBinding = this.byId("booksTable").getBinding("items");
      if (oBinding) {
        oBinding.sort([new Sorter("title", this.bSortDesc)]);
      }
    },

    runWithBusy: function (fnJob) {
      var oView = this.getView();
      oView.setBusyIndicatorDelay(0);
      oView.setBusy(true);

      return Promise.resolve()
        .then(fnJob)
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error("Request failed");
          throw oError;
        })
        .finally(function () {
          oView.setBusy(false);
        });
    },

    onRefresh: function () {
      var that = this;
      this.runWithBusy(function () {
        var oBinding = that.byId("booksTable").getBinding("items");
        if (oBinding) {
          return Promise.resolve(oBinding.refresh());
        }
      }).then(function () {
        that.loadAuthors();
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
  var oComponent = this.getOwnerComponent();
  oComponent.setFclLayout("OneColumn");
  // third argument true = replace current history entry
  oComponent.getRouter().navTo("createOrder", {}, true);
},

    onOpenSmartBooks: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.getOwnerComponent().getRouter().navTo("smartBooks");
    },

    // onCreateBook: function () {
    //   this.oEditContext = null;
    //   BookDialogHelper.openForm(this, {
    //     mode: "create",
    //     dialogTitle: this.fetchText("createBook"),
    //     confirmText: this.fetchText("create"),
    //     title: "",
    //     description: "",
    //     price: "",
    //     stock: "",
    //     author_ID: ""
    //   });
    // },

    onCreateBook: function () {
  NavHelper.toBookCreate(this);
},

    openEditFromContext: function (oCtx) {
      if (!oCtx) {
        return;
      }
      var oBook = oCtx.getObject();
      this.oEditContext = oCtx;

      BookDialogHelper.openForm(this, {
        mode: "edit",
        dialogTitle: this.fetchText("editBook"),
        confirmText: this.fetchText("save"),
        title: oBook.title,
        description: oBook.description || "",
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      });
    },

    onEditBook: function (oEvent) {
      var oSource = oEvent.getSource ? oEvent.getSource() : oEvent;
      this.openEditFromContext(oSource.getBindingContext());
    },

    onEditSelected: function () {
      var aSelected = this.byId("booksTable").getSelectedItems();
      if (aSelected.length === 1) {
        this.openEditFromContext(aSelected[0].getBindingContext());
      }
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
          that.clearFilters();
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
      var iCount = this.byId("booksTable").getSelectedItems().length;
      var oEditBtn = this.byId("btnEditSelected");
      var oDeleteBtn = this.byId("btnDeleteSelected");

      if (oEditBtn) {
        oEditBtn.setEnabled(iCount === 1);
      }
      if (oDeleteBtn) {
        oDeleteBtn.setEnabled(iCount >= 1);
      }
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
      MessageBox.confirm("Delete " + aSelected.length + " selected books?", {
        title: this.fetchText("deleteBook"),
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.DELETE,
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.DELETE) {
            that.deleteSelectedBooks(aSelected);
          }
        }
      });
    },

    deleteSelectedBooks: function (aSelected) {
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

      this.runWithBusy(function () {
        return Promise.all(aPromises);
      }).then(function () {
        MessageToast.show(that.fetchText("bookDeleted"));
        that.addMessage(that.fetchText("bookDeleted"), MessageType.Success);
        that.byId("booksTable").removeSelections(true);
        that.onTableSelectionChange();
        that.onRefresh();
      }).catch(function (oError) {
        console.error(oError);
        MessageBox.error(that.fetchText("deleteFailed"));
        that.addMessage(that.fetchText("deleteFailed"), MessageType.Error);
      });
    },

    onMessagePopoverPress: function (oEvent) {
      var oButton = oEvent.getSource();
      var that = this;

      if (!this.pMessagePopover) {
        this.pMessagePopover = Fragment.load({
          id: this.getView().getId(),
          name: "ns.bookshopfiori.view.MessagePopover",
          controller: this
        }).then(function (oPopover) {
          that.getView().addDependent(oPopover);
          return oPopover;
        });
      }

      this.pMessagePopover.then(function (oPopover) {
        oPopover.openBy(oButton);
      });
    },

    addMessage: function (sText, sType) {
      sap.ui.getCore().getMessageManager().addMessages(
        new Message({
          message: sText,
          type: sType || MessageType.Error,
          processor: this.getView().getModel()
        })
      );
    },

    onOpenPdf: function () {
  var oView = this.getView();

  oView.setModel(new sap.ui.model.json.JSONModel({
    source: "",
    title: "PDF Preview",
    mode: "",          // "viewer" | "iframe"
    iframeHtml: "",
    blobUrl: ""
  }), "pdf");

  if (!this.pPdfDialog) {
    this.pPdfDialog = sap.ui.core.Fragment.load({
      id: oView.getId(),
      name: "ns.bookshopfiori.view.PdfPreviewDialog",
      controller: this
    }).then(function (oDialog) {
      oView.addDependent(oDialog);
      return oDialog;
    });
  }

  this.pPdfDialog.then(function (oDialog) {
    oDialog.open();
  });
},

onPdfFileChange: function (oEvent) {
  var oUploader = oEvent.getSource();
  var aFiles = oEvent.getParameter("files");
  var oFile = aFiles && aFiles[0];

  if (!oFile) {
    var oDom = oUploader.getDomRef("fu");
    if (oDom && oDom.files && oDom.files[0]) {
      oFile = oDom.files[0];
    }
  }

  if (!oFile) {
    sap.m.MessageToast.show("No file selected");
    return;
  }

  var oPdfModel = this.getView().getModel("pdf");
  if (!oPdfModel) {
    return;
  }

  // cleanup previous blob
  var sOldBlob = oPdfModel.getProperty("/blobUrl");
  if (sOldBlob) {
    URL.revokeObjectURL(sOldBlob);
  }

  var sBlobUrl = URL.createObjectURL(oFile);
  oPdfModel.setProperty("/blobUrl", sBlobUrl);
  oPdfModel.setProperty("/title", oFile.name || "PDF Preview");
  oPdfModel.setProperty("/source", "");
  oPdfModel.setProperty("/mode", "");
  oPdfModel.setProperty("/iframeHtml", "");

  var oReader = new FileReader();

  oReader.onload = function (e) {
    // sDataUrl exists ONLY inside this function
    var sDataUrl = e.target.result;

    oPdfModel.setProperty("/source", sDataUrl);

    var sHtml =
      "<iframe src='" + sDataUrl +
      "' width='100%' height='900px' style='border:none; min-height:75vh;'></iframe>";

    oPdfModel.setProperty("/iframeHtml", sHtml);
    oPdfModel.setProperty("/mode", "iframe");
  };

  oReader.onerror = function () {
    sap.m.MessageBox.error("Could not read the PDF file.");
  };

  oReader.readAsDataURL(oFile);
},

onPdfOpenTab: function () {
  var oPdfModel = this.getView().getModel("pdf");
  var sBlobUrl = oPdfModel && oPdfModel.getProperty("/blobUrl");
  if (sBlobUrl) {
    window.open(sBlobUrl, "_blank");
  }
},

onClosePdf: function () {
  var oPdfModel = this.getView().getModel("pdf");
  if (oPdfModel) {
    var sBlobUrl = oPdfModel.getProperty("/blobUrl");
    if (sBlobUrl) {
      URL.revokeObjectURL(sBlobUrl);
    }
    oPdfModel.setData({
      source: "",
      title: "PDF Preview",
      mode: "",
      iframeHtml: "",
      blobUrl: ""
    });
  }

  var oUploader = this.byId("pdfUploader");
  if (oUploader && oUploader.clear) {
    oUploader.clear();
  }

  this.byId("pdfDialog").close();
},

  });
});