import { ILogTable, ILogFilter, ILogRow } from "./types";
import { Types } from "./actions";
import { ISystemList } from "../../system/types";
import Helper from "../../../core/libraries/Helper";
import { IDropdownOption } from "@fluentui/react";
import _ from "lodash";
import React from "react";
import RbLabel, { LabelSize } from "../../../bosch-react/components/label/RbLabel";

const initialState: ILogTable = {
    type: "",
    file: "",
    files: [],
    mode: "ERROR",
    keyword: "",
    data: [],
    filteredData: [],
    columns: []
};

type dataType = string | ILogFilter | ISystemList | IDropdownOption[] | any;

export const LogReducer = (state: ILogTable = initialState, action: { type: string, data: dataType }): ILogTable => {
    switch (action.type) {
        case Types.INITIALIZE: {
            let result: ILogTable = Object.assign({}, state);
            result = initialState;
            return result;
        }
        case Types.CHANGE_FILTER: {
            let logResult: ILogTable = Object.assign({}, state);
            let data: ILogFilter = action.data as ILogFilter;
            switch (data.name) {
                case "type": {
                    logResult.type = data.value;
                    logResult.file = "";
                    logResult.files = []
                    break;
                }
                case "file": {
                    logResult.file = data.value;
                    break;
                }
                case "mode": {
                    logResult.mode = data.value;
                    switch (logResult.mode) {
                        case "": {
                            logResult.filteredData = logResult.data;
                            break;
                        }
                        default: {
                            logResult.filteredData = _.filter(logResult.data, (row: ILogRow) => row.Type === logResult.mode);
                            break;
                        }
                    }
                    break;
                }
                default: {
                    logResult.filteredData = [];
                }
            }
            return logResult;
        }
        case Types.SET_LOG_FILES: {
            let result: ILogTable = Object.assign({}, state);
            result.files = action.data as IDropdownOption[];
            result.file = "";
            return result;

        }
        case Types.SET_LOG_DATA: {
            return setLogData(state, action);
        }
        case Types.SEARCH: {
            let result: ILogTable = Object.assign({}, state);
            result.keyword = action.data.keyword;
            if (action.data.callback !== undefined) {
                Helper.runNewTask(() => {
                    action.data.callback();
                });
            }
            return result;
        }
    }
    return state;
}

const setLogData = (state: ILogTable = initialState, action: { type: string, data: dataType }) => {
    let result: ILogTable = Object.assign({}, state);
    let dataTable: ILogRow[] = analyzeLogContent(action.data as string);
    result.data = dataTable;
    result.filteredData = result.data.filter((row: ILogRow) => row.Type === state.mode);;
    result.columns = [
        {
            key: 'type',
            name: 'Type',
            fieldName: 'Type',
            currentWidth: 35,
            minWidth: 35,
            maxWidth: 35
        },
        {
            key: 'dateTime',
            name: 'Date Time',
            fieldName: 'DateTime',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small}>{item.DateTime}</RbLabel>);
            }
        },
        {
            key: 'details',
            name: 'Details',
            fieldName: 'Details',
            currentWidth: Helper.resizeColumnByScreenWidth(60),
            minWidth: Helper.resizeColumnByScreenWidth(60),
            isResizable: true,
            isMultiline: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} isMultipleLines={true}>{item.Details}</RbLabel>);
            }
        },
        {
            key: 'error',
            name: 'Error',
            fieldName: 'Error',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isMultiline: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} isMultipleLines={true}>{item.Error}</RbLabel>);
            }
        }
    ];

    return result;
};

const analyzeLogContent = (content: string) => {
    let linesArr: string[] = content.split("\r\n");
    linesArr = _.filter(linesArr, (line: string) => line.trim() !== "");
    let rowIndex: number = -1;
    let stringRows: string[] = [];
    _.forEach(linesArr, (line: string) => {
        if (line.indexOf(" INFO  at") > -1 || line.indexOf(" ERROR  at") > -1
            || line.indexOf(" INFO at") > -1 || line.indexOf(" ERROR at") > -1) {
            rowIndex++;
            stringRows[rowIndex] = line;
        }
        else {
            stringRows[rowIndex] += "\r\n" + line;
        }
    });
    let rows: ILogRow[] = [];
    _.forEach(stringRows, (stringRow: string) => {
        let rowArr: string[] = stringRow.split(" ");
        rows.push({
            Type: rowArr[2].trim(),
            DateTime: rowArr[0] + " " + rowArr[1],
            Details: stringRow.replace(rowArr[0] + " " + rowArr[1] + " " + rowArr[2] + " at", "")
                .replace(rowArr[0] + " " + rowArr[1] + " " + rowArr[2] + "  at", "").trim(),
            Error: ""
        } as ILogRow);
    });
    return rows;
}