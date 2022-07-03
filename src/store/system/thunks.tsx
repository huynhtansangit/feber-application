import { Dispatch } from "redux";
import SystemService from "../../services/SystemService";
import { setBookmarks, setPendingUploads, setPendingOrders, setClosedUploads, setDivisions, setGroups, setMigrationData } from "./actions";
import PermissionsService from "../../services/PermissionsService";
import MigrationService from "../../services/MigrationService";
import _ from "lodash";

export const getBookmarks = (userId: number | null = null, callbacks: any[]) => async (dispatch: Dispatch) => {
    let systemSrv: SystemService = new SystemService();
    let bookmarks = await systemSrv.getAllBookmarksByUser(userId);
    dispatch(setBookmarks(_.isNil(userId), bookmarks, callbacks));
}

export const getPendingUploads = (userId: number | null = null, callbacks: any[]) => async (dispatch: Dispatch) => {
    let systemSrv: SystemService = new SystemService();
    let uploads = await systemSrv.getAllPendingUploadsByUser(userId);
    dispatch(setPendingUploads(_.isNil(userId), uploads, callbacks));
}

export const getPendingOrders = (userId: number | null = null, callbacks: any[]) => async (dispatch: Dispatch) => {
    let systemSrv: SystemService = new SystemService();
    let orders = await systemSrv.getAllPendingOrdersByUser(userId);
    dispatch(setPendingOrders(_.isNil(userId), orders, callbacks));
}

export const getClosedUploads = (userId: number | null = null, callbacks: any[]) => async (dispatch: Dispatch) => {
    let systemSrv: SystemService = new SystemService();
    let uploads = await systemSrv.getAllClosedPendingUploadsByUser(userId);
    //console.log(uploads)
    dispatch(setClosedUploads(_.isNil(userId), uploads, callbacks));
}

export const getDivisions = (callbacks: any[]) => async (dispatch: Dispatch) => {
    let systemSrv: SystemService = new SystemService();
    let divisions = await systemSrv.getDivisionsList();
    dispatch(setDivisions(divisions, callbacks));
}

export const getGroups = (callbacks: any[]) => async (dispatch: Dispatch) => {
    let permissionSrv: PermissionsService = new PermissionsService();
    let groups = await permissionSrv.getFEBERGroupsList();
    dispatch(setGroups(groups, callbacks));
}

export const getMigrationData = (callbacks: any[]) => async (dispatch: Dispatch) => {
    let migrationSrv: MigrationService = new MigrationService();
    let data = await migrationSrv.getData();
    dispatch(setMigrationData(data, callbacks));
}