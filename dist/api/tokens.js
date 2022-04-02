"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = void 0;
const log = require("loglevel");
var tokens;
(function (tokens) {
    function create(params) {
        log.debug("tokens.create", params);
        return {
            id: "tok_visa",
            object: "token",
            client_ip: "1.1.1.1",
            created: new Date().valueOf(),
            livemode: false,
            type: "card",
            used: false
        };
    }
    tokens.create = create;
    ;
    function retrieve(tokenId) {
        log.debug("tokens.retrieve", tokenId);
        return {
            id: tokenId,
            object: "token",
            client_ip: "1.1.1.1",
            created: new Date().valueOf(),
            livemode: false,
            type: "card",
            used: false
        };
    }
    tokens.retrieve = retrieve;
    ;
})(tokens = exports.tokens || (exports.tokens = {}));
//# sourceMappingURL=tokens.js.map