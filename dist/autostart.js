"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = exports.app = void 0;
const log = require("loglevel");
const _1 = require("./");
// This script starts the server automatically using env vars to control configuration.
log.setDefaultLevel("info");
if (process.env["LOG_LEVEL"]) {
    log.setLevel(process.env["LOG_LEVEL"]);
}
const app = _1.createExpressApp();
exports.app = app;
const port = process.env["PORT"] || 8000;
exports.port = port;
app.listen(+port, () => {
    log.info(`Server started on port ${port}`);
});
//# sourceMappingURL=autostart.js.map