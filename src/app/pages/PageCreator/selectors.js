import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getPresentPageCreator = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.pageCreator.present
    }
)

export const getFormErrors = createGetSelector(getPresentPageCreator, "formErrors")
export const getFormValues = createGetSelector(getPresentPageCreator, "formValues")
export const getPresentPageConfig = createGetSelector(getPresentPageCreator, "pageConfig")
export const getArmory = createGetSelector(getPresentPageCreator, "armory")
export const getHistory = createGetSelector(getPresentPageCreator, "history")
export const getLayout = createGetSelector(getPresentPageCreator, "layout")
export const getPreviousLayout = createGetSelector(getPresentPageCreator, "previousLayout")
export const isMobile = createGetSelector(getPresentPageCreator, "isMobile")
export const getToolActionMeta = createGetSelector(getPresentPageCreator, "toolActionMeta")
export const getClearPropsState = createGetSelector(getPresentPageCreator, "clear")
export const getSelectedComponent = createGetSelector(getPresentPageCreator, "selectedComponent")