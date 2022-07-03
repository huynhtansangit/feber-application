import { ISystemList } from "./types";

export enum Types {
    INITIALIZE = "INITIALIZE",
    CHANGE_MODE = "CHANGE_MODE",
    SEARCH_TEXT = "SEARCH_TEXT",
    SET_BOOKMARKS = "SET_BOOKMARKS",
    SET_PENDING_UPLOADS = "SET_PENDING_UPLOADS",
    SET_PENDING_ORDERS = "SET_PENDING_ORDERS",
    SET_CLOSED_UPLOADS = "SET_CLOSED_UPLOADS",
    SET_DIVISIONS = "SET_DIVISIONS",
    SET_GROUPS = "SET_GROUPS",
    SET_MIGRATION_DATA = "SET_MIGRATION_DATA",
    UPDATE_FIELD = "UPDATE_FIELD"
};

export const init = () => {
    return {
        type: Types.INITIALIZE
    };
}

export const changeMode = (isAdminMode: boolean = null) => {
    return {
        type: Types.CHANGE_MODE,
        data: isAdminMode
    };
}

export const searchText = (text: string) => {
    return {
        type: Types.SEARCH_TEXT,
        data: text.trim()
    };
};

export const setBookmarks = (isSuperAdmin: boolean = false, data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_BOOKMARKS,
        data: {
            isSuperAdmin,
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setPendingUploads = (isSuperAdmin: boolean = false, data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_PENDING_UPLOADS,
        data: {
            isSuperAdmin,
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setPendingOrders = (isSuperAdmin: boolean = false, data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_PENDING_ORDERS,
        data: {
            isSuperAdmin,
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setClosedUploads = (isSuperAdmin: boolean = false, data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_CLOSED_UPLOADS,
        data: {
            isSuperAdmin,
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setDivisions = (data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_DIVISIONS,
        data: {
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setGroups = (data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_GROUPS,
        data: {
            result: data,
            callbacks
        } as ISystemList
    };
};

export const setMigrationData = (data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_MIGRATION_DATA,
        data: {
            result: data,
            callbacks
        } as ISystemList
    };
};

export const updateField = (field: string, value: any) => {
    return {
        type: Types.UPDATE_FIELD,
        data: value
    };
}