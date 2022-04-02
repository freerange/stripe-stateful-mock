"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accounts = void 0;
const utils_1 = require("./utils");
const RestError_1 = require("./RestError");
const verify_1 = require("./verify");
const log = require("loglevel");
var accounts;
(function (accounts_1) {
    const accounts = {};
    function create(accountId, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        log.debug("accounts.create", accountId, params);
        if (accountId !== "acct_default") {
            throw new RestError_1.RestError(400, {
                message: "You can only create new accounts if you've signed up for Connect, which you can learn how to do at https://stripe.com/docs/connect.",
                type: "invalid_request_error"
            });
        }
        verify_1.verify.requiredParams(params, ["type"]);
        const connectedAccountId = params.id || `acct_${utils_1.generateId(16)}`;
        const account = {
            id: connectedAccountId,
            object: "account",
            business_profile: {
                mcc: ((_a = params.business_profile) === null || _a === void 0 ? void 0 : _a.mcc) || null,
                name: ((_b = params.business_profile) === null || _b === void 0 ? void 0 : _b.name) || "Stripe.com",
                product_description: ((_c = params.business_profile) === null || _c === void 0 ? void 0 : _c.product_description) || null,
                support_address: null,
                support_email: ((_d = params.business_profile) === null || _d === void 0 ? void 0 : _d.support_email) || null,
                support_phone: ((_e = params.business_profile) === null || _e === void 0 ? void 0 : _e.support_phone) || null,
                support_url: ((_f = params.business_profile) === null || _f === void 0 ? void 0 : _f.support_url) || null,
                url: ((_g = params.business_profile) === null || _g === void 0 ? void 0 : _g.url) || null
            },
            business_type: params.business_type || null,
            capabilities: {},
            charges_enabled: false,
            country: params.country || "US",
            created: (Date.now() / 1000) | 0,
            default_currency: params.default_currency || "usd",
            details_submitted: false,
            email: params.email || "site@stripe.com",
            external_accounts: {
                object: "list",
                data: [],
                has_more: false,
                url: `/v1/accounts/${connectedAccountId}/external_accounts`
            },
            metadata: utils_1.stringifyMetadata(params.metadata),
            payouts_enabled: false,
            requirements: {
                current_deadline: null,
                currently_due: [
                    "business_type",
                    "business_url",
                    "company.address.city",
                    "company.address.line1",
                    "company.address.postal_code",
                    "company.address.state",
                    "person_8UayFKIMRJklog.dob.day",
                    "person_8UayFKIMRJklog.dob.month",
                    "person_8UayFKIMRJklog.dob.year",
                    "person_8UayFKIMRJklog.first_name",
                    "person_8UayFKIMRJklog.last_name",
                    "product_description",
                    "support_phone",
                    "tos_acceptance.date",
                    "tos_acceptance.ip"
                ],
                disabled_reason: "requirements.past_due",
                errors: [],
                eventually_due: [
                    "business_url",
                    "product_description",
                    "support_phone",
                    "tos_acceptance.date",
                    "tos_acceptance.ip"
                ],
                past_due: [],
                pending_verification: []
            },
            settings: {
                branding: {
                    icon: ((_j = (_h = params === null || params === void 0 ? void 0 : params.settings) === null || _h === void 0 ? void 0 : _h.branding) === null || _j === void 0 ? void 0 : _j.icon) || null,
                    logo: ((_l = (_k = params === null || params === void 0 ? void 0 : params.settings) === null || _k === void 0 ? void 0 : _k.branding) === null || _l === void 0 ? void 0 : _l.logo) || null,
                    primary_color: ((_o = (_m = params === null || params === void 0 ? void 0 : params.settings) === null || _m === void 0 ? void 0 : _m.branding) === null || _o === void 0 ? void 0 : _o.primary_color) || null,
                    secondary_color: ((_q = (_p = params === null || params === void 0 ? void 0 : params.settings) === null || _p === void 0 ? void 0 : _p.branding) === null || _q === void 0 ? void 0 : _q.secondary_color) || null,
                },
                card_payments: {
                    decline_on: {
                        avs_failure: true,
                        cvc_failure: false
                    },
                    statement_descriptor_prefix: null
                },
                dashboard: {
                    display_name: "Stripe.com",
                    timezone: "US/Pacific"
                },
                payments: {
                    statement_descriptor: "",
                    statement_descriptor_kana: null,
                    statement_descriptor_kanji: null
                },
                payouts: {
                    debit_negative_balances: true,
                    schedule: {
                        delay_days: 7,
                        interval: "daily"
                    },
                    statement_descriptor: null
                }
            },
            tos_acceptance: {
                date: ((_r = params.tos_acceptance) === null || _r === void 0 ? void 0 : _r.date) || null,
                ip: ((_s = params.tos_acceptance) === null || _s === void 0 ? void 0 : _s.ip) || null,
                user_agent: ((_t = params.tos_acceptance) === null || _t === void 0 ? void 0 : _t.user_agent) || null
            },
            type: params.type
        };
        accounts[connectedAccountId] = account;
        if (params.type === "standard") {
            // Can't create standard accounts in the real API but this is a useful thing for
            // a mock server to do.  Standard accounts are missing these properties.
            delete account.company;
            delete account.created;
            delete account.external_accounts;
            delete account.individual;
            delete account.requirements;
            delete account.tos_acceptance;
        }
        if (params.type === "express") {
            // Can't create express accounts in the real API but this is a useful thing for
            // a mock server to do.  Express accounts are missing these properties.
            delete account.company;
            delete account.individual;
            delete account.tos_acceptance;
        }
        return account;
    }
    accounts_1.create = create;
    function retrieve(accountId, connectedAccountId, censoredAccessToken) {
        log.debug("accounts.retrieve", accountId, connectedAccountId);
        if (accountId !== "acct_default" && accountId !== connectedAccountId) {
            throw new RestError_1.RestError(400, {
                message: "The account specified in the path of /v1/accounts/:account does not match the account specified in the Stripe-Account header.",
                type: "invalid_request_error"
            });
        }
        if (!accounts[connectedAccountId]) {
            throw new RestError_1.RestError(403, {
                code: "account_invalid",
                doc_url: "https://stripe.com/docs/error-codes/account-invalid",
                message: `The provided key '${censoredAccessToken}' does not have access to account '${connectedAccountId}' (or that account does not exist). Application access may have been revoked.`,
                type: "invalid_request_error"
            });
        }
        return accounts[connectedAccountId];
    }
    accounts_1.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("accounts.list", accountId, params);
        const data = Object.values(accounts);
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    accounts_1.list = list;
    function del(accountId, connectedAccountId, censoredAccessToken) {
        log.debug("accounts.delete", accountId, connectedAccountId);
        if (!accounts[connectedAccountId]) {
            throw new RestError_1.RestError(403, {
                code: "account_invalid",
                doc_url: "https://stripe.com/docs/error-codes/account-invalid",
                message: `The provided key '${censoredAccessToken}' does not have access to account '${connectedAccountId}' (or that account does not exist). Application access may have been revoked.`,
                type: "invalid_request_error"
            });
        }
        delete accounts[connectedAccountId];
        return {
            id: connectedAccountId,
            object: "account",
            "deleted": true
        };
    }
    accounts_1.del = del;
})(accounts = exports.accounts || (exports.accounts = {}));
//# sourceMappingURL=accounts.js.map