import Helper from "./Helper";

class EVENTS {
    static logout() {
        Helper.removeCookie("auth_session_token");
        window.location.pathname = "/login";
    }

    static genericNavigationClickHandler(item, user) {
        if (item && item.action) {
            if (item.actionArgs) {
                let {navigate, ...rest} = item.actionArgs;
                !navigate && (navigate = item.navigate);
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

    static handleEventDescription(allEventsDescription, reactDependencies) {
        const concreteHandlers = {};
        Object.keys(allEventsDescription).forEach(handlerKey => {
            const description = allEventsDescription[handlerKey];
            switch (handlerKey) {
                case "click":
                case "onclick":
                case "Click":
                case "onClick":
                    concreteHandlers.onClick = () => description.handlerArgs ? EVENTS[description.handler]({...description.handlerArgs, ...reactDependencies}) : EVENTS[description.handler];
                    break;
                case "submitOnClick":
                    concreteHandlers.submitOnClick = () => description.handlerArgs ? EVENTS[description.handler]({...description.handlerArgs, ...reactDependencies}) : EVENTS[description.handler];
                    break;
                default:
                    return;
            }
        })
        return concreteHandlers;
    }

    static signUpPromptHandler (e, inputRef) {
        const inputValue = inputRef && inputRef.current && inputRef.current.value;
        if (!inputValue) {
            inputRef.current.focus();
        }
    }
}

export default EVENTS;