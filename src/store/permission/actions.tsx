import { IUserProfile } from "./types";

export enum Types {
    GET_CURRENT_USER_INFO = "GET_CURRENT_USER_INFO"
}

export const setCurrentUserInfo = (currentUserInfo: IUserProfile) => {
    return {
        type: Types.GET_CURRENT_USER_INFO,
        data: currentUserInfo
    };
};