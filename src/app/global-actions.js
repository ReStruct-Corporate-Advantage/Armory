export const IS_MOBILE = "IS_MOBILE";
export const DISPATCH_HIDE_QUICKOPTIONS = "DISPATCH_HIDE_QUICKOPTIONS";
export const DISPATCH_CONTENT = "DISPATCH_CONTENT";
export const DISPATCH_LEVELS = "DISPATCH_LEVELS";
export const DISPATCH_LOGS = "DISPATCH_LOGS";
export const DISPATCH_MODAL = "DISPATCH_MODAL";
export const DISPATCH_NOTIFICATION = "DISPATCH_NOTIFICATION";
export const DISPATCH_TOOLTIP = "DISPATCH_TOOLTIP";
export const DISPATCH_TOGGLES = "DISPATCH_TOGGLES";
export const DISPATCH_USER_DETAILS = "DISPATCH_USER_DETAILS";
export const DISPATCH_ZOOM = "DISPATCH_ZOOM";
export const SET_LOGGED_IN = "SET_LOGGED_IN";
export const TOGGLE_LOADER = "TOGGLE_LOADER";

export const dispatchDeviceType = (isMobile) => {
    return {
        type: IS_MOBILE,
        payload: isMobile
    }
}

export const dispatchHideQuickOptions = (hideQuickOptions) => {
    return {
        type: DISPATCH_HIDE_QUICKOPTIONS,
        payload: {hideQuickOptions}
    }
}

export const dispatchContent = content => {
    return {
        type: DISPATCH_CONTENT,
        payload: {content}
    }
}

export const dispatchLevels = (levels) => {
    return {
        type: DISPATCH_MODAL,
        payload: {levels}
    }
}

export const dispatchLogs = (logs) => {
    return {
        type: DISPATCH_LOGS,
        payload: {logs}
    }
}

export const dispatchModal = (modal) => {
    return {
        type: DISPATCH_MODAL,
        payload: {modal}
    }
}

export const dispatchNotification = (notification) => {
    return {
        type: DISPATCH_NOTIFICATION,
        payload: {notification}
    }
}

export const dispatchTooltip = (tooltip) => {
    return {
        type: DISPATCH_TOOLTIP,
        payload: {tooltip}
    }
}

export const dispatchToggles = (toggles) => {
    return {
        type: DISPATCH_TOGGLES,
        payload: {toggles}
    }
}

export const setLoggedIn = (isLoggedIn) => {
    return {
        type: SET_LOGGED_IN,
        payload: {isLoggedIn}
    }
}

export const dispatchUserDetails = (userDetails) => {
    return {
        type: DISPATCH_USER_DETAILS,
        payload: {userDetails}
    }
}

export const dispatchZoom = (zoom) => {
    return {
        type: DISPATCH_ZOOM,
        payload: {zoom}
    }
}

export const toggleLoader = loaderState => {
    return {
        type: TOGGLE_LOADER,
        payload: {loaderState}
    }
}