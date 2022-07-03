import { IPermission } from "./types";
import { Types } from "./actions";

const initialState: IPermission = {
    userProfile: undefined
};

export const PermissionReducer = (state: IPermission = initialState, action: any): IPermission => {
    switch (action.type) {
        case Types.GET_CURRENT_USER_INFO: {
            let currentState: IPermission = Object.assign({}, state);
            currentState.userProfile = action.data;
            return currentState;
        }
    }
    return state;
}