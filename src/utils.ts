import { error } from "itty-router-extras";

const LOCALE = 'de';
export const LONG_DATE_TIME = new Intl.DateTimeFormat(LOCALE, {
    timeStyle: "short",
    dateStyle: "full",
    timeZone: "Europe/Berlin",
});

export function redirect(url: string): Response {
    return new Response('', {
        status: 302,
        headers: { 'Location': url }
    });
}

export function requireToken(request: Request & { query?: { [key: string]: unknown | undefined } }): Response | undefined {
    const token = request.headers.get('Authorization')?.substring(7) || request.query?.token;

    if (!token || TOKEN !== token) {
        return error(403, 'Please specify a token.');
    }
}