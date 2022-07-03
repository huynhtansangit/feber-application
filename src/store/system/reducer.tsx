import { Types } from "./actions";
import { ISystem, ISystemList } from "./types";
import Helper from "../../core/libraries/Helper";
import { Link, TooltipHost, DirectionalHint, IColumn, HighContrastSelectorBlack } from "@fluentui/react";
import Template from "../../core/libraries/Template";
import React from "react";
import Environment from "../../Environment";
import _ from "lodash";
import RbButton, { ButtonSize, ButtonType } from "../../bosch-react/components/button/RbButton";
import RbLabel, { LabelSize } from "../../bosch-react/components/label/RbLabel";

const initialState: ISystem = {
    isAdminMode: false,
    keyword: "",
    filteredData: [],
    data: [],
    columns: [],
    exportMode: "download"
};

type dataType = ISystemList | string | boolean;

export const SystemReducer = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    switch (action.type) {
        case Types.INITIALIZE: {
            let result: ISystem = Object.assign({}, state);
            result = initialState;
            return result;
        }
        case Types.CHANGE_MODE: {
            let result: ISystem = Object.assign({}, state);
            if (_.isNil(action.data)) {
                result.isAdminMode = !result.isAdminMode;
            }
            else {
                result.isAdminMode = action.data as boolean;
            }
            return result;
        }
        case Types.SEARCH_TEXT: {
            let result: ISystem = Object.assign({}, state);
            result.keyword = action.data as string;
            result.filteredData = searchText(state.columns, result.keyword, state.data);
            return result;
        }
        case Types.SET_BOOKMARKS: {
            return setBookmarks(state, action);
        }
        case Types.SET_PENDING_UPLOADS: {
            return setPendingUploads(state, action);

        }
        case Types.SET_PENDING_ORDERS: {
            return setPendingOrders(state, action);
        }
        case Types.SET_CLOSED_UPLOADS: {
            return setClosedUploads(state, action);
        }
        case Types.SET_DIVISIONS: {
            return setDivisions(state, action);
        }
        case Types.SET_GROUPS: {
            return setGroups(state, action);
        }
        case Types.SET_MIGRATION_DATA: {
            return setMigrationData(state, action);
        }
        case Types.UPDATE_FIELD: {
            let result: ISystem = Object.assign({}, state);
            result.exportMode = action.data as string;
            return result;
        }
    }
    return state;
};

//#region FUNCTIONS
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

const setBookmarks = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Remove bookmark
    1 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    result.data = (action.data as ISystemList).result;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'column_DocumentTitle',
            name: 'Document Title',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <Link href={item.Url}>{item.Title}</Link>
                );
            }
        },
        {
            key: 'column_Authors',
            name: 'Authors',
            fieldName: 'Authors',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                //Original code
                //return Template.renderReadOnlyPeoplePickerTags(item.Authors);

                //is Bookmarks change follow to Author Display Name?
                // if(item.Authors === '') {
                //     return Template.renderReadOnlyPeoplePickerTags(item.FeberAuthorDisplayName);
                // }
                // else {
                //     return Template.renderReadOnlyPeoplePickerTags(item.Authors);

                // }
                return Template.renderReadOnlyPeoplePickerTags(Helper.mergeAuthors(item.Authors, item.FeberAuthorDisplayName))
            }
        },
        {
            key: 'column_BookmarkDate',
            name: 'Bookmark Date',
            fieldName: 'BookmarkDate',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.BookmarkDate}</RbLabel>);
            }
        },
        {
            key: 'column_Keywords',
            name: 'Keywords',
            fieldName: 'Keywords',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <TooltipHost
                        directionalHint={DirectionalHint.leftCenter}
                        content={item.Keywords}>
                        {item.Keywords}
                    </TooltipHost>
                );
            }
        },
        {
            key: 'column_Unbookmark',
            name: '',
            fieldName: 'Actions',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <RbButton label="Remove" size={ButtonSize.Small} onClick={() => {
                        (action.data as ISystemList).callbacks[0](item);
                    }} />
                );
            }
        }];
    if (state.isAdminMode === true) {
        result.columns.splice(4, 0, ...[{
            key: 'column_BookmarkUser',
            name: 'Bookmark User',
            fieldName: 'BookmarkUser',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return Template.renderReadOnlyPeoplePickerTags(item.BookmarkUser);
            }
        }]);
    }
    Helper.runNewTask(() => {
        (action.data as ISystemList).callbacks[1]();
    });
    return result;
};

