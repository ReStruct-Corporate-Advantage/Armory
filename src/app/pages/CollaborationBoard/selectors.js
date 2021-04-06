import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getCollaborationBoard = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.collaborationBoard
    }
)

export const getFormErrors = createGetSelector(getCollaborationBoard, "formErrors")
export const getFormValues = createGetSelector(getCollaborationBoard, "formValues")