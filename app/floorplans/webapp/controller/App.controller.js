sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("floorplans.controller.App", {

        onOpenBooks: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("books");
        }

    });
});