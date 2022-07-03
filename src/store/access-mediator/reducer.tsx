import { IAccessMediator, IProperty, PageName, ReportStatus } from "./types";
import { Types } from "./actions";
import { checkTextInput, checkPeoplePickerValue, checkDatePickerValue, checkDropdownListValue, checkLinkValue, checkNotificationPickerValue } from "../../core/libraries/Validation";
import Helper from "../../core/libraries/Helper";
import Constants from "../../core/libraries/Constants";
import _ from "lodash";

const initialState: IAccessMediator = {
    //page: PageName.ACCESS_MEDIATOR,
    page: PageName.NON_RND_USER,
    mode: "View",
    data: null,
    error: "",
    validation: {},
    securityClasses: [],
    reportTypes: [],
    status: ReportStatus.PUBLISHED,
    checkBoxChecked: undefined,
    isFirstLoad: true,
};

type dataType = string | IProperty | any;

export const AccessMediatorReducer = (state: IAccessMediator = initialState, action: { type: string, data: dataType } ) => {
    //console.log(state)
    //console.log(action)
    switch (action.type) {
        case Types.INIT: {
            let result: IAccessMediator = initialState;
            return result;
        }
        case Types.CHANGE_MODE: {
            let result: IAccessMediator = Object.assign({}, state);
            result.mode = action.data;
            return result;
        }
        case Types.SET_DATA: {
            let result: IAccessMediator = Object.assign({}, state);
            let rs = action.data.result;
            if (action.data.result === null) {
                rs = {
                    Error: "Error",
                    Page: PageName.NOT_FOUND,
                    Item: null,
                    Status: ReportStatus.NOT_FOUND
                }
            }
            result.error = rs.Error;
            result.page = rs.Page;
            result.data = rs.Item;
            result.status = rs.Status;
            switch (result.status) {
                case ReportStatus.PUBLISHED:
                    {
                        result.mode = state.mode;
                        break;
                    }
                case ReportStatus.PENDING:
                    {
                        result.mode = "View";
                        break;
                    }
                case ReportStatus.CLOSED:
                    {
                        result.mode = "Edit";
                        break;
                    }
                case ReportStatus.NOT_FOUND:
                    {
                        result.mode = "View";
                        break;
                    }
            }
            if (result.status !== ReportStatus.NOT_FOUND) {
                switch (result.data.UploadType) {
                    case Constants.DOCUMENT_TYPE.RnD: {
                        result.securityClasses = Constants.DD_SECURITY_CLASSES_ALL;
                        break;
                    }
                    case Constants.DOCUMENT_TYPE.LL: {
                        result.securityClasses = Constants.DD_SECURITY_CLASSES_ONLY_1;
                        break;
                    }
                    case Constants.DOCUMENT_TYPE.Thesis: {
                        result.securityClasses = Constants.DD_SECURITY_CLASSES_ONLY_2;
                        break;
                    }
                    case Constants.DOCUMENT_TYPE.Paper: {
                        result.securityClasses = Constants.DD_SECURITY_CLASSES_ONLY_1;
                        break;
                    }
                }
            }
            Helper.runNewTask(() => {
                action.data.callback(result.data);
            });
            return result;
        }
        case Types.VALIDATE_DATA: {
            let result: IAccessMediator = Object.assign({}, state);
            if (state.page === PageName.ORDER) {
                // Only check Comment for page Order
                result.validation = checkTextInput({
                    value: state.data.Comment,
                    fieldName: "Comment",
                    displayName: "comment",
                    checkRequired: true
                });
            }
            else {
                result.validation = checkFormValidation(state);
            }
            if (checkValidData(result.validation) === true) {
                Helper.runNewTask(() => {
                    action.data.callback();
                });
            }
            return result;
        }
        case Types.UPDATE_PROPERTY: {
            let property: IProperty = action.data;
            let result: IAccessMediator = Object.assign({}, state);
            result.data[property.field] = property.value;
            return result;
        }
        case Types.UPDATE_CHECKBOX: {
            let property: IProperty = action.data;
            let result: IAccessMediator = Object.assign({}, state);
            result.checkBoxChecked = property.value;
            return result;
        }
        case Types.IS_FIRST_LOAD: {
            let property: IProperty = action.data;
            let result: IAccessMediator = Object.assign({}, state);
            result.isFirstLoad = property.value;
            return result;
        }
        case Types.SET_REPORT_TYPES: {
            let result: IAccessMediator = Object.assign({}, state);
            result.reportTypes = action.data;
            return result;
        }
        case Types.SET_CHANGED_DEPARTMENT: {
            let result: IAccessMediator = Object.assign({}, state);
            let rs: any = action.data.result;
            if (rs !== "" && rs.Status === "Success") {
                let approverDetail: any = rs.ApproverDetails[0];
                result.data.ROU = {
                    Id: parseInt(approverDetail[0]),
                    Title: approverDetail[1]
                };
                result.data.Division = approverDetail[2];
                result.data.FeberDepartment = approverDetail[3];
            }
            else {
                if (action.data.callback !== undefined) {
                    Helper.runNewTask(() => {
                        action.data.callback(false);
                    });
                }
            }
            if (action.data.callback !== undefined) {
                Helper.runNewTask(() => {
                    action.data.callback(true);
                });
            }
            return result;
        }
        case Types.SET_CHANGED_DIVISION_ADMIN: {
            let result: IAccessMediator = Object.assign({}, state);
            if (_.isNil(action.data.result)) {
                result.data.LLDivisionAdmin = null;
            }
            else {
                result.data.LLDivisionAdmin = {
                    Id: action.data.result.Id,
                    Title: action.data.result.Title
                };
            }
            if (action.data.callback !== undefined) {
                Helper.runNewTask(() => {
                    action.data.callback();
                });
            }
            return result;
        }
        case Types.CALLBACK_UPDATE_REPORT:
        case Types.CALLBACK_RESTART_UPLOAD_WORKFLOW:
        case Types.CALLBACK_DELETE_REPORT: {
            if (action.data.callback !== undefined) {
                Helper.runNewTask(() => {
                    action.data.callback(action.data.result);
                });
            }
        }
    }
    return state;
};

