import { Types } from "./actions";
import { IRule, IRuleList } from "./types";
import { IColumn } from "@fluentui/react";
import React from "react";
import _ from "lodash";
import Helper from "../../../core/libraries/Helper";
import RbButton, { ButtonSize } from "../../../bosch-react/components/button/RbButton";
import RbLabel, { LabelSize } from "../../../bosch-react/components/label/RbLabel";

const initialState: IRule = {
    keyword: "",
    filteredData: [],
    data: [],
    columns: []
};

type dataType = IRuleList | string | boolean;

export const LogRulesReducer = (state: IRule = initialState, action: { type: string, data: dataType }) => {
    switch (action.type) {
        case Types.INITIALIZE: {
            let result: IRule = Object.assign({}, state);
            result = initialState;
            return result;
        }
        case Types.SEARCH_TEXT: {
            let result: IRule = Object.assign({}, state);
            result.keyword = action.data as string;
            result.filteredData = searchText(state.columns, result.keyword, state.data);
            return result;
        }
        case Types.SET_RULES: {
            return setRules(state, action);
        }
    }
    return state;
};

const searchText = (cols: IColumn[], keyword: string, items: any[]) => {
    let results: any[] = [];
    if (keyword !== "") {
        items.forEach((item: any) => {
            let found: any = false;
            cols.forEach((col: any) => {
                if (col.name !== "" && col.fieldName !== "Action" && !_.isNil(item[col.fieldName])) {
                    if ((item[col.fieldName] as string).toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                        found = true;
                    }
                }
            });
            if (found === true) {
                results.push(item);
            }
        });
    }
    else {
        results = items;
    }
    return results;
}

const setRules = (state: IRule = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Edit rule
    1 - Remove rule
    2 - Callback
     */
    let result: IRule = Object.assign({}, state);
    result.data = (action.data as IRuleList).result;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'column_RuleName',
            name: 'Rule Name',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Title}</RbLabel>);
            }
        },
        {
            key: 'column_Keywords',
            name: 'Keywords',
            fieldName: 'Keywords',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Keywords}</RbLabel>);
            }
        },
        {
            key: 'column_actions',
            name: '',
            fieldName: 'Actions',
            currentWidth: Helper.resizeColumnByScreenWidth(40),
            minWidth: Helper.resizeColumnByScreenWidth(40),
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <React.Fragment>
                        <RbButton label="Edit" size={ButtonSize.Small} onClick={() => {
                            (action.data as IRuleList).callbacks[0](item);
                        }} />
                        &nbsp;
                        <RbButton label="Remove" size={ButtonSize.Small} onClick={() => {
                            (action.data as IRuleList).callbacks[1](item);
                        }} />
                    </React.Fragment>
                );
            }
        }];
    if ((action.data as IRuleList).callbacks[2] !== undefined) {
        Helper.runNewTask(() => {
            (action.data as IRuleList).callbacks[2]();
        });
    }
    return result;
};