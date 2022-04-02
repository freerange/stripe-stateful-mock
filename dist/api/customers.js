"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customers = void 0;
const RestError_1 = require("./RestError");
const utils_1 = require("./utils");
const cards_1 = require("./cards");
const AccountData_1 = require("./AccountData");
const verify_1 = require("./verify");
const charges_1 = require("./charges");
const log = require("loglevel");
var customers;
(function (customers) {
    const accountCustomers = new AccountData_1.AccountData();
    function create(accountId, params) {
        log.debug("customers.create", accountId, params);
        if (params.id && accountCustomers.contains(accountId, params.id)) {
            throw new RestError_1.RestError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: "Customer already exists.",
                type: "invalid_request_error"
            });
        }
        const customerId = params.id || `cus_${utils_1.generateId(14)}`;
        const customer = {
            id: customerId,
            object: "customer",
            address: charges_1.charges.getAddressFromParams(params.address),
            balance: +params.balance || 0,
            created: (Date.now() / 1000) | 0,
            currency: null,
            default_source: null,
            delinquent: false,
            description: params.description || null,
            discount: null,
            email: params.email || null,
            invoice_prefix: params.invoice_prefix || utils_1.generateId(7),
            invoice_settings: {
                custom_fields: null,
                default_payment_method: null,
                footer: null
            },
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            name: null,
            next_invoice_sequence: 1,
            phone: null,
            preferred_locales: params.preferred_locales || [],
            shipping: charges_1.charges.getShippingFromParams(params.shipping),
            sources: {
                object: "list",
                data: [],
                has_more: false,
                url: `/v1/customers/${customerId}/sources`
            },
            subscriptions: {
                object: "list",
                data: [],
                has_more: false,
                url: `/v1/customers/${customerId}/subscriptions`
            },
            tax_exempt: params.tax_exempt || "none",
            tax_ids: {
                object: "list",
                data: [],
                has_more: false,
                url: "/v1/customers/cus_FhFu67G2pEu5wW/tax_ids"
            }
        };
        if (params.source) {
            createCard(accountId, customer, { source: params.source });
        }
        if (params.source !== "tok_forget") {
            accountCustomers.put(accountId, customer);
        }
        return utils_1.expandObject(customer, ["sources", "subscriptions"], params.expand);
    }
    customers.create = create;
    function retrieve(accountId, customerId, paramName) {
        log.debug("customers.retrieve", accountId, customerId);
        const customer = accountCustomers.get(accountId, customerId);
        if (!customer) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such customer: ${customerId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return customer;
    }
    customers.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("customers.list", accountId, params);
        let data = accountCustomers.getAll(accountId);
        if (params.email) {
            data = data.filter(d => d.email === params.email);
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    customers.list = list;
    function update(accountId, customerId, params) {
        log.debug("customers.update", accountId, customerId, params);
        const customer = retrieve(accountId, customerId, "id");
        // All validation must happen above any setting or we can end up with partially
        // updated customers.
        if (params.default_source && !customer.sources.data.find(source => source.id === params.default_source)) {
            throw new RestError_1.RestError(400, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such source: ${params.default_source}`,
                param: "source",
                type: "invalid_request_error"
            });
        }
        if (params.address !== undefined) {
            customer.address = charges_1.charges.getAddressFromParams(params.address);
        }
        if (params.default_source !== undefined) {
            customer.default_source = params.default_source;
        }
        if (params.description !== undefined) {
            customer.description = params.description;
        }
        if (params.email !== undefined) {
            customer.email = params.email;
        }
        if (params.invoice_prefix !== undefined) {
            customer.invoice_prefix = params.invoice_prefix;
        }
        if (params.invoice_settings !== undefined) {
            customer.invoice_settings = params.invoice_settings;
        }
        if (params.metadata !== undefined) {
            customer.metadata = utils_1.stringifyMetadata(params.metadata);
        }
        if (params.name !== undefined) {
            customer.name = params.name;
        }
        if (params.phone !== undefined) {
            customer.phone = params.phone;
        }
        if (params.preferred_locales !== undefined) {
            customer.preferred_locales = params.preferred_locales;
        }
        if (params.shipping !== undefined) {
            customer.shipping = charges_1.charges.getShippingFromParams(params.shipping);
        }
        if (params.source !== undefined) {
            createCard(accountId, customer, { source: params.source });
        }
        if (params.tax_exempt !== undefined) {
            customer.tax_exempt = params.tax_exempt || null;
        }
        return utils_1.expandObject(customer, ["sources", "subscriptions"], params.expand);
    }
    customers.update = update;
    function addSubscription(accountId, customerId, subscription) {
        const customer = retrieve(accountId, customerId, "customer");
        customer.subscriptions.data.push(subscription);
        customer.next_invoice_sequence++;
        if (!customer.currency) {
            customer.currency = "usd";
        }
    }
    customers.addSubscription = addSubscription;
    function createCard(accountId, customerOrId, params) {
        log.debug("customers.createCard", accountId, customerOrId, params);
        verify_1.verify.requiredParams(params, ["source"]);
        const customer = typeof customerOrId === "object" ? customerOrId : retrieve(accountId, customerOrId, "customer");
        if (typeof params.source === "string") {
            const card = cards_1.cards.createFromSource(params.source);
            card.customer = customer.id;
            if (!customer.default_source) {
                customer.default_source = card.id;
            }
            customer.sources.data.push(card);
            // Special token handling.
            switch (params.source) {
                case "tok_chargeDeclined":
                    throw new RestError_1.RestError(402, {
                        code: "card_declined",
                        decline_code: "generic_decline",
                        doc_url: "https://stripe.com/docs/error-codes/card-declined",
                        message: "Your card was declined.",
                        param: "",
                        type: "card_error"
                    });
                case "tok_chargeDeclinedInsufficientFunds":
                    throw new RestError_1.RestError(402, {
                        code: "card_declined",
                        decline_code: "insufficient_funds",
                        doc_url: "https://stripe.com/docs/error-codes/card-declined",
                        message: "Your card has insufficient funds.",
                        param: "",
                        type: "card_error"
                    });
                case "tok_chargeDeclinedIncorrectCvc":
                    throw new RestError_1.RestError(402, {
                        code: "incorrect_cvc",
                        doc_url: "https://stripe.com/docs/error-codes/incorrect-cvc",
                        message: "Your card's security code is incorrect.",
                        param: "cvc",
                        type: "card_error"
                    });
                case "tok_chargeDeclinedExpiredCard":
                    throw new RestError_1.RestError(402, {
                        code: "expired_card",
                        doc_url: "https://stripe.com/docs/error-codes/expired-card",
                        message: "Your card has expired.",
                        param: "exp_month",
                        type: "card_error"
                    });
            }
            return card;
        }
        else if (params.source) {
            throw new Error("Card create options on create customer aren't supported.");
        }
    }
    customers.createCard = createCard;
    function retrieveCard(accountId, customerId, cardId, paramName) {
        log.debug("customers.retrieveCard", accountId, customerId, cardId);
        const customer = retrieve(accountId, customerId, "customer");
        const card = customer.sources.data.find(card => card.id === cardId && card.object === "card");
        if (!card) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `Customer ${customerId} does not have card with ID ${cardId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return card;
    }
    customers.retrieveCard = retrieveCard;
    function deleteCard(accountId, customerId, cardId) {
        log.debug("customers.deleteCard", accountId, customerId, cardId);
        const customer = retrieve(accountId, customerId, "customer");
        const card = retrieveCard(accountId, customerId, cardId, "id");
        const cardIx = customer.sources.data.indexOf(card);
        if (cardIx === -1) {
            throw new Error("The world does not make sense.");
        }
        customer.sources.data.splice(cardIx, 1);
        if (customer.default_source === cardId) {
            customer.default_source = customer.sources.data.length ? customer.sources.data[0].id : null;
        }
        // The docs return a full Card object but my tests return this abbreviated thing.  *shrug*
        return {
            id: "card_1FKCxrBCvBiGc7Sdp8LvNQKQ",
            object: "card",
            deleted: true
        };
    }
    customers.deleteCard = deleteCard;
})(customers = exports.customers || (exports.customers = {}));
//# sourceMappingURL=customers.js.map