const setPendingUploads = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Cancel upload
    1 - Edit Workflow Id
    2 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    result.data = (action.data as ISystemList).result;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'column_Title',
            name: 'Title',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(14),
            minWidth: Helper.resizeColumnByScreenWidth(14),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                console.log(item)
                return (
                    <Link href={item.Url}>{item.Title}</Link>
                );
            }
        },
        {
            key: 'column_Authors',
            name: 'Author(s)',
            fieldName: 'Authors',
            currentWidth: Helper.resizeColumnByScreenWidth(14),
            minWidth: Helper.resizeColumnByScreenWidth(14),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                if(item.Authors === '') {
                    return Template.renderReadOnlyPeoplePickerTags(item.FeberAuthorDisplayName);
                }
                else {
                    return Template.renderReadOnlyPeoplePickerTags(item.Authors);

                }
            }
        },
        {
            key: 'column_Division',
            name: 'Division',
            fieldName: 'Division',
            currentWidth: Helper.resizeColumnByScreenWidth(5),
            minWidth: Helper.resizeColumnByScreenWidth(5),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Division}</RbLabel>);
            }
        },
        {
            key: 'column_FeberDepartment',
            name: 'Department',
            fieldName: 'Department',
            currentWidth: Helper.resizeColumnByScreenWidth(9),
            minWidth: Helper.resizeColumnByScreenWidth(9),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Department}</RbLabel>);
            }
        },
        {
            key: 'column_FeberKeywords',
            name: 'Keywords',
            fieldName: 'Keywords',
            currentWidth: Helper.resizeColumnByScreenWidth(9),
            minWidth: Helper.resizeColumnByScreenWidth(9),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <TooltipHost
                        directionalHint={DirectionalHint.leftCenter}
                        content={item.Keywords}>
                        {item.Keywords}
                    </TooltipHost>
                );
            }
        },
        {
            key: 'column_UploadTypeDescription',
            name: 'Upload Type',
            fieldName: 'UploadType',
            currentWidth: Helper.resizeColumnByScreenWidth(8),
            minWidth: Helper.resizeColumnByScreenWidth(8),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.UploadType}</RbLabel>);
            }
        },
        {
            key: 'column_WorkflowId',
            name: 'Workflow ID',
            fieldName: 'WorkflowId',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return (
                    (state.isAdminMode === true) ?
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} label={
                            (item.WorkflowId !== "" && !_.isNil(item.WorkflowId)) ?
                                item.WorkflowId : "..."}
                            title="Click here to edit this Workflow ID" onClick={() => {
                                (action.data as ISystemList).callbacks[1](item);
                            }} />
                        : <RbLabel size={LabelSize.Small} >{item.WorkflowId}</RbLabel>
                );
            }
        },
        {
            key: 'column_CancelUpload',
            name: '',
            fieldName: 'Actions',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return (
                    <RbButton label="Cancel Upload" size={ButtonSize.Small} onClick={() => {
                        (action.data as ISystemList).callbacks[0](item);
                    }} />
                );
            }
        }
    ];
    if (state.isAdminMode === true) {
        result.columns.splice(7, 0, ...[{
            key: 'column_Submitter',
            name: 'Submitter',
            fieldName: 'Submitter',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return Template.renderReadOnlyPeoplePickerTags(item.Submitter);
            }
        }]);
        result.columns.splice(6, 0, ...[{
            key: 'column_HasAttachment',
            name: '',
            iconName: "Attach",
            fieldName: 'HasAttachment',
            currentWidth: Helper.resizeColumnByScreenWidth(3),
            minWidth: Helper.resizeColumnByScreenWidth(3),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (item.HasAttachment === true) ? (<i className="ms-Icon ms-Icon--Attach"></i>) : "";
            }
        },
        {
            key: 'column_CorrelationId',
            name: 'Correlation ID',
            fieldName: 'CorrelationId',
            currentWidth: Helper.resizeColumnByScreenWidth(8),
            minWidth: Helper.resizeColumnByScreenWidth(8),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <TooltipHost
                        directionalHint={DirectionalHint.leftCenter}
                        content={item.CorrelationId}>
                        <RbLabel size={LabelSize.Small} >{item.CorrelationId}</RbLabel>
                    </TooltipHost>
                );
            }
        }]);
    }
    Helper.runNewTask(() => {
        (action.data as ISystemList).callbacks[2]();
    });
    return result;
};

