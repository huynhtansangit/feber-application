import { Dispatch } from "redux";
import Constants from "../../core/libraries/Constants";
import SystemService from "../../services/SystemService";
import { setReportTypes, callbackUploadReport, setROUList, setLLDivisionAdmin, setGMList } from "./actions";
import UploadService from "../../services/UploadService";
import IDMService from "../../services/IDMService";
import { IResponibleDepartment } from "./types";
import PermissionsService from "../../services/PermissionsService";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import { IUserProfile } from "../permission/types";

export const getReportTypes = (uploadType: string) => async (dispatch: Dispatch) => {
    if (uploadType !== Constants.DOCUMENT_TYPE.LL) {
        let systemSrv: SystemService = new SystemService();
        let data = await systemSrv.getReportType(Constants.TYPE_MASTER_LIST[uploadType]);
        if (data.length === 0) {
            data.push.apply(data, Constants.DD_TYPE_MASTER_DATA[uploadType]);
        }
        else {
            let result: any[] = [];
            data.forEach((item: any) => {
                result.push({
                    key: item.Title,
                    text: item.Title
                });
            });
            data = result;
        }
        dispatch(setReportTypes(uploadType, data));
    }
};

export const getROUListByPeoplePickerValues = (authors: any[], userProfile: IUserProfile, callback: (list: IResponibleDepartment[]) => void) => async (dispatch: Dispatch) => {
    let idmSrv: IDMService = new IDMService();
    let rouLists: IResponibleDepartment[] = await idmSrv.getROUByPeoplePickerValues(authors);
    dispatch(setROUList(rouLists, userProfile, false, callback));
}

export const getROUListByDepartments = (departments: any[], userProfile: IUserProfile, callback: (list: IResponibleDepartment[]) => void) => async (dispatch: Dispatch) => {
    let idmSrv: IDMService = new IDMService();
    let rouLists: IResponibleDepartment[] = await idmSrv.getROUByDepartments(departments);
    dispatch(setROUList(rouLists, userProfile, true, callback));
}

export const GetGroupManagerByPeoplePickerValues = (authors: any[], userProfile: IUserProfile, callback: (list: IResponibleDepartment[]) => void) => async (dispatch: Dispatch) => {
    let idmSrv: IDMService = new IDMService();
    let gmLists: IResponibleDepartment[] = await idmSrv.GetGroupManagerByPeoplePickerValues(authors);
    dispatch(setGMList(gmLists, userProfile, false, callback));
}

export const GetGroupManagerByDepartments = (departments: any[], userProfile: IUserProfile, callback: (list: IResponibleDepartment[]) => void) => async (dispatch: Dispatch) => {
    let idmSrv: IDMService = new IDMService();
    let gmLists: IResponibleDepartment[] = await idmSrv.GetGroupManagerByDepartments(departments);
    dispatch(setGMList(gmLists, userProfile, true, callback));
}

export const loadLLDivisionAdmin = (division: string, callback: () => void) => async (dispatch: Dispatch) => {
    let permissionSrv: PermissionsService = new PermissionsService();
    let user = await permissionSrv.getLLDivisionAdmin(division);
    let ppValue = (user !== null) ? {
        Id: (user as ISiteUserInfo).Id,
        Title: (user as ISiteUserInfo).Title
    } : null;
    dispatch(setLLDivisionAdmin(ppValue, callback));
}

export const uploadReport = (userToken: string, report: any, mode: string, callback: any) => async (dispatch: Dispatch) => {
    report.IsAdmin = mode === "admin";
    report.UploadTypeDescription = (Constants.DOCUMENT_TYPE_LONGNAME as any)[report.UploadType];
    let uploadSrv: UploadService = new UploadService();
    let uploadResult: boolean = await uploadSrv.uploadReport(userToken, report);
    dispatch(callbackUploadReport(uploadResult, callback));
};
