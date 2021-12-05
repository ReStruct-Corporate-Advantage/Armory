export const UPDATE_FORM_VALUES = "UPDATE_PAGE_CREATOR_FORM_VALUES"
export const UPDATE_FORM_ERRORS = "UPDATE_PAGE_CREATOR_FORM_ERRORS"
export const DISPATCH_LAYOUT = "DISPATCH_PAGE_CREATOR_LAYOUT";
export const DISPATCH_PREVIOUS_LAYOUT = "DISPATCH_PAGE_CREATOR_PREVIOUS_LAYOUT";
export const DISPATCH_PAGE_CONFIG = "DISPATCH_PAGE_CONFIG";
export const SET_PAGE_CONFIG = "SET_PAGE_CONFIG";
export const DISPATCH_HISTORY = "DISPATCH_PAGE_CREATOR_HISTORY";
export const DISPTACH_TOOL_ACTION_META = "DISPTACH_PAGE_CREATOR_TOOL_ACTION_META";
export const DISPTACH_CLEAR_PROPS_STATE = "DISPTACH_PAGE_CREATOR_CLEAR_PROPS_STATE";
export const DISPTACH_ARMORY = "DISPTACH_PAGE_CREATOR_ARMORY";
export const DISPTACH_SELECTED_COMPONENT = "DISPTACH_PAGE_CREATOR_SELECTED_COMPONENT";


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

export const dispatchPageConfig = pageConfig => {
    return {
        type: DISPATCH_PAGE_CONFIG,
        payload: {pageConfig}
    }
}

export const setPageConfig = pageConfig => {
    return {
        type: SET_PAGE_CONFIG,
        payload: pageConfig
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

export const dispatchSelectedComponent = selectedComponent => {
    return {
        type: DISPTACH_SELECTED_COMPONENT,
        payload: {selectedComponent}
    }
}