"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestError = void 0;
class RestError extends Error {
    constructor(statusCode, error) {
        super(error.message);
        this.statusCode = statusCode;
        this.error = error;
    }
}
exports.RestError = RestError;
//# sourceMappingURL=RestError.js.map