// Main validation
export const checkValidData = (validation: any) => {
    let result: boolean = true;
    for (let key in validation) {
        if (validation[key] !== "" && !_.isUndefined(validation[key])) {
            result = false;
        }
    }
    return result;
}

export const checkFormValidation = (state: IAccessMediator) => {
    let formValidationResult: any = {};
    switch (state.data.UploadType.toUpperCase()) {
        case "RND": {
            formValidationResult = checkRnDForm(state);
            break;
        }
        case "LL": {
            formValidationResult = checkLLForm(state);
            break;
        }
        case "THESIS": {
            formValidationResult = checkThesisForm(state);
            break;
        }
        case "PAPER": {
            formValidationResult = checkPaperForm(state);
            break;
        }
    }
    return formValidationResult;
}

export const checkRnDForm = (state: IAccessMediator) => {
    let result: any = {};
    // Title
    result = {
        ...result, ...checkTextInput({
            value: state.data.Title,
            fieldName: "Title",
            displayName: "title",
            checkRequired: true,
            minLength: 4,
            maxLength: 250
        })
    };

    if (state.status === ReportStatus.CLOSED) { // Restart
        // Authors
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: state.data.ReportAuthor.length > 0,
                fieldName: "ReportAuthor",
                displayName: "authors"
            })
        };

        //Notification
        const maxUserNotification = 50;
        result = {
            ...result, ...checkNotificationPickerValue({
                condition: (state.data.NotificationUsers.length <= maxUserNotification) ? true : false,
                fieldName: "NotificationUsers",
                displayName: "NotificationUsers",
                maxUserNotification: maxUserNotification
            })
        };
    }

    // Report Date
    result = {
        ...result, ...checkDatePickerValue({
            value: state.data.DocumentDate,
            fieldName: "DocumentDate",
            displayName: "report date",
            checkRequired: true,
            checkFutureDate: true
        })
    };

    // Report Type
    result = {
        ...result, ...checkDropdownListValue({
            condition: !_.isNil(state.data.DocumentType) && state.data.DocumentType !== "",
            fieldName: "ReportType",
            displayName: "report type"
        })
    };

    // Document Number
    result = {
        ...result, ...checkTextInput({
            value: state.data.DocumentNumber,
            fieldName: "DocumentNumber",
            displayName: "report number",
            checkRequired: false,
            maxLength: 250
        })
    };

    // Project Number
    result = {
        ...result, ...checkTextInput({
            value: state.data.ProjectNumber,
            fieldName: "ProjectNumber",
            displayName: "project number",
            checkRequired: false,
            maxLength: 250
        })
    };

    // Keywords
    result = {
        ...result, ...checkTextInput({
            value: state.data.FeberKeywords,
            fieldName: "FeberKeywords",
            displayName: "keywords",
            checkRequired: true,
            minLength: 10
        })
    };

    // Abstract
    result = {
        ...result, ...checkTextInput({
            value: state.data.Abstract,
            fieldName: "Abstract",
            displayName: "abstract",
            checkRequired: true
        })
    };
    return result;
}

