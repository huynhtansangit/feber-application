import PermissionsService from "../../services/PermissionsService";
import { Dispatch } from "redux";
import { IUserProfile } from "./types";
import { setCurrentUserInfo } from "./actions";

export const getCurrentUserInfo = () => async (dispatch: Dispatch) => {
    const currentUserInfo: IUserProfile = await new PermissionsService().getCurrentUserInfo();
    dispatch(setCurrentUserInfo(currentUserInfo));
};