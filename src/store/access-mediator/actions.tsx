import { IProperty } from "./types";




export enum Types {
    INIT = "INIT",
    CHANGE_MODE = "CHANGE_MODE",
    SET_DATA = "SET_DATA",
    VALIDATE_DATA = "VALIDATE_DATA",
    UPDATE_PROPERTY = "UPDATE_PROPERTY",
    SET_REPORT_TYPES = "SET_REPORT_TYPES",
    SET_CHANGED_DEPARTMENT = "SET_CHANGED_DEPARTMENT",
    SET_CHANGED_DIVISION_ADMIN = "SET_CHANGED_DIVISION_ADMIN",
    CALLBACK_UPDATE_REPORT = "CALLBACK_UPDATE_REPORT",
    CALLBACK_RESTART_UPLOAD_WORKFLOW = "CALLBACK_RESTART_UPLOAD_WORKFLOW",
    CALLBACK_DELETE_REPORT = "CALLBACK_DELETE_REPORT",
    UPDATE_CHECKBOX = "UPDATE_CHECKBOX",
    IS_FIRST_LOAD = "IS_FIRST_LOAD"
};

export const init = () => {
    return {
        type: Types.INIT
    };
};

export const changeMode = (mode: string) => {
    return {
        type: Types.CHANGE_MODE,
        data: mode
    };
};

export const setData = (result: any, callback: any) => {
    return {
        type: Types.SET_DATA,
        data: {
            result,
            callback
        }
    };
}

export const validateData = (callback: any) => {
    return {
        type: Types.VALIDATE_DATA,
        data: { callback }
    };
}

export const updateProperty = (field: string, value: any) => {
    return {
        type: Types.UPDATE_PROPERTY,
        data: {
            field,
            value
        } as IProperty
    };
}

export const setReportTypes = (data: any[]) => {
    return {
        type: Types.SET_REPORT_TYPES,
        data
    };
}

export const updateChecbox = (field: string, value: any) => {
    return {
        type: Types.UPDATE_CHECKBOX,
        data: {
            field,
            value
        } as IProperty
    };
}

export const updateFirstLoadCheck = (field: string, value: any) => {
    return {
        type: Types.IS_FIRST_LOAD,
        data: {
            field,
            value
        } as IProperty
    };
}

export const setChangedDepartment = (data: any, callback: any) => {
    return {
        type: Types.SET_CHANGED_DEPARTMENT,
        data: {
            result: data,
            callback
        }
    };
}

export const setChangedDivisonAdmin = (data: any, callback: any) => {
    return {
        type: Types.SET_CHANGED_DIVISION_ADMIN,
        data: {
            result: data,
            callback
        }
    };
}

export const callbackUpdateReport = (data: any, callback: any) => {
    return {
        type: Types.CALLBACK_UPDATE_REPORT,
        data: {
            result: data,
            callback
        }
    };
}

export const callbackRestartUploadWorkflow = (data: any, callback: any) => {
    return {
        type: Types.CALLBACK_RESTART_UPLOAD_WORKFLOW,
        data: {
            result: data,
            callback
        }
    };
}

export const callbackDeleteReport = (data: any, callback: any) => {
    return {
        type: Types.CALLBACK_DELETE_REPORT,
        data: {
            result: data,
            callback
        }
    };
}
