"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptions = void 0;
const AccountData_1 = require("./AccountData");
const RestError_1 = require("./RestError");
const utils_1 = require("./utils");
const customers_1 = require("./customers");
const plans_1 = require("./plans");
const prices_1 = require("./prices");
const verify_1 = require("./verify");
const taxRates_1 = require("./taxRates");
const accounts_1 = require("./accounts");
const log = require("loglevel");
var subscriptions;
(function (subscriptions) {
    const accountSubscriptions = new AccountData_1.AccountData();
    const accountSubscriptionItems = new AccountData_1.AccountData();
    function create(accountId, params) {
        var _a, _b, _c, _d;
        log.debug("subscriptions.create", accountId, params);
        let default_source;
        const paramsDefaultSource = params.default_source;
        if (paramsDefaultSource && typeof paramsDefaultSource !== "string") {
            const customer = params.customer;
            const card = customers_1.customers.createCard(accountId, customer, {
                source: paramsDefaultSource
            });
            default_source = card.id;
        }
        else if (typeof paramsDefaultSource === "string") {
            default_source = paramsDefaultSource;
        }
        const subscriptionId = params.id || `sub_${utils_1.generateId(14)}`;
        if (accountSubscriptions.contains(accountId, subscriptionId)) {
            throw new RestError_1.RestError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: "Subscription already exists.",
                type: "invalid_request_error"
            });
        }
        const now = Math.floor((Date.now() / 1000));
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const subscription = {
            id: subscriptionId,
            object: "subscription",
            application_fee_percent: +params.application_fee_percent || null,
            collection_method: params.collection_method || "charge_automatically",
            billing_cycle_anchor: +params.billing_cycle_anchor || now,
            billing_thresholds: params.billing_thresholds ? {
                amount_gte: (_a = params.billing_thresholds.amount_gte) !== null && _a !== void 0 ? _a : null,
                reset_billing_cycle_anchor: (_b = params.billing_thresholds.reset_billing_cycle_anchor) !== null && _b !== void 0 ? _b : null
            } : null,
            cancel_at: null,
            cancel_at_period_end: false,
            canceled_at: null,
            created: now,
            current_period_end: Math.floor(nextMonth.getTime() / 1000),
            current_period_start: now,
            customer: params.customer,
            days_until_due: +params.days_until_due || null,
            default_payment_method: null,
            default_source: default_source || null,
            default_tax_rates: (_c = (params.default_tax_rates || null)) === null || _c === void 0 ? void 0 : _c.map(t => taxRates_1.taxRates.retrieve(accountId, t, "default_tax_rate")),
            discount: null,
            ended_at: null,
            items: {
                object: "list",
                data: [],
                has_more: false,
                url: `/v1/subscription_items?subscription=${subscriptionId}`
            },
            latest_invoice: `in_${utils_1.generateId(14)}`,
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            next_pending_invoice_item_invoice: null,
            pause_collection: null,
            pending_invoice_item_interval: null,
            pending_setup_intent: null,
            pending_update: null,
            schedule: null,
            start_date: Math.floor(Date.now() / 1000),
            status: "active",
            transfer_data: params.transfer_data ? {
                amount_percent: (_d = params.transfer_data.amount_percent) !== null && _d !== void 0 ? _d : null,
                destination: accounts_1.accounts.retrieve(accountId, params.transfer_data.destination, "")
            } : null,
            trial_end: null,
            trial_start: null
        };
        if (params.items) {
            for (const item of params.items) {
                subscription.items.data.push(createItem(accountId, item, subscription.id));
            }
        }
        accountSubscriptions.put(accountId, subscription);
        customers_1.customers.addSubscription(accountId, typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id, subscription);
        return subscription;
    }
    subscriptions.create = create;
    function getOrCreatePlan(accountId, planId) {
        var _a;
        try {
            return plans_1.plans.retrieve(accountId, planId, "plan");
        }
        catch (error) {
            if (((_a = error.error) === null || _a === void 0 ? void 0 : _a.code) === "resource_missing") {
                return plans_1.plans.create(accountId, {
                    id: planId,
                    currency: "usd",
                    interval: "month"
                });
            }
            throw error;
        }
    }
    function createItem(accountId, item, subscriptionId) {
        var _a;
        const paramId = item.id;
        const subItemId = paramId || `si_${utils_1.generateId(14)}`;
        const subscriptionItem = {
            object: "subscription_item",
            id: subItemId,
            billing_thresholds: item.billing_thresholds || null,
            created: Math.floor(Date.now() / 1000),
            deleted: undefined,
            metadata: utils_1.stringifyMetadata(item.metadata),
            plan: getOrCreatePlan(accountId, item.plan),
            price: item.price ? prices_1.prices.retrieve(accountId, item.price, "price") : null,
            quantity: +item.quantity || 1,
            subscription: subscriptionId,
            tax_rates: (_a = (item.tax_rates || null)) === null || _a === void 0 ? void 0 : _a.map(r => taxRates_1.taxRates.retrieve(accountId, r, "tax_rate"))
        };
        accountSubscriptionItems.put(accountId, subscriptionItem);
        return subscriptionItem;
    }
    function updateItem(accountId, subscriptionItemId, params) {
        log.debug("subscriptions.updateItem", accountId, subscriptionItemId, params);
        const subscriptionItem = retrieveItem(accountId, subscriptionItemId, "id");
        if (params.quantity) {
            subscriptionItem.quantity = +params.quantity;
        }
        return subscriptionItem;
    }
    subscriptions.updateItem = updateItem;
    function retrieve(accountId, subscriptionId, paramName) {
        log.debug("subscriptions.retrieve", subscriptionId);
        const subscription = accountSubscriptions.get(accountId, subscriptionId);
        if (!subscription) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such subscription: ${subscriptionId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return subscription;
    }
    subscriptions.retrieve = retrieve;
    function retrieveItem(accountId, subscriptionItemId, paramName) {
        log.debug("subscriptions.retrieveItem", subscriptionItemId);
        const subscriptionItem = accountSubscriptionItems.get(accountId, subscriptionItemId);
        if (!subscriptionItem) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such subscription_item: ${subscriptionItemId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return subscriptionItem;
    }
    subscriptions.retrieveItem = retrieveItem;
    function list(accountId, params) {
        log.debug("subscriptions.list", params);
        let data = accountSubscriptions.getAll(accountId);
        if (params.customer) {
            data = data.filter(d => {
                if (typeof d.customer === "string") {
                    return d.customer === params.customer;
                }
                else {
                    return d.customer.id === params.customer;
                }
            });
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => {
            return retrieve(accountId, id, paramName);
        });
    }
    subscriptions.list = list;
    function listItems(accountId, params) {
        log.debug("subscriptionItems.list", params);
        verify_1.verify.requiredParams(params, ["subscription"]);
        const data = accountSubscriptionItems
            .getAll(accountId)
            .filter(d => {
            return d.subscription === params.subscription;
        });
        return utils_1.applyListOptions(data, params, (id, paramName) => {
            return retrieveItem(accountId, id, paramName);
        });
    }
    subscriptions.listItems = listItems;
})(subscriptions = exports.subscriptions || (exports.subscriptions = {}));
//# sourceMappingURL=subscriptions.js.map