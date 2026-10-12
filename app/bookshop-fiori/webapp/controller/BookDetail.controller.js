sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper"
], function (Controller, History, MessageToast, MessageBox, formatter, BookDialogHelper) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookDetail", {

    formatter: formatter,

    onInit: function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("bookDetail")
        .attachPatternMatched(this._onObjectMatched, this);
    },

    _text: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    _onObjectMatched: function (oEvent) {
      var sBookId = oEvent.getParameter("arguments").bookId;
      this.getView().bindElement({
        path: "/Books(" + sBookId + ")",
        parameters: { $expand: "author" }
      });
    },

    onNavBack: function () {
      if (History.getInstance().getPreviousHash() !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("books", {}, true);
      }
    },

    onEditBook: function () {
      var oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        return;
      }
      var oBook = oCtx.getObject();
      this._oEditContext = oCtx;

      BookDialogHelper.openForm(this, {
        mode: "edit",
        dialogTitle: this._text("editBook"),
        confirmText: this._text("save"),
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
      BookDialogHelper.saveBook(this);
    },

    onDeleteBook: function () {
      var oCtx = this.getView().getBindingContext();
      if (oCtx) {
        BookDialogHelper.openDelete(this, oCtx);
      }
    },

    onCloseDeleteDialog: function () {
      BookDialogHelper.closeDelete(this);
    },

    onConfirmDelete: function () {
      var that = this;
      BookDialogHelper.confirmDelete(this, {
        afterDelete: function () {
          that.getOwnerComponent().getRouter().navTo("books");
        }
      });
    },
    

    onCoverChange: function (oEvent) {
  var aFiles = oEvent.getParameter("files");
  if (!aFiles || !aFiles.length) {
    return;
  }

  var oFile = aFiles[0];
  var oCtx = this.getView().getBindingContext();
  var oAvatar = this.byId("bookCoverAvatar");
  var oModel = this.getView().getModel();

  if (!oCtx) {
    sap.m.MessageBox.error("No book loaded.");
    return;
  }

  var oReader = new FileReader();
  oReader.onload = function (e) {
    var sDataUrl = e.target.result;

    // save on book model
    oCtx.setProperty("coverUrl", sDataUrl);

    // show immediately on profile avatar
    if (oAvatar) {
      oAvatar.setSrc(sDataUrl);
    }

    // persist if CAP has coverUrl
    oModel.submitBatch("$auto")
      .then(function () {
        sap.m.MessageToast.show("Cover uploaded");
      })
      .catch(function (err) {
        console.error(err);
        sap.m.MessageToast.show("Cover shown (save may need coverUrl field in CAP)");
      });
  };
  oReader.readAsDataURL(oFile);
},

    onRatingChange: function (oEvent) {
      var iValue = oEvent.getParameter("value");
      var oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        return;
      }

      // UI-only if no backend field yet:
      // oCtx.setProperty("rating", iValue);

      // If Books.rating exists in CAP:
      oCtx.setProperty("rating", iValue);
      this.getView().getModel().submitBatch("$auto")
        .then(function () {
          MessageToast.show("Rating saved: " + iValue);
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error("Could not save rating");
        });
    }

  });
});