const setPendingOrders = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Cancel order
    1 - Edit Workflow Id
    2 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    result.data = (action.data as ISystemList).result;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'column_Title',
            name: 'Title',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    // <Link href={Environment.phaPageUrl + "FeberOrder.aspx?Guid=" + item.Guid}>"{item.Title}"</Link>
                    <Link href={item.Url}>{item.Title}</Link>
                );
            }
        },
        {
            key: 'column_Authors',
            name: 'Author(s)',
            fieldName: 'Authors',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                if(item.Authors === '') {
                    return Template.renderReadOnlyPeoplePickerTags(item.FeberAuthorDisplayName);
                }
                else {
                    return Template.renderReadOnlyPeoplePickerTags(item.Authors);

                }
            }
        },
        {
            key: 'column_OrderApprover',
            name: 'Order Approver',
            fieldName: 'Approver',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return Template.renderReadOnlyPeoplePickerTags(item.Approver);
            }
        },
        {
            key: 'column_OrderComments',
            name: 'Order Comments',
            fieldName: 'Comment',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <TooltipHost
                        directionalHint={DirectionalHint.leftCenter}
                        content={item.Comment}>
                        <RbLabel size={LabelSize.Small} >{item.Comment}</RbLabel>
                    </TooltipHost>
                );
            }
        },
        {
            key: 'column_OrderDate',
            name: 'Order Date',
            fieldName: 'OrderDate',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.OrderDate}</RbLabel>);
            }
        },
        {
            key: 'column_SecurityClass',
            name: 'Security Class',
            fieldName: 'SecurityClass',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.SecurityClass}</RbLabel>);
            }
        },
        {
            key: 'column_WorkflowId',
            name: 'Workflow ID',
            fieldName: 'WorkflowId',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return (
                    (state.isAdminMode === true) ?
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} label={
                            (item.WorkflowId !== "" && !_.isNil(item.WorkflowId)) ?
                                item.WorkflowId : "..."}
                            title="Click here to edit this Workflow ID" onClick={() => {
                                (action.data as ISystemList).callbacks[1](item);
                            }} />
                        : <RbLabel size={LabelSize.Small} >{item.WorkflowId}</RbLabel>
                );
            }
        },
        {
            key: 'column_CancelOrder',
            name: '',
            fieldName: 'Actions',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return (
                    <RbButton label="Cancel Order" size={ButtonSize.Small} onClick={() => {
                        (action.data as ISystemList).callbacks[0](item);
                    }} />
                );
            }
        }
    ];
    if (state.isAdminMode === true) {
        result.columns.splice(7, 0, ...[{
            key: 'column_OrderUser',
            name: 'Order User',
            fieldName: 'OrderUser',
            currentWidth: Helper.resizeColumnByScreenWidth(12),
            minWidth: Helper.resizeColumnByScreenWidth(12),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return Template.renderReadOnlyPeoplePickerTags(item.OrderUser);
            }
        }]);
        result.columns.splice(6, 0, ...[{
            key: 'column_CorrelationId',
            name: 'Correlation ID',
            fieldName: 'CorrelationId',
            currentWidth: Helper.resizeColumnByScreenWidth(8),
            minWidth: Helper.resizeColumnByScreenWidth(8),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <TooltipHost
                        directionalHint={DirectionalHint.leftCenter}
                        content={item.CorrelationId}>
                        <RbLabel size={LabelSize.Small} >{item.CorrelationId}</RbLabel>
                    </TooltipHost>
                );
            }
        }]);
    }
    Helper.runNewTask(() => {
        (action.data as ISystemList).callbacks[2]();
    });
    return result;
};

