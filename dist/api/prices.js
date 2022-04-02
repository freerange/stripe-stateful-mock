"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prices = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const RestError_1 = require("./RestError");
const verify_1 = require("./verify");
const products_1 = require("./products");
const log = require("loglevel");
var prices;
(function (prices) {
    const accountPrices = new AccountData_1.AccountData();
    function create(accountId, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        log.debug("prices.create", accountId, params);
        verify_1.verify.requiredParams(params, ["currency"]);
        verify_1.verify.currency(params.currency, "currency");
        if (!!params.product === !!params.product_data) {
            throw new RestError_1.RestError(400, {
                message: "You must specify either `product` or `product_data` when creating a price.",
                type: "invalid_request_error"
            });
        }
        const priceId = `price_${utils_1.generateId(24)}`;
        const billingScheme = (_a = params.billing_scheme) !== null && _a !== void 0 ? _a : "per_unit";
        const price = {
            id: priceId,
            object: "price",
            active: (_b = params.active) !== null && _b !== void 0 ? _b : true,
            billing_scheme: billingScheme,
            created: (Date.now() / 1000) | 0,
            currency: params.currency,
            livemode: false,
            lookup_key: (_c = params.lookup_key) !== null && _c !== void 0 ? _c : null,
            metadata: utils_1.stringifyMetadata(params.metadata),
            nickname: (_d = params.nickname) !== null && _d !== void 0 ? _d : null,
            product: params.product ? params.product : products_1.products.create(accountId, params.product_data).id,
            recurring: params.recurring ? {
                aggregate_usage: (_e = params.recurring.aggregate_usage) !== null && _e !== void 0 ? _e : null,
                interval: params.recurring.interval,
                interval_count: (_f = params.recurring.interval_count) !== null && _f !== void 0 ? _f : 1,
                trial_period_days: (_g = params.recurring.trial_period_days) !== null && _g !== void 0 ? _g : null,
                usage_type: (_h = params.recurring.usage_type) !== null && _h !== void 0 ? _h : "licensed"
            } : null,
            tiers_mode: (_j = params.tiers_mode) !== null && _j !== void 0 ? _j : null,
            transform_quantity: (_k = params.transform_quantity) !== null && _k !== void 0 ? _k : null,
            type: params.recurring ? "recurring" : "one_time",
            unit_amount: +((_l = params.unit_amount) !== null && _l !== void 0 ? _l : params.unit_amount_decimal),
            unit_amount_decimal: (_m = params.unit_amount_decimal) !== null && _m !== void 0 ? _m : params.unit_amount + ""
        };
        accountPrices.put(accountId, price);
        return price;
    }
    prices.create = create;
    function retrieve(accountId, priceId, paramName) {
        log.debug("prices.retrieve", accountId, priceId);
        const price = accountPrices.get(accountId, priceId);
        if (!price) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such price: ${priceId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return price;
    }
    prices.retrieve = retrieve;
    function update(accountId, priceId, params) {
        log.debug("prices.updateItem", accountId, priceId, params);
        const price = retrieve(accountId, priceId, "id");
        if (params.active != undefined) {
            price.active = params.active === "true";
        }
        if (params.metadata !== undefined) {
            price.metadata = utils_1.stringifyMetadata(params.metadata);
        }
        if (params.nickname !== undefined) {
            price.nickname = params.nickname;
        }
        return price;
    }
    prices.update = update;
    function list(accountId, params) {
        log.debug("prices.list", accountId, params);
        let data = accountPrices.getAll(accountId);
        if (params.active != undefined) {
            data = data.filter(price => price.active === (params.active === "true"));
        }
        if (params.currency != undefined) {
            data = data.filter(price => price.currency === params.currency);
        }
        if (params.product != undefined) {
            data = data.filter(price => price.product === params.product);
        }
        if (params.type != undefined) {
            data = data.filter(price => price.type === params.type);
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    prices.list = list;
})(prices = exports.prices || (exports.prices = {}));
//# sourceMappingURL=prices.js.map