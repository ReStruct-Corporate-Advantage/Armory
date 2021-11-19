import Immutable from "immutable";
import {createSelector} from "reselect";
import {createGetSelector} from "reselect-immutable-helpers";

const getData = ({data}) => data;

export const getGlobal = createSelector(
    getData,
    (dataState) => {
        return dataState.global
    }
);

export const getContent = createSelector(
    getData,
    data => {
        return Immutable.Map(data.global.get("content"))
    }
);

export const isLoggedIn = createGetSelector(getGlobal, "isLoggedIn");
export const getUserDetails = createGetSelector(getGlobal, "userDetails");
export const getUserRole = createGetSelector(getGlobal, "userRole");
export const isMobile = createGetSelector(getGlobal, "isMobile");
export const getIcons = createGetSelector(getContent, "icons");
export const getModal = createGetSelector(getGlobal, "modal");
export const getLevels = createGetSelector(getGlobal, "levels");