import { Router } from "itty-router";
import { error, status } from "itty-router-extras";
import { redirect, requireToken } from "../utils";
import { ZOHO_SCOPES, ZOHO_CALBACK_URL, reviceCode, getAccessToken } from "../zoho";

export const ZOHO_ROUTER = Router({ base: '/zoho' })
    .get('/oauth', requireToken, () => {
        const query = new URLSearchParams();
        query.append("client_id", ZOHO_CLIENT_ID);
        query.append("response_type", "code");
        query.append("redirect_uri", ZOHO_CALBACK_URL);
        query.append("scope", ZOHO_SCOPES);
        query.append("access_type", "offline");

        return redirect(`https://accounts.zoho.eu/oauth/v2/auth?${query.toString()}`);
    })
    .get('/callback', requireToken, async request => {
        const code = request.query?.code;

        if (!code) {
            return error(400, "Missing query parameter \"code\".");
        }

        await reviceCode(code);
        return status(200, "Successfully updated access & refresh token.");
    })
    .get('/accounts', requireToken, async () => {
        const response = await fetch(`https://mail.zoho.eu/api/accounts`, {
            headers: { 'Authorization': `Zoho-oauthtoken ${await getAccessToken()}` }
        })

        return response;
    });
