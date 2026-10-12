sap.ui.define([
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "ns/bookshopfiori/controller/helpers/BookFormValidator"
], function (Fragment, JSONModel, MessageBox, MessageToast, BookFormValidator) {
  "use strict";

  function _text(oController, sKey) {
    return oController.getView().getModel("i18n").getResourceBundle().getText(sKey);
  }

  function openForm(oController, oFormData) {
    var oView = oController.getView();
    var oData = Object.assign({}, BookFormValidator.emptyStates(), oFormData);
    oView.setModel(new JSONModel(oData), "form");

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
    });
  }

  function closeForm(oController) {
    var oDialog = oController.byId("bookFormDialog");
    if (oDialog) {
      oDialog.close();
    }
  }

  function onFieldChange(oController, oEvent) {
    var oSource = oEvent.getSource();
    var sId = oSource.getId();
    var oFormModel = oController.getView().getModel("form");

    if (sId.endsWith("inTitle")) {
      oFormModel.setProperty("/title", oEvent.getParameter("value"));
    } else if (sId.endsWith("inDescription")) {
      oFormModel.setProperty("/description", oEvent.getParameter("value"));
    } else if (sId.endsWith("inPrice")) {
      oFormModel.setProperty("/price", oEvent.getParameter("value"));
    } else if (sId.endsWith("inStock")) {
      oFormModel.setProperty("/stock", oEvent.getParameter("value"));
    } else if (sId.endsWith("inAuthor")) {
      oFormModel.setProperty("/author_ID", oSource.getSelectedKey());
    }

    BookFormValidator.validate(oController, false, sId);
  }

  function saveBook(oController, oOptions) {
    oOptions = oOptions || {};

    if (!BookFormValidator.validate(oController, true)) {
      MessageBox.error(_text(oController, "formInvalid"));
      return Promise.resolve(false);
    }

    var oForm = oController.getView().getModel("form").getData();
    var oModel = oController.getView().getModel();
    var oPayload = {
      title: String(oForm.title).trim(),
      description: oForm.description || "",
      price: parseFloat(oForm.price),
      stock: parseInt(oForm.stock, 10),
      author_ID: oForm.author_ID
    };

    // CREATE
    if (oForm.mode === "create") {
      return fetch("/odata/v4/catalog/Books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(oPayload)
      })
        .then(function (oResponse) {
          if (!oResponse.ok) {
            return oResponse.text().then(function (sText) {
              throw new Error(sText || ("HTTP " + oResponse.status));
            });
          }
        })
        .then(function () {
          MessageToast.show(_text(oController, "bookCreated"));
          closeForm(oController);
          if (typeof oOptions.afterChange === "function") {
            oOptions.afterChange();
          }
          return true;
        })
        .catch(function (oError) {
          console.error(oError);
          MessageBox.error(_text(oController, "createFailed"));
          return false;
        });
    }

    // EDIT
    if (!oController._oEditContext) {
      MessageBox.error(_text(oController, "updateFailed"));
      return Promise.resolve(false);
    }

    oController._oEditContext.setProperty("title", oPayload.title);
    oController._oEditContext.setProperty("description", oPayload.description);
    oController._oEditContext.setProperty("price", oPayload.price);
    oController._oEditContext.setProperty("stock", oPayload.stock);
    oController._oEditContext.setProperty("author_ID", oPayload.author_ID);

    return oModel.submitBatch("$auto")
      .then(function () {
        MessageToast.show(_text(oController, "bookUpdated"));
        closeForm(oController);
        if (typeof oOptions.afterChange === "function") {
          oOptions.afterChange();
        }
        return true;
      })
      .catch(function (oError) {
        console.error(oError);
        MessageBox.error(_text(oController, "updateFailed"));
        return false;
      });
  }

  function openDelete(oController, oContext) {
    var oView = oController.getView();
    oView.setModel(new JSONModel({
      title: oContext.getProperty("title"),
      id: oContext.getProperty("ID")
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
    var sBookId = oController.getView().getModel("delete").getProperty("/id");

    return fetch("/odata/v4/catalog/Books(" + sBookId + ")", {
      method: "DELETE",
      headers: { "Accept": "application/json" }
    })
      .then(function (oResponse) {
        if (oResponse.status === 404) {
          return;
        }
        if (!oResponse.ok && oResponse.status !== 204) {
          return oResponse.text().then(function (sText) {
            throw new Error(sText || ("HTTP " + oResponse.status));
          });
        }
      })
      .then(function () {
        MessageToast.show(_text(oController, "bookDeleted"));
        closeDelete(oController);
        if (typeof oOptions.afterDelete === "function") {
          oOptions.afterDelete();
        }
      })
      .catch(function (oError) {
        console.error(oError);
        MessageBox.error(_text(oController, "deleteFailed"));
      });
  }

  return {
    openForm: openForm,
    closeForm: closeForm,
    onFieldChange: onFieldChange,
    saveBook: saveBook,
    openDelete: openDelete,
    closeDelete: closeDelete,
    confirmDelete: confirmDelete
  };
});