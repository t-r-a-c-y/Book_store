sap.ui.define([
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Fragment, JSONModel, MessageToast, MessageBox) {
  "use strict";

  function _getText(oView, sKey, sDefault) {
    var oI18n = oView.getModel("i18n");
    if (oI18n) {
      return oI18n.getResourceBundle().getText(sKey);
    }
    return sDefault || sKey;
  }

  function openForm(oController, oFormData) {
    var oView = oController.getView();
    oView.setModel(new JSONModel(oFormData), "form");

    if (!oController._pBookFormDialog) {
      oController._pBookFormDialog = Fragment.load({
        id: oView.getId(),
        name: "ns.bookshopfiori.view.BookFormDialog",
        controller: oController
      }).then(function (oDialog) {
        oView.addDependent(oDialog);
        return oDialog;
      });
    }

    return oController._pBookFormDialog.then(function (oDialog) {
      oDialog.open();
      return oDialog;
    });
  }

  function closeForm(oController) {
    var oDialog = oController.byId("bookFormDialog");
    if (oDialog) {
      oDialog.close();
    }
  }

  function saveBook(oController, oOptions) {
    oOptions = oOptions || {};
    var oView = oController.getView();
    var oForm = oView.getModel("form").getData();
    var oModel = oView.getModel();

    if (!oForm.title || !String(oForm.title).trim()) {
      MessageBox.error(_getText(oView, "titleRequired", "Title is required."));
      return Promise.resolve();
    }

    var fPrice = parseFloat(oForm.price);
    var iStock = parseInt(oForm.stock, 10);

    if (isNaN(fPrice) || fPrice < 0) {
      MessageBox.error(_getText(oView, "invalidPrice", "Please enter a valid price."));
      return Promise.resolve();
    }
    if (isNaN(iStock) || iStock < 0) {
      MessageBox.error(_getText(oView, "invalidStock", "Please enter a valid stock."));
      return Promise.resolve();
    }

    var oPayload = {
      title: String(oForm.title).trim(),
      description: oForm.description || "",
      price: fPrice,
      stock: iStock
    };
    if (oForm.author_ID) {
      oPayload.author_ID = oForm.author_ID;
    }

    // CREATE
    if (oForm.mode === "create") {
      var oListBinding = oOptions.listBinding || oModel.bindList("/Books");
      var oContext = oListBinding.create(oPayload);

      return oModel.submitBatch("$auto")
        .then(function () {
          return oContext.created();
        })
        .then(function () {
          MessageToast.show(_getText(oView, "bookCreated", "Book created"));
          closeForm(oController);
          if (typeof oOptions.afterChange === "function") {
            oOptions.afterChange();
          }
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error(_getText(oView, "createFailed", "Create failed."));
        });
    }

    // EDIT
    var oEditContext = oController._oEditContext;
    if (!oEditContext) {
      MessageBox.error(_getText(oView, "noBookContext", "No book context found."));
      return Promise.resolve();
    }

    oEditContext.setProperty("title", oPayload.title);
    oEditContext.setProperty("description", oPayload.description);
    oEditContext.setProperty("price", oPayload.price);
    oEditContext.setProperty("stock", oPayload.stock);
    if (oPayload.author_ID) {
      oEditContext.setProperty("author_ID", oPayload.author_ID);
    }

    return oModel.submitBatch("$auto")
      .then(function () {
        MessageToast.show(_getText(oView, "bookUpdated", "Book updated"));
        closeForm(oController);
        if (typeof oOptions.afterChange === "function") {
          oOptions.afterChange();
        }
      })
      .catch(function (oError) {
        console.error(oError);
        MessageBox.error(_getText(oView, "updateFailed", "Update failed."));
      });
  }

  function openDelete(oController, oContext) {
    var oView = oController.getView();
    oView.setModel(new JSONModel({
      title: oContext.getProperty("title"),
      context: oContext
    }), "delete");

    if (!oController._pDeleteDialog) {
      oController._pDeleteDialog = Fragment.load({
        id: oView.getId(),
        name: "ns.bookshopfiori.view.ConfirmDeleteDialog",
        controller: oController
      }).then(function (oDialog) {
        oView.addDependent(oDialog);
        return oDialog;
      });
    }

    return oController._pDeleteDialog.then(function (oDialog) {
      oDialog.open();
      return oDialog;
    });
  }

  function closeDelete(oController) {
    var oDialog = oController.byId("confirmDeleteDialog");
    if (oDialog) {
      oDialog.close();
    }
  }

  function confirmDelete(oController, oOptions) {
    oOptions = oOptions || {};
    var oView = oController.getView();
    var oDelete = oView.getModel("delete").getData();

    return oDelete.context.delete("$auto")
      .then(function () {
        MessageToast.show(_getText(oView, "bookDeleted", "Book deleted"));
        closeDelete(oController);
        if (typeof oOptions.afterDelete === "function") {
          oOptions.afterDelete();
        }
      })
      .catch(function (oError) {
        console.error(oError);
        MessageBox.error(_getText(oView, "deleteFailed", "Delete failed."));
      });
  }

  return {
    openForm: openForm,
    closeForm: closeForm,
    saveBook: saveBook,
    openDelete: openDelete,
    closeDelete: closeDelete,
    confirmDelete: confirmDelete
  };
});