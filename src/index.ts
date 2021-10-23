import { Router } from "itty-router";
import { NOTIFICATION_ROUTER } from "./routes/notification";
import { ZOHO_ROUTER } from "./routes/zoho";
import { missing, error } from 'itty-router-extras';
import { initSentry } from "./sentry";

const router = Router()
    .all("/notification/*", NOTIFICATION_ROUTER.handle)
    .all("/zoho/*", ZOHO_ROUTER.handle)
    .all("*", () => missing("The requested endpoint can not be found."));

addEventListener("fetch", (event) => {
    const response = router.handle(event.request)
        .catch((err: unknown) => {
            initSentry(event).captureException(err);
            return error(500)
        });

    event.respondWith(response);
});
