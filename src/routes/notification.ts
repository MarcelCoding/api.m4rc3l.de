import { Router } from "itty-router";
import { status } from "itty-router-extras";
import { LONG_DATE_TIME, requireToken } from "../utils";
import { sendMail } from "../zoho";

export const NOTIFICATION_ROUTER = Router({ base: '/notification' })
    .all('/nistkasten', requireToken, async () => {
        const emails: string[] = JSON.parse(NISTKASTEN_SUBSCRIPTIONS)

        const dateString = LONG_DATE_TIME.format(new Date());
        const subject = 'Bewegung erkannt!';
        const content = `Im Nistkasten wurde eine Bewegung erkannt.\n\nZeitpukt: ${dateString}\nLive-Stream-URL: https://nistkasten.m4rc3l.de`;

        await sendMail('Nistkasten', emails.join(','), subject, 'plaintext', content);
        return status(200, "Successully send notification.");
    });
