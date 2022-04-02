import Stripe from "stripe";
import log = require("loglevel");

export namespace tokens {
    export function create(params: Stripe.TokenCreateParams): Stripe.Token {
        log.debug("tokens.create", params);
        return {
            id: "tok_visa",
            object: "token",
            client_ip: "1.1.1.1",
            created: new Date().valueOf(),
            livemode: false,
            type: "card",
            used: false
        };
    };

    export function retrieve(tokenId: string): Stripe.Token {
        log.debug("tokens.retrieve", tokenId);
        return {
            id: tokenId,
            object: "token",
            client_ip: "1.1.1.1",
            created: new Date().valueOf(),
            livemode: false,
            type: "card",
            used: false
        };
    };
}