sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("floorplans.controller.Overview", {

        onBack: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("home");
        },

        onBooks: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("books");
        },

        onWorklist: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("worklist");
        }

    });
});