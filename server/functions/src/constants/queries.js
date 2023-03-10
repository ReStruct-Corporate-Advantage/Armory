import CONSTANTS from "./constants";

export const GET_FOR_CURRENT_USER_AND_PUBLIC_REPO = user => ({"meta.createdBy": {$in: [CONSTANTS.ALPHA, user]}});
export const GET_FOR_CURRENT_USER = user => ({"meta.createdBy": user});
export const GET_USER_CONTROLS = {name: "myControls"};