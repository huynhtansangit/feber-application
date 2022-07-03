import { Dispatch } from "redux";
import { setRules } from "./actions";
import LogService from "../../../services/LogService";

export const getRules = (callbacks: any[]) => async (dispatch: Dispatch) => {
    let logSrv: LogService = new LogService();
    let results = await logSrv.getLogRules();
    dispatch(setRules(results, callbacks));
}