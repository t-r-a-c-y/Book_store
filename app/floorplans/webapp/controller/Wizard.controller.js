sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (
    Controller,
    MessageToast
) {
    "use strict";

    return Controller.extend("floorplans.controller.Wizard", {

        onComplete: function () {

            MessageToast.show(
                "Order information completed!"
            );
        },

        onBack: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("home");
        }

    });
});