"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRates = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const RestError_1 = require("./RestError");
const log = require("loglevel");
var taxRates;
(function (taxRates) {
    const accountTaxRates = new AccountData_1.AccountData();
    function create(accountId, params) {
        log.debug("taxRates.create", accountId, params);
        const taxRateId = `id_${utils_1.generateId(24)}`;
        const taxRate = {
            id: taxRateId,
            object: "tax_rate",
            active: params.active !== "false",
            created: (Date.now() / 1000) | 0,
            description: params.description || null,
            display_name: params.display_name,
            inclusive: params.inclusive !== "false",
            jurisdiction: params.jurisdiction || null,
            livemode: false,
            metadata: utils_1.stringifyMetadata(params.metadata),
            percentage: +params.percentage
        };
        accountTaxRates.put(accountId, taxRate);
        return taxRate;
    }
    taxRates.create = create;
    function retrieve(accountId, taxRateId, paramName) {
        log.debug("taxRates.retrieve", accountId, taxRateId);
        const taxRate = accountTaxRates.get(accountId, taxRateId);
        if (!taxRate) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such tax rate: ${taxRateId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return taxRate;
    }
    taxRates.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("taxRates.list", accountId, params);
        let data = accountTaxRates.getAll(accountId);
        if (params.active !== undefined) {
            data = data.filter(t => t.active === params.active);
        }
        if (params.inclusive !== undefined) {
            data = data.filter(t => t.inclusive === params.inclusive);
        }
        return utils_1.applyListOptions(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    taxRates.list = list;
    function update(accountId, taxRateId, params) {
        log.debug("taxRates.update", accountId, taxRateId, params);
        const taxRate = retrieve(accountId, taxRateId, "id");
        if (params.active !== undefined) {
            taxRate.active = params.active !== "false";
        }
        if (params.description !== undefined) {
            taxRate.description = params.description;
        }
        if (params.display_name !== undefined) {
            taxRate.display_name = params.display_name;
        }
        if (params.jurisdiction !== undefined) {
            taxRate.jurisdiction = params.jurisdiction;
        }
        if (params.metadata !== undefined) {
            taxRate.metadata = utils_1.stringifyMetadata(params.metadata);
        }
        return taxRate;
    }
    taxRates.update = update;
})(taxRates = exports.taxRates || (exports.taxRates = {}));
//# sourceMappingURL=taxRates.js.map