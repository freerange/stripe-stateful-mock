"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const verify_1 = require("./verify");
const RestError_1 = require("./RestError");
const log = require("loglevel");
var products;
(function (products) {
    const accountProducts = new AccountData_1.AccountData();
    function create(accountId, params) {
        var _a, _b;
        log.debug("products.create", accountId, params);
        verify_1.verify.requiredParams(params, ["name"]);
        if (params.type) {
            verify_1.verify.requiredValue(params, "type", ["service", "good"]);
        }
        const productId = params.id || `prod_${utils_1.generateId()}`;
        if (accountProducts.contains(accountId, productId)) {
            throw new RestError_1.RestError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: `Product already exists.`,
                type: "invalid_request_error"
            });
        }
        const type = (_a = params.type) !== null && _a !== void 0 ? _a : "service";
        const product = {
            id: productId,
            object: "product",
            active: (_b = params.active) !== null && _b !== void 0 ? _b : true,
            attributes: params.attributes || [],
            created: (Date.now() / 1000) | 0,
            caption: type === "good" ? params.caption || null : undefined,
            deactivate_on: type === "good" ? params.deactivate_on || [] : undefined,
            deleted: undefined,
            description: params.description || null,
            images: params.images || [],
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            name: params.name,
            package_dimensions: type === "good" ? params.package_dimensions || null : undefined,
            shippable: type === "good" ? params.shippable || true : undefined,
            statement_descriptor: type === "good" ? undefined : null,
            type: type,
            updated: (Date.now() / 1000) | 0,
            unit_label: params.unit_label || type === "good" ? undefined : null,
            url: type === "good" ? params.url || null : undefined
        };
        accountProducts.put(accountId, product);
        return product;
    }
    products.create = create;
    function retrieve(accountId, productId, paramName) {
        log.debug("products.retrieve", accountId, productId);
        const product = accountProducts.get(accountId, productId);
        if (!product) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such product: ${productId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return product;
    }
    products.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("products.list", accountId, params);
        let data = accountProducts.getAll(accountId);
        if (params.active !== undefined) {
            data = data.filter(d => d.active === params.active);
        }
        if (params.ids) {
            data = data.filter(d => params.ids.indexOf(d.id) !== -1);
        }
        if (params.shippable !== undefined) {
            data = data.filter(d => d.shippable === params.shippable);
        }
        if (params.url) {
            data = data.filter(d => d.url === params.url);
        }
        if (params.type) {
            data = data.filter(d => d.type === params.type);
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    products.list = list;
})(products = exports.products || (exports.products = {}));
//# sourceMappingURL=products.js.map