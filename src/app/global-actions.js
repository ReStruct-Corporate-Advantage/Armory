export const IS_MOBILE = "IS_MOBILE";
export const DISPATCH_CONTENT = "DISPATCH_CONTENT"
export const DISPATCH_LEVELS = "DISPATCH_LEVELS"
export const DISPATCH_MODAL = "DISPATCH_MODAL"
export const SET_LOGGED_IN = "SET_LOGGED_IN"
export const DISPATCH_USER_DETAILS = "DISPATCH_USER_DETAILS"

export const dispatchDeviceType = (isMobile) => {
    return {
        type: IS_MOBILE,
        payload: isMobile
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

export const dispatchModal = (modal) => {
    return {
        type: DISPATCH_MODAL,
        payload: {modal}
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
