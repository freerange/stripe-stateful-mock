"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressApp = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = require("./routes");
const RestError_1 = require("./api/RestError");
const idempotency_1 = require("./api/idempotency");
const auth_1 = require("./api/auth");
const log = require("loglevel");
function createExpressApp() {
    const app = express_1.default();
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(auth_1.auth.authRoute);
    app.use(idempotency_1.idempotencyRoute);
    app.use("/", routes_1.routes);
    // Error handling comes last.
    app.use((err, req, res, next) => {
        if (err instanceof RestError_1.RestError) {
            res.status(err.statusCode).send({ error: err.error });
            return;
        }
        log.error("Unexpected error:", err.stack);
        res.status(500).send({
            message: "Unexpected error: " + err.message,
            stack: err.stack
        });
    });
    return app;
}
exports.createExpressApp = createExpressApp;
//# sourceMappingURL=index.js.map