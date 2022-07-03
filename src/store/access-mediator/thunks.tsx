import { Dispatch } from "redux";
import { setData, setReportTypes, setChangedDepartment, setChangedDivisonAdmin,
    callbackUpdateReport, callbackRestartUploadWorkflow, callbackDeleteReport } from "./actions";
import SystemService from "../../services/SystemService";
import Constants from "../../core/libraries/Constants";
import AccessMediatorService from "../../services/AccessMediatorService";
import IDMService from "../../services/IDMService";
import PermissionsService from "../../services/PermissionsService";

export const getData = (userToken: string, guid: string, callback: any) => async (dispatch: Dispatch) => {
    let amSrv = new AccessMediatorService();
    let data = await amSrv.getReport(userToken, guid);
    dispatch(setData(data, callback));
};

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
        dispatch(setReportTypes(data));
    }
};

export const changeDepartment = (departmentName: string, callback: any) => async (dispatch: Dispatch) => {
    let idmSrv = new IDMService();
    let data = await idmSrv.getROU(departmentName.replace("/", "_"));
    dispatch(setChangedDepartment(data, callback));
};

export const changeDivisionAdmin = (division: string, callback: any) => async (dispatch: Dispatch) => {
    let permisionSrv = new PermissionsService();
    let data = await permisionSrv.getLLDivisionAdmin(division);
    dispatch(setChangedDivisonAdmin(data, callback));
};

export const updateReport = (userToken: string, report: any, callback: any) => async (dispatch: Dispatch) => {
    let amSrv = new AccessMediatorService();
    let data = await amSrv.updateReport(userToken, report);
    dispatch(callbackUpdateReport(data, callback));
};

export const restartUploadWorkflow = (userToken: string, report: any, callback: any) => async (dispatch: Dispatch) => {
    let amSrv = new AccessMediatorService();
    let data = await amSrv.restartUpload(userToken, report);
    dispatch(callbackRestartUploadWorkflow(data, callback));
};

export const deleteReport = (userToken: string, report: any, callback: any) => async (dispatch: Dispatch) => {
    let amSrv = new AccessMediatorService();
    let data = await amSrv.deleteReport(userToken, report);
    dispatch(callbackDeleteReport(data, callback));
};