export const IS_MOBILE = "IS_MOBILE";
export const DISPATCH_MODAL = "DISPATCH_MODAL"
export const SET_LOGGED_IN = "SET_LOGGED_IN"

export const dispatchDeviceType = (isMobile) => {
    return {
        type: IS_MOBILE,
        payload: isMobile
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
