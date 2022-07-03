export const ToastMessageCode = {
    SUCCESS: "success",
    ERROR: "error",
    WARN: "warn",
    INFO: "info"
};

export interface IUtil {
    toast: IToastMessage,
    confirm: IConfirmation,
    dialogMessage: string
};

export interface IToastMessage {
    type: string,
    message: string;
}

export interface IConfirmation {
    title: string;
    content: string;
    hideCancelButton: boolean;
    closeCallback?: any;
    cancelCallback?: any;
}