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
        .attachPatternMatched(this.onObjectMatched, this); // Removed underscore
    },

    /**
     * Helper function to fetch translation text from i18n properties bundle.
     */
    fetchText: function (sKey) { // Renamed from _text to fetchText
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    /**
     * Binds the specific book data instance to the layout view template context.
     */
    onObjectMatched: function (oEvent) { // Renamed from _onObjectMatched
      var sBookId = oEvent.getParameter("arguments").bookId;
      this.getView().bindElement({
        path: "/Books(" + sBookId + ")",
        parameters: { $expand: "author" }
      });
    },

    onNavBack: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.getOwnerComponent().getRouter().navTo("books");
    },

    onNavHome: function () {
      this.getOwnerComponent().setFclLayout("OneColumn");
      this.getOwnerComponent().getRouter().navTo("books");
    },

    onEditBook: function () {
      var oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        return;
      }
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

    onRatingChange: function (oEvent) {
      var iValue = oEvent.getParameter("value");
      var oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        return;
      }

      oCtx.setProperty("rating", iValue);
      this.getView().getModel().submitBatch("$auto")
        .then(function () {
          MessageToast.show("Rating saved: " + iValue);
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error("Could not save rating");
        });
    },

    onFileSizeExceed: function (oEvent) {
      var sFileName = oEvent.getParameter("fileName");
      var fFileSize = oEvent.getParameter("fileSize");
      
      var iMaxAllowedKB = Math.round(this.getView().byId("coverUploader").getMaximumFileSize() * 1024);
      var iCurrentSizeKB = Math.round(fFileSize * 1024);

      MessageBox.error(
        "The file '" + sFileName + "' is too large (" + iCurrentSizeKB + " KB).\n" +
        "Please select an image smaller than " + iMaxAllowedKB + " KB."
      );
    },

    onCoverChange: function (oEvent) {
      var oFileUploader = oEvent.getSource();
      var aFiles = oEvent.getParameter("files");
      var oCtx = this.getView().getBindingContext();

      if (!oCtx || !aFiles || aFiles.length === 0) {
        return;
      }

      var oFile = aFiles[0];
      var oFileReader = new FileReader();
      var that = this;

      oFileReader.onload = function (e) {
        var sOriginalBase64 = e.target.result;
        var oImage = new Image();
        oImage.src = sOriginalBase64;
        
        oImage.onload = function () {
          var oCanvas = document.createElement("canvas");
          var oCtxElement = oCanvas.getContext("2d");

          var iMaxWidth = 800; 
          var iMaxHeight = 800;
          var iWidth = oImage.width;
          var iHeight = oImage.height;

          if (iWidth > iMaxWidth || iHeight > iMaxHeight) {
            if (iWidth > iHeight) {
              iHeight *= iMaxWidth / iWidth;
              iWidth = iMaxWidth;
            } else {
              iWidth *= iMaxHeight / iHeight;
              iHeight = iMaxHeight;
            }
          }

          oCanvas.width = iWidth;
          oCanvas.height = iHeight;
          oCtxElement.drawImage(oImage, 0, 0, iWidth, iHeight);

          var sCompressedBase64 = oCanvas.toDataURL("image/jpeg", 0.6);

          oCtx.setProperty("coverUrl", sCompressedBase64);
          oFileUploader.setValue("");

          var oModel = that.getView().getModel();
          if (oModel && typeof oModel.submitBatch === "function") {
            oModel.submitBatch("$auto")
              .then(function () {
                MessageToast.show("Cover compressed and updated successfully!");
              })
              .catch(function (oError) {
                console.error(oError);
                MessageBox.error("Could not sync the compressed cover back to the database.");
              });
          }
        };
      };

      oFileReader.readAsDataURL(oFile);
    }

  });
});
