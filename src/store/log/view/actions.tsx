import { ILogFilter } from "./types";

export enum Types {
    INITIALIZE = "INITIALIZE",
    SET_LOG_FILES = "SET_LOG_FILES",
    SET_LOG_DATA = "SET_LOG_DATA",
    CHANGE_FILTER = "CHANGE_FILTER",
    SEARCH = "SEARCH",
}

export const init = () => {
    return {
        type: Types.INITIALIZE
    };
}

export const changeFilter = (filterName: string, optionKey: any) => {
    return {
        type: Types.CHANGE_FILTER,
        data: {
            name: filterName,
            value: optionKey
        } as ILogFilter
    };
}

export const setLogData = (content: string) => {
    return {
        type: Types.SET_LOG_DATA,
        data: content

    };
}

export const setLogFiles = (data: any[]) => {
    return {
        type: Types.SET_LOG_FILES,
        data
    };
}

export const search = (text: string, callback?: any) => {
    return {
        type: Types.SEARCH,
        data: {
            keyword: text,
            callback
        }
    };
}