export const checkLLForm = (state: IAccessMediator) => {
    let result: any = {};
    // Title
    result = {
        ...result, ...checkTextInput({
            value: state.data.Title,
            fieldName: "Title",
            displayName: "title",
            checkRequired: true,
            minLength: 4,
            maxLength: 250
        })
    };

    if (state.status === ReportStatus.CLOSED) { // Restart
        // Authors
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: state.data.ReportAuthor.length > 0,
                fieldName: "ReportAuthor",
                displayName: "authors"
            })
        };
    }
    // Exceptional case for BSH
    if (state.data.Division.toUpperCase() === "BSH") {
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: !_.isNil(state.data.ROU),
                fieldName: "ROU",
                displayName: "approver"
            })
        };
    }

    // Report Date
    result = {
        ...result, ...checkDatePickerValue({
            value: state.data.DocumentDate,
            fieldName: "DocumentDate",
            displayName: "report date",
            checkRequired: true,
            checkFutureDate: true,
        })
    };

    // Keywords
    result = {
        ...result, ...checkTextInput({
            value: state.data.FeberKeywords,
            fieldName: "FeberKeywords",
            displayName: "keywords",
            checkRequired: true,
            minLength: 10
        })
    };

    const process = (!_.isNil(state.data.Process)) ? (state.data.Process as string).trim() : "";
    const product = (!_.isNil(state.data.Process)) ? (state.data.Product as string).trim() : "";
    if (process === "" && product === "") {
        // Process
        result = {
            ...result, ...checkTextInput({
                value: process,
                fieldName: "Process",
                displayName: "process",
                checkRequired: true
            })
        };

        // Product
        result = {
            ...result, ...checkTextInput({
                value: product,
                fieldName: "Product",
                displayName: "product",
                checkRequired: true
            })
        };
    }
    else {
        // Process
        result = {
            ...result, ...checkTextInput({
                value: process,
                fieldName: "Proccess",
                displayName: "process",
                checkRequired: false,
                maxLength: 250
            })
        };

        // Product
        result = {
            ...result, ...checkTextInput({
                value: product,
                fieldName: "Product",
                displayName: "product",
                checkRequired: false,
                maxLength: 250
            })
        };
    }

    // Plant/BU
    result = {
        ...result, ...checkTextInput({
            value: state.data.PlantorBU,
            fieldName: "PlantorBU",
            displayName: "Plant/BU",
            checkRequired: true
        })
    };

    // IQIS Number
    result = {
        ...result, ...checkTextInput({
            value: state.data.IQISNumber,
            fieldName: "IQISNumber",
            displayName: "IQIS number",
            checkRequired: false,
            maxLength: 250,
        })
    };
    return result;
}

export const checkThesisForm = (state: IAccessMediator) => {
    let result: any = {};
    // Title
    result = {
        ...result, ...checkTextInput({
            value: state.data.Title,
            fieldName: "Title",
            displayName: "title",
            checkRequired: true,
            minLength: 4,
            maxLength: 250
        })
    };

    if (state.status === ReportStatus.CLOSED) { // Restart
        // Authors
        if(state.checkBoxChecked === true){
            result = {
                ...result, ...checkPeoplePickerValue({
                    condition: true,
                    fieldName: "ReportAuthor",
                    displayName: "authors"
                })
            };
        }
        else {
            result = {
                ...result, ...checkPeoplePickerValue({
                    condition: state.data.ReportAuthor.length > 0,
                    fieldName: "ReportAuthor",
                    displayName: "authors"
                })
            };
        }

        
        //Notification
        const maxUserNotification = 50;
        result = {
            ...result, ...checkNotificationPickerValue({
                condition: (state.data.NotificationUsers.length <= maxUserNotification) ? true : false,
                fieldName: "NotificationUsers",
                displayName: "NotificationUsers",
                maxUserNotification: maxUserNotification
            })
        };
    }

    if (state.status === ReportStatus.CLOSED) { // Restart
        // Authors Display Name
        if(state.checkBoxChecked === true) {
            result = {
                ...result, ...checkTextInput({
                    value: state.data.FeberAuthorDisplayName,
                    fieldName: "FeberAuthorDisplayName",
                    displayName: "Author Display Name",
                    checkRequired: true,
                    minLength: 4,
                    maxLength: 250
                })
            }
        }

        //Notification
        const maxUserNotification = 50;
        result = {
            ...result, ...checkNotificationPickerValue({
                condition: (state.data.NotificationUsers.length <= maxUserNotification) ? true : false,
                fieldName: "NotificationUsers",
                displayName: "NotificationUsers",
                maxUserNotification: maxUserNotification
            })
        };
    }

    // Report Date
    result = {
        ...result, ...checkDatePickerValue({
            value: state.data.DocumentDate,
            fieldName: "DocumentDate",
            displayName: "report date",
            checkRequired: true,
            checkFutureDate: true
        })
    };

    // Report Type
    result = {
        ...result, ...checkDropdownListValue({
            condition: !_.isNil(state.data.DocumentType) && state.data.DocumentType !== "",
            fieldName: "DocumentType",
            displayName: "report type",
        })
    };

    // Keywords
    result = {
        ...result, ...checkTextInput({
            value: state.data.FeberKeywords,
            fieldName: "FeberKeywords",
            displayName: "keywords",
            checkRequired: true,
            minLength: 10
        })
    };

    // Abstract
    result = {
        ...result, ...checkTextInput({
            value: state.data.Abstract,
            fieldName: "Abstract",
            displayName: "abstract",
            checkRequired: true
        })
    };
    return result;
}

