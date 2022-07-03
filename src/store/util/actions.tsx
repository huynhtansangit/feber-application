import { IProperty } from "../access-mediator/types";
import { IToastMessage, IConfirmation } from "./types";

export enum Types {
    SHOW_TOAST_MESSAGE = "SHOW_TOAST_MESSAGE",
    CONFIRM = "CONFIRM",
    SHOW_DIALOG = "SHOW_DIALOG",
    UPDATE_FIELD = "UPDATE_FIELD"
};

export const showToastMessage = (type: string, message: string) => {
    return {
        type: Types.SHOW_TOAST_MESSAGE,
        data: {
            type: type,
            message: message
        } as IToastMessage
    };
};

export const confirmDialog = (title: string | boolean, content: string = "", hideCancelButton: boolean = false, closeCallback: any = () => { }, cancelCallback?: any) => {
    return {
        type: Types.CONFIRM,
        data: ((typeof title !== "boolean") ? {
            title: title,
            content: content,
            hideCancelButton: hideCancelButton,
            closeCallback: closeCallback,
            cancelCallback: cancelCallback
        } as IConfirmation : title)
    };
};
export const showDialog = (data: string | boolean) => {
    return {
        type: Types.SHOW_DIALOG,
        data
    };
};