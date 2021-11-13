export const UPDATE_FORM_VALUES = "UPDATE_ADMIN_COMPONENT_MANAGER_FORM_VALUES"
export const UPDATE_FORM_ERRORS = "UPDATE_ADMIN_COMPONENT_MANAGER_FORM_ERRORS"
export const DISPTACH_CLEAR_PROPS_STATE = "DISPTACH_CLEAR_PROPS_STATE";
export const DISPATCH_COMPONENT_CONFIG = "DISPATCH_ADMIN_COMPONENT_MANAGER_COMPONENT_CONFIG";
export const SET_COMPONENT_CONFIG = "SET_ADMIN_COMPONENT_MANAGER_COMPONENT_CONFIG";

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

export const dispatchComponentConfig = componentConfig => {
    return {
        type: DISPATCH_COMPONENT_CONFIG,
        payload: {componentConfig}
    }
}

export const setComponentConfig = componentConfig => {
    return {
        type: SET_COMPONENT_CONFIG,
        payload: componentConfig
    }
}

export const dispatchClearPropsState = clear => {
    return {
        type: DISPTACH_CLEAR_PROPS_STATE,
        payload: {clear}
    }
}