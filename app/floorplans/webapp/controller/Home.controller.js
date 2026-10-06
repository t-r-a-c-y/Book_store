sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("floorplans.controller.Home", {

        onOpenBooks: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("books");
        },

        onOpenWorklist: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("worklist");
        },

        onOpenWizard: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("wizard");
        },

        onOpenOverview: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("overview");
        }

    });
});