import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getGlobal = createSelector(
    getData,
    (dataState) => {
        return dataState.global
    }
)

export const isLoggedIn = createGetSelector(getGlobal, "isLoggedIn");
export const getUserDetails = createGetSelector(getGlobal, "userDetails");
export const getUserRole = createGetSelector(getGlobal, "userRole");
export const isMobile = createGetSelector(getGlobal, "isMobile");
export const getModal = createGetSelector(getGlobal, "modal");
export const getLevels = createGetSelector(getGlobal, "levels");