const setClosedUploads = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    result.data = (action.data as ISystemList).result;
    //console.log(result.data)
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'column_Title',
            name: 'Title',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (
                    <Link href={item.Url}>{item.Title}</Link>
                );
            },

        },
        {
            key: 'column_Authors',
            name: 'Author(s)',
            fieldName: 'Authors',
            currentWidth: Helper.resizeColumnByScreenWidth(15),
            minWidth: Helper.resizeColumnByScreenWidth(15),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                if(item.Authors === '') {
                    return Template.renderReadOnlyPeoplePickerTags(item.FeberAuthorDisplayName);
                }
                else {
                    return Template.renderReadOnlyPeoplePickerTags(item.Authors);

                }
                
            }
        },
        {
            key: 'column_Division',
            name: 'Division',
            fieldName: 'Division',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Division}</RbLabel>);
            }
        },
        {
            key: 'column_FeberDepartment',
            name: 'Department',
            fieldName: 'Department',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Department}</RbLabel>);
            }
        },
        {
            key: 'column_UploadTypeDescription',
            name: 'Upload Type',
            fieldName: 'UploadType',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.UploadType}</RbLabel>);
            }
        },
        {
            key: 'column_WorkflowID',
            name: 'Workflow ID',
            fieldName: 'WorkflowID',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.WorkflowID}</RbLabel>);
            }
        },
        {
            key: 'column_RestartUpload',
            name: '',
            fieldName: 'Actions',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            isRowHeader: true,
            isPadded: true,
            isMultiline: true,
            onRender: (item: any) => {
                return (
                    <RbButton label="Restart Upload" size={ButtonSize.Small} onClick={() => {
                        Helper.openDialog(item.Url);
                    }} />
                );
            }
        }
    ];
    if (state.isAdminMode === true) {
        result.columns.splice(6, 0, ...[{
            key: 'column_Submitter',
            name: 'Submitter',
            fieldName: 'Submitter',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,

            onRender: (item: any) => {
                return Template.renderReadOnlyPeoplePickerTags(item.Submitter);
            }
        }]);
        result.columns.splice(5, 0, ...[{
            key: 'column_HasAttachment',
            name: '',
            iconName: "Attach",
            fieldName: 'HasAttachment',
            currentWidth: Helper.resizeColumnByScreenWidth(3),
            minWidth: Helper.resizeColumnByScreenWidth(3),
            isResizable: true,
            isRowHeader: true,
            data: 'string',
            isPadded: true,
            onRender: (item: any) => {
                return (item.HasAttachment === true) ? (<i className="ms-Icon ms-Icon--Attach"></i>) : "";
            }
        }]);
    }
    Helper.runNewTask(() => {
        (action.data as ISystemList).callbacks[0]();
    });
    return result;
};

