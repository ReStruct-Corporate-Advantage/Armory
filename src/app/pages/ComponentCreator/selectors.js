import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

const getPresentComponentCreator = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.componentCreator.present
    }
)

// const getPastComponentCreator = createSelector(
//     getData,
//     (dataState) => {
//         return dataState.pages.componentCreator.past
//     }
// )

// const getFutureComponentCreator = createSelector(
//     getData,
//     (dataState) => {
//         return dataState.pages.componentCreator.future
//     }
// )


export const getPresentComponentsConfig = createGetSelector(getPresentComponentCreator, "componentConfig")
export const getFormErrors = createGetSelector(getPresentComponentCreator, "formErrors")
export const getFormValues = createGetSelector(getPresentComponentCreator, "formValues")
export const getHistory = createGetSelector(getPresentComponentCreator, "history")
export const getLayout = createGetSelector(getPresentComponentCreator, "layout")
export const getPreviousLayout = createGetSelector(getPresentComponentCreator, "previousLayout")
export const isMobile = createGetSelector(getPresentComponentCreator, "isMobile")
export const getToolActionMeta = createGetSelector(getPresentComponentCreator, "toolActionMeta")