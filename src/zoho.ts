export const ZOHO_SCOPES = 'ZohoMail.messages.CREATE ZohoMail.accounts.READ';
export const ZOHO_CALBACK_URL = `https://api.m4rc3l.de/zoho/callback`;

export async function reviceCode(code: string): Promise<void> {
    const query = new URLSearchParams();
    query.append('code', code);
    query.append('grant_type', 'authorization_code');
    query.append('client_id', ZOHO_CLIENT_ID);
    query.append('client_secret', ZOHO_CLIENT_SECRET);
    query.append('redirect_uri', ZOHO_CALBACK_URL);
    query.append('scope', ZOHO_SCOPES);

    const response = await fetch(`https://accounts.zoho.eu/oauth/v2/token?${query.toString()}`, { method: 'POST' });
    const data: ZohoTokenResponse = await response.json();

    if (data.error) {
        throw new Error(`[ZOHO]: ${data.error}`);
    }

    await M4RC3L_API.put('zoho_tokens', JSON.stringify({
        refresh: data.refresh_token,
        access: data.access_token,
        expire: Date.now() + data.expires_in * 1000
    }));
}

export async function getAccessToken(): Promise<string> {
    const tokens: ZohoTokens | null = await M4RC3L_API.get('zoho_tokens', "json");

    if (!tokens) {
        throw new Error("Please complete zoho setup!");
    }

    if (Date.now() < tokens.expire) {
        return tokens.access;
    }

    const query = new URLSearchParams();
    query.append('client_id', ZOHO_CLIENT_ID);
    query.append('client_secret', ZOHO_CLIENT_SECRET);
    query.append('grant_type', 'refresh_token');
    query.append('redirect_uri', ZOHO_CALBACK_URL);
    query.append('refresh_token', tokens.refresh);

    const response = await fetch(`https://accounts.zoho.eu/oauth/v2/token?${query.toString()}`, { method: 'POST' });

    if (response.status !== 200) {
        throw new Error(`Unable to request access token: ${response.status} ${response.statusText}`);
    }

    const data: ZohoTokenResponse = await response.json();

    if (data.error) {
        throw new Error(`[ZOHO]: ${data.error}`);
    }

    await M4RC3L_API.put('zoho_tokens', JSON.stringify({
        refresh: tokens.refresh,
        access: data.access_token,
        expire: Date.now() + data.expires_in * 1000
    }));

    return data.access_token;
}

/**
 * https://www.zoho.com/mail/help/api/post-send-an-email.html
 */
export async function sendMail(name: string, to: string, subject: string, type: 'plaintext' | 'html', content: string): Promise<Response> {
    const response = await fetch(`https://mail.zoho.eu/api/accounts/${ZOHO_ACCOUNT_ID}/messages`, {
        method: 'POST',
        body: JSON.stringify({
            fromAddress: `${name} <${ZOHO_FROM}>`,
            toAddress: to,
            subject,
            mailFormat: type,
            content
        }),
        headers: {
            'Authorization': `Zoho-oauthtoken ${await getAccessToken()}`,
            'Content-Type': 'application/json'
        }
    })

    const data = await response.json<ZohoMainResponse>();

    if (!data || data.status.description !== "success") {
        throw new Error(`[ZOHO]: ${response.status} ${data?.status.description}`);
    }

    return response;
}

interface ZohoTokens {
    access: string;
    refresh: string;
    expire: number;
}

interface ZohoTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    error?: string;
}

interface ZohoMainResponse {
    status: {
        description: string;
    }
}
