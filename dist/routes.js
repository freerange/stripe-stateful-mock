"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.getRequestAccountId = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./api/auth");
const accounts_1 = require("./api/accounts");
const charges_1 = require("./api/charges");
const customers_1 = require("./api/customers");
const disputes_1 = require("./api/disputes");
const plans_1 = require("./api/plans");
const prices_1 = require("./api/prices");
const products_1 = require("./api/products");
const refunds_1 = require("./api/refunds");
const subscriptions_1 = require("./api/subscriptions");
const taxRates_1 = require("./api/taxRates");
const tokens_1 = require("./api/tokens");
const utils_1 = require("./api/utils");
const routes = express_1.default.Router();
exports.routes = routes;
routes.get("/", (req, res) => {
    return res.status(200).json({
        message: "Hello world",
    });
});
routes.post("/v1/accounts", (req, res) => {
    const account = accounts_1.accounts.create(getRequestAccountId(req), req.body);
    return res.status(200).json(account);
});
routes.get("/v1/accounts", (req, res) => {
    const accountList = accounts_1.accounts.list(getRequestAccountId(req), req.query);
    return res.status(200).json(accountList);
});
routes.get("/v1/accounts/:id", (req, res) => {
    // Verify that we have access to the connected account.
    accounts_1.accounts.retrieve("acct_default", req.params.id, auth_1.auth.getCensoredAccessTokenFromRequest(req));
    const account = accounts_1.accounts.retrieve(getRequestAccountId(req), req.params.id, auth_1.auth.getCensoredAccessTokenFromRequest(req));
    return res.status(200).json(account);
});
routes.delete("/v1/accounts/:id", (req, res) => {
    // Verify that we have access to the connected account.
    accounts_1.accounts.retrieve("acct_default", req.params.id, auth_1.auth.getCensoredAccessTokenFromRequest(req));
    const account = accounts_1.accounts.del(getRequestAccountId(req), req.params.id, auth_1.auth.getCensoredAccessTokenFromRequest(req));
    return res.status(200).json(account);
});
routes.get("/v1/charges", (req, res) => {
    const chargeList = charges_1.charges.list(getRequestAccountId(req), req.query);
    return res.status(200).json(chargeList);
});
routes.post("/v1/charges", (req, res) => {
    const charge = charges_1.charges.create(getRequestAccountId(req), req.body);
    return res.status(200).json(charge);
});
routes.get("/v1/charges/:id", (req, res) => {
    const charge = charges_1.charges.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(charge);
});
routes.post("/v1/charges/:id", (req, res) => {
    const charge = charges_1.charges.update(getRequestAccountId(req), req.params.id, req.body);
    return res.status(200).json(charge);
});
routes.post("/v1/charges/:id/capture", (req, res) => {
    const charge = charges_1.charges.capture(getRequestAccountId(req), req.params.id, req.body);
    return res.status(200).json(charge);
});
// Old API.
routes.get("/v1/charges/:id/refunds", (req, res) => {
    const refundList = refunds_1.refunds.list(getRequestAccountId(req), Object.assign(Object.assign({}, req.query), { charge: req.params.id }));
    return res.status(200).json(refundList);
});
routes.post("/v1/customers", (req, res) => {
    const customer = customers_1.customers.create(getRequestAccountId(req), req.body);
    const expandedCustomer = utils_1.expandObject(customer, ["sources", "subscriptions"], req.body.expand);
    return res.status(200).json(expandedCustomer);
});
routes.get("/v1/customers", (req, res) => {
    const customerList = customers_1.customers.list(getRequestAccountId(req), req.query);
    const expandedCustomerList = utils_1.expandList(customerList, ["sources", "subscriptions"], req.query.expand);
    return res.status(200).json(expandedCustomerList);
});
routes.get("/v1/customers/:id", (req, res) => {
    const customer = customers_1.customers.retrieve(getRequestAccountId(req), req.params.id, "id");
    const expandedCustomer = utils_1.expandObject(customer, ["sources", "subscriptions"], req.query.expand);
    return res.status(200).json(expandedCustomer);
});
routes.post("/v1/customers/:id", (req, res) => {
    const customer = customers_1.customers.update(getRequestAccountId(req), req.params.id, req.body);
    const expandedCustomer = utils_1.expandObject(customer, ["sources", "subscriptions"], req.body.expand);
    return res.status(200).json(expandedCustomer);
});
// Old API.
routes.get("/v1/customers/:customerId/cards/:cardId", (req, res) => {
    const card = customers_1.customers.retrieveCard(getRequestAccountId(req), req.params.customerId, req.params.cardId, "card");
    return res.status(200).json(card);
});
// New API.
routes.get("/v1/customers/:customerId/sources/:cardId", (req, res) => {
    const card = customers_1.customers.retrieveCard(getRequestAccountId(req), req.params.customerId, req.params.cardId, "card");
    return res.status(200).json(card);
});
routes.delete("/v1/customers/:customerId/sources/:cardId", (req, res) => {
    const customer = customers_1.customers.deleteCard(getRequestAccountId(req), req.params.customerId, req.params.cardId);
    return res.status(200).json(customer);
});
routes.post("/v1/customers/:customerId/sources", (req, res) => {
    const card = customers_1.customers.createCard(getRequestAccountId(req), req.params.customerId, req.body);
    return res.status(200).json(card);
});
routes.get("/v1/disputes/:id", (req, res) => {
    const dispute = disputes_1.disputes.retrieve(getRequestAccountId(req), req.params.id, "dispute");
    return res.status(200).json(dispute);
});
routes.post("/v1/plans", (req, res) => {
    const plan = plans_1.plans.create(getRequestAccountId(req), req.body);
    const planExpanded = utils_1.expandObject(plan, ["tiers"], req.body.expand);
    return res.status(200).json(planExpanded);
});
routes.get("/v1/plans", (req, res) => {
    const planList = plans_1.plans.list(getRequestAccountId(req), req.query);
    const planListExpanded = utils_1.expandList(planList, ["tiers"], req.query.expand);
    return res.status(200).json(planListExpanded);
});
routes.get("/v1/plans/:id", (req, res) => {
    const plan = plans_1.plans.retrieve(getRequestAccountId(req), req.params.id, "id");
    const planExpanded = utils_1.expandObject(plan, ["tiers"], req.query.expand);
    return res.status(200).json(planExpanded);
});
routes.post("/v1/prices", (req, res) => {
    const price = prices_1.prices.create(getRequestAccountId(req), req.body);
    return res.status(200).json(price);
});
routes.get("/v1/prices", (req, res) => {
    const priceList = prices_1.prices.list(getRequestAccountId(req), req.query);
    return res.status(200).json(priceList);
});
routes.get("/v1/prices/:id", (req, res) => {
    const price = prices_1.prices.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(price);
});
routes.post("/v1/prices/:id", (req, res) => {
    const price = prices_1.prices.update(getRequestAccountId(req), req.params.id, req.body);
    return res.status(200).json(price);
});
routes.post("/v1/products", (req, res) => {
    const product = products_1.products.create(getRequestAccountId(req), req.body);
    return res.status(200).json(product);
});
routes.get("/v1/products", (req, res) => {
    const productList = products_1.products.list(getRequestAccountId(req), req.query);
    return res.status(200).json(productList);
});
routes.get("/v1/products/:id", (req, res) => {
    const product = products_1.products.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(product);
});
routes.post("/v1/refunds", (req, res) => {
    const refund = refunds_1.refunds.create(getRequestAccountId(req), req.body);
    return res.status(200).json(refund);
});
routes.get("/v1/refunds", (req, res) => {
    const refundList = refunds_1.refunds.list(getRequestAccountId(req), req.query);
    return res.status(200).json(refundList);
});
routes.get("/v1/refunds/:id", (req, res) => {
    const refund = refunds_1.refunds.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(refund);
});
routes.post("/v1/subscriptions", (req, res) => {
    const subscription = subscriptions_1.subscriptions.create(getRequestAccountId(req), req.body);
    return res.status(200).json(subscription);
});
routes.get("/v1/subscriptions", (req, res) => {
    const subscriptionList = subscriptions_1.subscriptions.list(getRequestAccountId(req), req.query);
    return res.status(200).json(subscriptionList);
});
routes.get("/v1/subscriptions/:id", (req, res) => {
    const subscription = subscriptions_1.subscriptions.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(subscription);
});
// TODO: routes.post("/v1/subscriptions/:id")
routes.get("/v1/subscription_items", (req, res) => {
    const subscriptionItemList = subscriptions_1.subscriptions.listItems(getRequestAccountId(req), req.query);
    return res.status(200).json(subscriptionItemList);
});
routes.get("/v1/subscription_items/:id", (req, res) => {
    const subscriptionItem = subscriptions_1.subscriptions.retrieveItem(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(subscriptionItem);
});
routes.post("/v1/subscription_items/:id", (req, res) => {
    const subscriptionItem = subscriptions_1.subscriptions.updateItem(getRequestAccountId(req), req.params.id, req.body);
    return res.status(200).json(subscriptionItem);
});
routes.post("/v1/tax_rates", (req, res) => {
    const taxRate = taxRates_1.taxRates.create(getRequestAccountId(req), req.body);
    return res.status(200).json(taxRate);
});
routes.get("/v1/tax_rates", (req, res) => {
    const taxRate = taxRates_1.taxRates.list(getRequestAccountId(req), req.query);
    return res.status(200).json(taxRate);
});
routes.get("/v1/tax_rates/:id", (req, res) => {
    const taxRate = taxRates_1.taxRates.retrieve(getRequestAccountId(req), req.params.id, "id");
    return res.status(200).json(taxRate);
});
routes.post("/v1/tax_rates/:id", (req, res) => {
    const taxRate = taxRates_1.taxRates.update(getRequestAccountId(req), req.params.id, req.body);
    return res.status(200).json(taxRate);
});
routes.post("/v1/tokens", (req, res) => {
    const token = tokens_1.tokens.create(req.body);
    return res.status(200).json(token);
});
routes.get("/v1/tokens/:id", (req, res) => {
    const token = tokens_1.tokens.retrieve(req.params.id);
    return res.status(200).json(token);
});
routes.all("*", (req, res) => {
    return res.status(404).json({
        error: {
            type: "invalid_request_error",
            message: `No matching path: ${req.path}`
        }
    });
});
function getRequestAccountId(req) {
    const connectAccountId = req.header("stripe-account");
    if (connectAccountId) {
        accounts_1.accounts.retrieve("acct_default", connectAccountId, auth_1.auth.getCensoredAccessTokenFromRequest(req));
        return connectAccountId;
    }
    return "acct_default";
}
exports.getRequestAccountId = getRequestAccountId;
//# sourceMappingURL=routes.js.map