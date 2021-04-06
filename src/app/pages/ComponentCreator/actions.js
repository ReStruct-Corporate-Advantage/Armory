export const UPDATE_FORM_VALUES = "UPDATE_SECTION_DISPLAY_FORM_VALUES"
export const UPDATE_FORM_ERRORS = "UPDATE_SECTION_DISPLAY_FORM_ERRORS"
export const IS_MOBILE = "IS_MOBILE";
export const DISPATCH_CARD_POSITION = "DISPATCH_CARD_POSITION";
export const DISPATCH_LAYOUT = "DISPATCH_LAYOUT";
export const DISPATCH_PREVIOUS_LAYOUT = "DISPATCH_PREVIOUS_LAYOUT";
export const DISPATCH_COMPONENT_CONFIG = "DISPATCH_COMPONENT_CONFIG";

export const dispatchDeviceType = (isMobile) => {
    return {
        type: IS_MOBILE,
        payload: isMobile
    }
}

export const updateFormValues = (formValues) => {
    return {
        type: UPDATE_FORM_VALUES,
        payload: formValues
    }
}

export const updateFormErrors = (formErrors) => {
    return {
        type: UPDATE_FORM_ERRORS,
        payload: formErrors
    }
}

export const dispatchCardPosition = (formErrors) => {
    return {
        type: DISPATCH_CARD_POSITION,
        payload: formErrors
    }
}

export const dispatchLayout = (layout) => {
    return {
        type: DISPATCH_LAYOUT,
        payload: {layout}
    }
}

export const dispatchPreviousLayout = (previousLayout) => {
    return {
        type: DISPATCH_PREVIOUS_LAYOUT,
        payload: {previousLayout}
    }
}

export const dispatchComponentsConfig = componentConfig => {
    return {
        type: DISPATCH_COMPONENT_CONFIG,
        payload: {componentConfig}
    }
}