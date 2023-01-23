import Helper from "./Helper";

class EVENTS {
    static logout() {
        Helper.removeCookie("auth_session_token");
        window.location.pathname = "/login";
    }

    static genericNavigationClickHandler(item, user) {
        if (item && item.action) {
            if (item.actionArgs) {
                const {navigate, ...rest} = item.actionArgs;
                const args = Object.values(rest);
                if (item.action === "navigate" && navigate) {
                    const userPathIndex = args.findIndex(item => item.indexOf && item.indexOf(":user") > -1);
                    if (userPathIndex > -1 && user) {
                        args[userPathIndex] = args[userPathIndex].replace(":user", user.username);
                    }
                    navigate(...args);
                } else {
                    typeof item.action === "string" ? EVENTS[item.action](...args) : item.action(...args);
                }
            } else {
                typeof item.action === "string" ? EVENTS[item.action]() : item.action();
            }
        }
    }
}

export default EVENTS;