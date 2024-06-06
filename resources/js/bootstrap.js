/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: "pk_ed0524246ed8",
    wsHost: "ws-bitaldata.cloudsjbdevsoft.com",
    wsPort: 80,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
    cluster: "mt1",
    disabledStats: true,
    transports: ["websocket"],
    disableStats: true,
});

window.Echo.connector.pusher.connection.bind("connected", () => {
    console.log(
        "%c 🟢 Connected to WebSockets",
        "color: green; font-weight: bold; font-size: 14px;"
    );
});

window.Echo.connector.pusher.connection.bind("disconnected", () => {
    console.log(
        "%c 🔴 Disconnected from WebSockets",
        "color: red; font-weight: bold; font-size: 14px;"
    );
});

window.Echo.connector.pusher.connection.bind("error", (error) => {
    console.log(
        "%c 🟡 Error with WebSockets",
        "color: yellow; font-weight: bold; font-size: 14px;"
    );
});
