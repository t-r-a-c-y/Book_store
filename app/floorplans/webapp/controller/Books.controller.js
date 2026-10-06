sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("floorplans.controller.Books", {

        onSearch: function (oEvent) {
            const value = oEvent.getParameter("newValue");

            console.log("Searching for:", value);
        }

    });
});