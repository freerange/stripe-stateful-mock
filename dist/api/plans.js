"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plans = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const RestError_1 = require("./RestError");
const verify_1 = require("./verify");
const products_1 = require("./products");
const log = require("loglevel");
var plans;
(function (plans) {
    const accountPlans = new AccountData_1.AccountData();
    function create(accountId, params) {
        var _a, _b, _c, _d, _e, _f;
        log.debug("plans.create", accountId, params);
        verify_1.verify.requiredParams(params, ["currency", "interval", "product"]);
        verify_1.verify.requiredValue(params, "billing_scheme", ["per_unit", "tiered", null, undefined]);
        verify_1.verify.requiredValue(params, "interval", ["day", "month", "week", "year"]);
        verify_1.verify.requiredValue(params, "usage_type", ["licensed", "metered", null, undefined]);
        verify_1.verify.currency(params.currency, "currency");
        const planId = params.id || `plan_${utils_1.generateId(14)}`;
        if (accountPlans.contains(accountId, planId)) {
            throw new RestError_1.RestError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: "Plan already exists.",
                type: "invalid_request_error"
            });
        }
        let product;
        if (typeof params.product === "string") {
            product = products_1.products.retrieve(accountId, params.product, "product");
            if (product.type !== "service") {
                throw new RestError_1.RestError(400, {
                    message: `Plans may only be created with products of type \`service\`, but the supplied product (\`${product.id}\`) had type \`${product.type}\`.`,
                    param: "product",
                    type: "invalid_request_error"
                });
            }
        }
        else {
            product = products_1.products.create(accountId, Object.assign(Object.assign({}, params.product), { type: "service" }));
        }
        const billingScheme = (_a = params.billing_scheme) !== null && _a !== void 0 ? _a : "per_unit";
        const usageType = (_b = params.usage_type) !== null && _b !== void 0 ? _b : "licensed";
        const plan = {
            id: planId,
            object: "plan",
            active: Object.prototype.hasOwnProperty.call(params, "active") ? params.active : true,
            aggregate_usage: usageType === "metered" ? params.aggregate_usage || "sum" : null,
            amount: billingScheme === "per_unit" ? +params.amount : null,
            amount_decimal: billingScheme === "per_unit" ? (+params.amount / 100) + "" : null,
            billing_scheme: billingScheme,
            created: (Date.now() / 1000) | 0,
            currency: params.currency,
            interval: params.interval,
            interval_count: params.interval_count || 1,
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            nickname: (_c = params.nickname) !== null && _c !== void 0 ? _c : null,
            product: product.id,
            tiers: billingScheme === "tiered" ? (_d = params.tiers) === null || _d === void 0 ? void 0 : _d.map(tierCreateToTier) : undefined,
            tiers_mode: billingScheme === "tiered" ? params.tiers_mode : null,
            transform_usage: (_e = params.transform_usage) !== null && _e !== void 0 ? _e : null,
            trial_period_days: (_f = params.trial_period_days) !== null && _f !== void 0 ? _f : null,
            usage_type: usageType
        };
        accountPlans.put(accountId, plan);
        return plan;
    }
    plans.create = create;
    /**
     * Coalesce the number amount (which may be passed in as a string) and the
     * string decimal amount into a number value.
     *
     * If this garbage needs to happen in more places refactor it into utils.
     */
    function coalesceToAmount(amount, decimal) {
        if (!isNaN(+amount)) {
            return +amount;
        }
        if (!isNaN(+decimal)) {
            return +decimal;
        }
        return null;
    }
    /**
     * Coalesce the number amount (which may be passed in as a string) and the
     * string decimal amount into a string decimal value.
     *
     * If this garbage needs to happen in more places refactor it into utils.
     */
    function coalesceToDecimal(amount, decimal) {
        if (!isNaN(+amount)) {
            return +amount + "";
        }
        if (decimal) {
            return decimal;
        }
        return null;
    }
    function tierCreateToTier(tier) {
        return {
            flat_amount: coalesceToAmount(tier.flat_amount, tier.flat_amount_decimal),
            flat_amount_decimal: coalesceToDecimal(tier.flat_amount, tier.flat_amount_decimal),
            unit_amount: coalesceToAmount(tier.unit_amount, tier.unit_amount_decimal),
            unit_amount_decimal: coalesceToDecimal(tier.unit_amount, tier.unit_amount_decimal),
            up_to: +tier.up_to || null
        };
    }
    function retrieve(accountId, planId, paramName) {
        log.debug("plans.retrieve", accountId, planId);
        const plan = accountPlans.get(accountId, planId);
        if (!plan) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such plan: ${planId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return plan;
    }
    plans.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("plans.list", accountId, params);
        const data = accountPlans.getAll(accountId);
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    plans.list = list;
})(plans = exports.plans || (exports.plans = {}));
//# sourceMappingURL=plans.js.map