export const checkPaperForm = (state: IAccessMediator) => {
    let result: any = {};
    // Attached Url
    result = {
        ...result, ...checkLinkValue({
            value: state.data.AttachedUrl,
            fieldName: "AttachedUrl",
            displayName: "url",
            checkRequired: state.data.HasAttachment === false,
        })
    };

    // Title
    result = {
        ...result, ...checkTextInput({
            value: state.data.Title,
            fieldName: "Title",
            displayName: "title",
            checkRequired: true,
            minLength: 4,
            maxLength: 250
        })
    };

    if (state.status === ReportStatus.CLOSED) { // Restart
        // Authors
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: state.data.ReportAuthor.length > 0,
                fieldName: "ReportAuthor",
                displayName: "authors"
            })
        };

        //Notification
        const maxUserNotification = 50;
        result = {
            ...result, ...checkNotificationPickerValue({
                condition: (state.data.NotificationUsers.length <= maxUserNotification) ? true : false,
                fieldName: "NotificationUsers",
                displayName: "NotificationUsers",
                maxUserNotification: maxUserNotification
            })
        };
    }

    // Report Date
    result = {
        ...result, ...checkDatePickerValue({
            value: state.data.DocumentDate,
            fieldName: "DocumentDate",
            displayName: "report date",
            checkRequired: true,
            checkFutureDate: true
        })
    };

    // Report Type
    result = {
        ...result, ...checkDropdownListValue({
            condition: state.data.DocumentType,
            fieldName: "DocumentType",
            displayName: "report type",
        })
    };

    if (!_.isNil(state.data.DocumentType)) {
        switch (state.data.DocumentType.toUpperCase()) {
            case "CONFERENCE PAPER": {
                // Name of conference
                result = {
                    ...result, ...checkTextInput({
                        value: state.data.NameOfConference,
                        fieldName: "NameOfConference",
                        displayName: "name of conference",
                        checkRequired: true,
                        minLength: 5,
                        maxLength: 250
                    })
                };
                // Location of conference
                result = {
                    ...result, ...checkTextInput({
                        value: state.data.LocationOfConference,
                        fieldName: "LocationOfConference",
                        displayName: "location of conference",
                        checkRequired: true,
                        minLength: 4
                    })
                };
                // Date of conference
                result = {
                    ...result, ...checkDatePickerValue({
                        value: state.data.DateOfConference,
                        fieldName: "DateOfConference",
                        displayName: "date of conference",
                        checkRequired: true,
                        checkFutureDate: true
                    })
                };
                break;
            }
            case "JOURNAL PAPER": {
                // Name of journal
                result = {
                    ...result, ...checkTextInput({
                        value: state.data.NameOfJournal,
                        fieldName: "NameOfJournal",
                        displayName: "name of journal",
                        checkRequired: true,
                        minLength: 5,
                        maxLength: 250
                    })
                };
                // Date of publication
                result = {
                    ...result, ...checkDatePickerValue({
                        value: state.data.DateOfPublication,
                        fieldName: "DateOfPublication",
                        displayName: "date of publication",
                        checkRequired: true,
                        checkFutureDate: true
                    })
                };
                break;
            }
        }
    }

    // Keywords
    result = {
        ...result, ...checkTextInput({
            value: state.data.FeberKeywords,
            fieldName: "FeberKeywords",
            displayName: "keywords",
            checkRequired: true,
            minLength: 10
        })
    };

    // Abstract
    result = {
        ...result, ...checkTextInput({
            value: state.data.Abstract,
            fieldName: "Abstract",
            displayName: "abstract",
            checkRequired: true
        })
    };
    return result;
}