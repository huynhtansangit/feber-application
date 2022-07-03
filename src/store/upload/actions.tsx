//import {CommonReport} "./types";

import { IProperty } from "../access-mediator/types";
import { IResponibleDepartment } from "./types";
import { IUserProfile } from "../permission/types";

//import Helper from "../../core/libraries/Helper";

export enum Types {
    INIT = "INIT",
    INIT_STEPS = "INIT_STEPS",
    UPDATE_STEP = "UPDATE_STEP",
    UPDATE_FIELD = "UPDATE_FIELD",
    VALIDATE_UPLOAD_DATA = "VALIDATE_UPLOAD_DATA",
    SET_REPORT_TYPES = "SET_REPORT_TYPES",
    SET_ROU_LIST = "SET_ROU_LIST",
    SET_LL_DIVISION_ADMIN = "SET_LL_DIVISION_ADMIN",
    CALLBACK_UPLOAD_REPORT = "CALLBACK_UPLOAD_REPORT",
    SET_GM_LIST = "SET_GM_LIST"
}

export const init = (mode: string) => {
    return {
        type: Types.INIT,
        data: mode
    };
};

export const initSteps = (uploadType: string) => {
    return {
        type: Types.INIT_STEPS,
        data: uploadType
    };
}

export const updateStep = (step: any) => {
    return {
        type: Types.UPDATE_STEP,
        data: step
    };
}


export const updateField = (field: string, value: any) => {
    return {
        type: Types.UPDATE_FIELD,
        data: {
            field,
            value
        } as IProperty
    };
}

export const setROUList = (result: IResponibleDepartment[], userProfile: IUserProfile, shouldSetFirstValue: boolean, callback: (list: IResponibleDepartment[]) => void) => {
    return {
        type: Types.SET_ROU_LIST,
        data: {
            result,
            userProfile,
            shouldSetFirstValue,
            callback
        }
    };
}

export const setGMList = (result: IResponibleDepartment[], userProfile: IUserProfile, shouldSetFirstValue: boolean, callback: (list: IResponibleDepartment[]) => void) => {
    return {
        type: Types.SET_GM_LIST,
        data: {
            result,
            userProfile,
            shouldSetFirstValue,
            callback
        }
    };
}

export const setLLDivisionAdmin = (result: any, callback: (admin: any) => void) => {
    return {
        type: Types.SET_LL_DIVISION_ADMIN,
        data: {
            result,
            callback
        }
    };
}

export const callbackUploadReport = (result: boolean, callback: any) => {
    return {
        type: Types.CALLBACK_UPLOAD_REPORT,
        data: {
            result,
            callback
        }
    };
}

export const validateData = (callback: any) => {
    return {
        type: Types.VALIDATE_UPLOAD_DATA,
        data: { callback }
    };
}

export const setReportTypes = (uploadType: string, reportTypes: any[]) => {
    return {
        type: Types.SET_REPORT_TYPES,
        data: {
            uploadType,
            reportTypes
        }
    };
}
