export const UPDATE_FORM_VALUES = "UPDATE_SECTION_DISPLAY_FORM_VALUES"
export const UPDATE_FORM_ERRORS = "UPDATE_SECTION_DISPLAY_FORM_ERRORS"
export const IS_MOBILE = "IS_MOBILE";
export const DISPATCH_CARD_POSITION = "DISPATCH_CARD_POSITION";
export const DISPATCH_LAYOUT = "DISPATCH_LAYOUT";
export const DISPATCH_PREVIOUS_LAYOUT = "DISPATCH_PREVIOUS_LAYOUT";
export const DISPATCH_COMPONENT_CONFIG = "DISPATCH_COMPONENT_CONFIG";
export const SET_COMPONENT_CONFIG = "SET_COMPONENT_CONFIG";
export const DISPATCH_HISTORY = "DISPATCH_HISTORY";
export const DISPTACH_TOOL_ACTION_META = "DISPTACH_TOOL_ACTION_META";
export const DISPTACH_CLEAR_PROPS_STATE = "DISPTACH_CLEAR_PROPS_STATE";
export const DISPTACH_ARMORY = "DISPTACH_ARMORY";

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

export const setComponentsConfig = componentConfig => {
    return {
        type: SET_COMPONENT_CONFIG,
        payload: componentConfig
    }
}

export const dispatchHistory = history => {
    return {
        type: DISPATCH_HISTORY,
        payload: {history}
    }
}

export const dispatchToolAction = toolActionMeta => {
    return {
        type: DISPTACH_TOOL_ACTION_META,
        payload: {toolActionMeta}
    }
}

export const dispatchClearPropsState = clear => {
    return {
        type: DISPTACH_CLEAR_PROPS_STATE,
        payload: {clear}
    }
}

export const dispatchArmory = armory => {
    return {
        type: DISPTACH_ARMORY,
        payload: {armory}
    }
}