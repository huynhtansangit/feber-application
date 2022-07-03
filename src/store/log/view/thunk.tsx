import { Dispatch } from "redux";
import { setLogData, setLogFiles } from "./actions";
import LogService from "../../../services/LogService";
import { IDropdownOption } from "@fluentui/react";

export const getLogFiles = (logType: string) => async (dispatch: Dispatch) => {
    let logSrv: LogService = new LogService();
    let options: IDropdownOption[] = await logSrv.getLogFiles(logType);
    dispatch(setLogFiles(options));
}

export const getLogContent = (logFileUrl: string) => async (dispatch: Dispatch) => {
    let logSrv: LogService = new LogService();
    let content: string = await logSrv.getLogContent(logFileUrl);
    dispatch(setLogData(content));
}