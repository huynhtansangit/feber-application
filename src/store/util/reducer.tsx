import { Types } from "./actions";
import { IUtil } from "./types";
import { IToastMessage, IConfirmation } from "./types";

const intialState: IUtil = {
    toast: { type: "", message: "" },
    confirm: { title: "", content: "", hideCancelButton: false, closeCallback: null },
    dialogMessage: ""
};

export const UtilReducer = (state: IUtil = intialState, action: { type: string, data: IToastMessage | IConfirmation | string | boolean }): IUtil => {
    switch (action.type) {
        case Types.SHOW_TOAST_MESSAGE: {
            let resultState: IUtil = Object.assign({}, state);
            if (action.data === false) {
                resultState.toast = intialState.toast;
            }
            else {
                resultState.toast = action.data as IToastMessage;
            }
            return resultState;
        }
        case Types.CONFIRM: {
            let resultState: IUtil = Object.assign({}, state);
            if (action.data === false) {
                resultState.confirm = intialState.confirm;
            }
            else {
                resultState.confirm = action.data as IConfirmation;
            }
            return resultState;
        }
        case Types.SHOW_DIALOG: {
            let resultState: IUtil = Object.assign({}, state);
            if (action.data === false) {
                resultState.dialogMessage = intialState.dialogMessage;
            }
            else {
                resultState.dialogMessage = action.data as string;
            }
            return resultState;
        }
    }
    return state;
};

export default UtilReducer;