const setDivisions = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    let listItems: any[] = [];
    (action.data as ISystemList).result.forEach((result: any) => {
        listItems.push({
            Id: result.Id,
            ShortName: result.Title,
            LongName: result.DivisionName,
            Code: result.DivisionCode
        });
    });
    listItems = Helper.sortObjects(listItems, "ShortName");
    result.data = listItems;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'shortName',
            name: 'Short Name',
            fieldName: 'ShortName',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.ShortName}</RbLabel>);
            }
        },
        {
            key: 'longName',
            name: 'Long Name',
            fieldName: 'LongName',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.LongName}</RbLabel>);
            }
        },
        {
            key: 'code',
            name: 'Code',
            fieldName: 'Code',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Code}</RbLabel>);
            }
        },
        {
            key: 'action',
            name: 'Action',
            fieldName: 'Action',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true
        }
    ];
    if ((action.data as ISystemList).callbacks.length > 0) {
        Helper.runNewTask(() => {
            (action.data as ISystemList).callbacks[0]();
        });
    }
    return result;
};

const setGroups = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    let listItems: any[] = [];
    (action.data as ISystemList).result.forEach((result: any) => {
        listItems.push({
            Id: result.Id,
            GroupName: result.Title,
            Description: result.Description
        });
    });
    listItems = Helper.sortObjects(listItems, "GroupName");
    result.data = listItems;
    result.filteredData = searchText(state.columns, state.keyword, result.data);
    result.columns = [
        {
            key: 'groupName',
            name: 'Group Name',
            fieldName: 'GroupName',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.GroupName}</RbLabel>);
            }
        },
        {
            key: 'description',
            name: 'Description',
            fieldName: 'Description',
            currentWidth: Helper.resizeColumnByScreenWidth(30),
            minWidth: Helper.resizeColumnByScreenWidth(30),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Description}</RbLabel>);
            }
        },
        {
            key: 'action',
            name: 'Action',
            fieldName: 'Action',
            currentWidth: Helper.resizeColumnByScreenWidth(40),
            minWidth: Helper.resizeColumnByScreenWidth(40),
            isResizable: true
        }
    ];
    if ((action.data as ISystemList).callbacks.length > 0) {
        Helper.runNewTask(() => {
            (action.data as ISystemList).callbacks[0]();
        });
    }
    return result;
};

const setMigrationData = (state: ISystem = initialState, action: { type: string, data: dataType }) => {
    /* Callbacks:
    0 - Finish loading
     */
    let result: ISystem = Object.assign({}, state);
    result.data = (action.data as ISystemList).result;
    result.columns = [
        {
            key: 'title',
            name: 'Title',
            fieldName: 'Title',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Title}</RbLabel>);
            }
        },
        {
            key: 'sourceDivision',
            name: 'Source Division',
            fieldName: 'SourceDivision',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.SourceDivision}</RbLabel>);
            }
        },
        {
            key: 'sourceList',
            name: 'Source List',
            fieldName: 'SourceList',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.SourceList}</RbLabel>);
            }
        },
        {
            key: 'targetDivision',
            name: 'Target Division',
            fieldName: 'TargetDivision',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.TargetDivision}</RbLabel>);
            }
        },
        {
            key: 'targetList',
            name: 'Target List',
            fieldName: 'TargetList',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.TargetList}</RbLabel>);
            }
        },
        {
            key: 'guid',
            name: 'Guid',
            fieldName: 'GUID1',
            currentWidth: Helper.resizeColumnByScreenWidth(20),
            minWidth: Helper.resizeColumnByScreenWidth(20),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.GUID1}</RbLabel>);
            }
        },
        {
            key: 'status',
            name: 'Status',
            fieldName: 'Status',
            currentWidth: Helper.resizeColumnByScreenWidth(10),
            minWidth: Helper.resizeColumnByScreenWidth(10),
            isResizable: true,
            onRender: (item) => {
                return (<RbLabel size={LabelSize.Small} >{item.Status}</RbLabel>);
            }
        }
    ];
    if ((action.data as ISystemList).callbacks.length > 0) {
        Helper.runNewTask(() => {
            (action.data as ISystemList).callbacks[0]();
        });
    }
    return result;
};
//#endregion