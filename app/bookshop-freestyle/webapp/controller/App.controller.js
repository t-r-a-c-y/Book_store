sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend(
        "bookshop.freestyle.controller.App",
        {
            onSayHello: function () {
                MessageToast.show("Hello from my Bookshop app!");
            }
        }
    );
});