"use strict";
var EventGroup = (function () {
    function EventGroup(data) {
        if (data) {
            this.id = parseInt(data.id);
            this.name = data.name;
        }
    }
    return EventGroup;
}());
exports.EventGroup = EventGroup;
//# sourceMappingURL=eventgroup.js.map