sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "ns/bookshopfiori/model/formatter",
  "ns/bookshopfiori/controller/helpers/BookDialogHelper",
  "ns/bookshopfiori/controller/helpers/NavHelper",
  "ns/bookshopfiori/controller/helpers/BookFormValidator"
], function (
  Controller,
  JSONModel,
  MessageToast,
  MessageBox,
  formatter,
  BookDialogHelper,
  NavHelper,
  BookFormValidator
) {
  "use strict";

  return Controller.extend("ns.bookshopfiori.controller.BookDetail", {

    formatter: formatter,

    onInit: function () {
      this.getView().setModel(new JSONModel({
        editMode: false,
        titleState: "None",
        titleStateText: "",
        descriptionState: "None",
        descriptionStateText: "",
        priceState: "None",
        priceStateText: "",
        stockState: "None",
        stockStateText: "",
        authorState: "None",
        authorStateText: ""
      }), "ui");

      this.getOwnerComponent()
        .getRouter()
        .getRoute("bookDetail")
        .attachPatternMatched(this.onObjectMatched, this);
    },

    fetchText: function (sKey) {
      return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
    },

    onObjectMatched: function (oEvent) {
      var sBookId = oEvent.getParameter("arguments").bookId;
      this.getView().getModel("ui").setProperty("/editMode", false);

      this.getView().bindElement({
        path: "/Books(" + sBookId + ")",
        parameters: { $expand: "author" }
      });
    },

    onNavHome: function () {
      NavHelper.toBooks(this);
    },

    onNavBooks: function () {
      NavHelper.toBooks(this);
    },

    onNavBack: function () {
      NavHelper.toBooks(this);
    },

    /* ========== EDIT ON OBJECT PAGE ========== */

    onEditBook: function () {
      this.getView().getModel("ui").setProperty("/editMode", true);
    },

    onCancelEdit: function () {
      var oUi = this.getView().getModel("ui");
      oUi.setProperty("/editMode", false);

      var oBinding = this.getView().getElementBinding();
      if (oBinding) {
        oBinding.refresh();
      }
    },

    onSaveEdit: function () {
      var oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        return;
      }

      var oBook = oCtx.getObject();
      var oData = {
        title: oBook.title,
        description: oBook.description,
        price: oBook.price,
        stock: oBook.stock,
        author_ID: oBook.author_ID || (oBook.author && oBook.author.ID) || ""
      };

      var oResult = BookFormValidator.validate(oData, this.fetchText.bind(this));
      var oUi = this.getView().getModel("ui");
      Object.keys(oResult.states).forEach(function (sKey) {
        oUi.setProperty("/" + sKey, oResult.states[sKey]);
      });

      if (!oResult.valid) {
        MessageBox.error(this.fetchText("formInvalid"));
        return;
      }

      var that = this;
      var oView = this.getView();
      var sId = oCtx.getProperty("ID");
      var oPayload = {
        title: (oData.title || "").trim(),
        description: oData.description || "",
        price: parseFloat(oData.price),
        stock: parseInt(oData.stock, 10),
        author_ID: oData.author_ID
      };

      oView.setBusyIndicatorDelay(0);
      oView.setBusy(true);

      fetch("/odata/v4/catalog/Books(" + sId + ")", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(oPayload)
      })
        .then(function (oResponse) {
          if (!oResponse.ok && oResponse.status !== 204) {
            return oResponse.text().then(function (sText) {
              throw new Error(sText || ("HTTP " + oResponse.status));
            });
          }
          MessageToast.show(that.fetchText("bookUpdated"));
          oUi.setProperty("/editMode", false);
          var oBinding = oView.getElementBinding();
          if (oBinding) {
            oBinding.refresh();
          }
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error(that.fetchText("updateFailed"));
        })
        .finally(function () {
          oView.setBusy(false);
        });
    },

    /* ========== DELETE (unchanged pattern) ========== */

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
          NavHelper.toBooks(that);
        }
      });
    },

    /* ========== RATING (unchanged) ========== */

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

    /* ========== COVER (unchanged) ========== */

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