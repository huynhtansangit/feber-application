import _ from "lodash";
import Helper from "../../core/libraries/Helper";
import { checkDatePickerValue, checkDropdownListValue, checkEmptyObject, checkFile, checkGroupManagerPickerValue, checkLinkValue, checkNotificationPickerValue, checkPeoplePickerValue, checkRadioValue, checkTextInput } from "../../core/libraries/Validation";
import { IProperty } from "../access-mediator/types";
import { Types } from "./actions";
import { IStep, IUpload, IResponibleDepartment } from "./types";
import Constants from "../../core/libraries/Constants";
import { IUserProfile } from "../permission/types";

const initialState: IUpload = {
    steps: [],
    commonReport: {
        UploadType: "",
        RelForForeignTradeLegislation: false,
        SecurityClass: "1 Internal",
        ReportAuthor: [],
        NotificationUsers: [],
        checkBoxChecked: false,
        //ROU: null
    },
    mode: "user",
    validation: {},
    RnDReportTypes: [],
    ThesisReportTypes: [],
    PaperReportTypes: [],
    rouLists: [],
    changedAuthor: true,
    //checkBoxChecked: false
    GroupManagerList: []
};
type datatype = any;
export const UploadReducer = (state: IUpload = initialState, action: { type: string, data: datatype }) => {
    switch (action.type) {
        case Types.INIT: {
            let result: IUpload = JSON.parse(JSON.stringify(initialState));
            result.steps = [...CommonSteps.map(step => { return { ...step } })];
            result.commonReport = { ...initialState.commonReport };
            result.mode = action.data;
            return result;
        }
        case Types.UPDATE_FIELD: {
            let property: IProperty = action.data;
            let result: IUpload = Object.assign({}, state);
            let commonReport = { ...state.commonReport };
            switch (property.field) {
                case "UploadType": {
                    commonReport[property.field] = property.value;
                    result.steps = [...CommonSteps.map(step => { return { ...step } })];
                    result.rouLists = [];
                    commonReport.ReportType = null;
                    commonReport.RelForForeignTradeLegislation = false;
                    commonReport.SecurityClass = "1 Internal";
                    commonReport.ROU = null;
                    result.changedAuthor = true;
                    break;
                }
                case "checkBoxChecked": {
                    commonReport[property.field] = property.value;
                    result.changedAuthor = true;
                    break;
                }
                case "FeberAuthorDisplayName": {
                    commonReport[property.field] = property.value;
                    result.changedAuthor = true;
                    break;
                }
                case "ReportAuthor": {
                    commonReport[property.field] = property.value;
                    result.changedAuthor = true;
                    break;
                }
                case "NotificationUsers": {
                    commonReport[property.field] = property.value;
                    break;
                }
                case "RelForForeignTradeLegislation": {
                    commonReport[property.field] = property.value;
                    commonReport.SecurityClass = (!!property.value) ? Constants.SECURITY_CLASS_LONG_NAME.SC3 : commonReport.SecurityClass;
                    break;
                }
                case "ROU": {
                    if (commonReport.Division !== "BSH") {
                        const value: IResponibleDepartment = property.value;
                        commonReport.ROU = value.ROU;
                        commonReport.Division = value.Division;
                        commonReport.FeberDepartment = value.Department;
                    }
                    else {
                        commonReport.ROU = property.value;
                    }
                    break;
                }
                case "GroupManager": {
                    const value: IResponibleDepartment = property.value;
                    commonReport.GroupManager = value.ROU;
                    commonReport.GroupDivision = value.Division;
                    commonReport.GroupDepartment = value.Department;
                    break;
                }
                case "GroupManagerList": {
                    result.GroupManagerList = [];
                    break;
                }
                default: {
                    commonReport[property.field] = property.value;
                    break;
                }
            }
            result.commonReport = commonReport;
            return result;
        }
        case Types.INIT_STEPS: {
            let uploadType = action.data;
            let result: IUpload = Object.assign({}, state);
            switch (uploadType) {
                case "LL": {
                    result.steps = CommonSteps.filter(step => step.label !== "Accessibility"
                        && step.label !== "Abstract");
                    break;
                }
                default: {
                    result.steps = CommonSteps;
                    break;
                }
            }
            let newSteps: any[] = [];
            result.steps.forEach(step => {
                newSteps.push(Object.assign({}, step));
            });
            result.steps = newSteps;
            return result;
        }
        case Types.UPDATE_STEP: {
            let updatedStep: IStep = action.data;
            let result: IUpload = Object.assign({}, state);
            let newSteps: any[] = [];
            result.steps.forEach(step => {
                if (step.label === updatedStep.label) {
                    newSteps.push(Object.assign({}, updatedStep));
                }
                else {
                    newSteps.push({ ...step, isSelected: false });
                }
            });
            result.steps = newSteps;
            return result;

        }
        case Types.VALIDATE_UPLOAD_DATA: {
            let result: IUpload = Object.assign({}, state);
            result.validation = checkTabValidation(state);

            let isValid = false;

            if (checkEmptyObject(result.validation)) {
                isValid = true;
            }

            Helper.runNewTask(() => {
                action.data.callback(isValid);
            });
            return result;
        }

        case Types.SET_REPORT_TYPES: {
            let result: IUpload = Object.assign({}, state);
            (result as any)[action.data.uploadType + "ReportTypes"] = action.data.reportTypes;
            return result;
        }

        case Types.SET_ROU_LIST: {
            let property = action.data;
            let result: IUpload = Object.assign({}, state);
            result.rouLists = property.result;
            //Filter rouLists have same Department (As case Many Authors in same department) 
            let departmentList = result.rouLists.map(data => data.Department)
            let filteredRouLists = result.rouLists.filter(({Department}, index) => !departmentList.includes(Department, index + 1))

            const rouLists = [...filteredRouLists.map(rou => Object.assign({}, rou))];
            //const rouLists = [...state.rouLists.map(rou => Object.assign({}, rou))]; -- Old code last sprint of 2020
            let newResultList = action.data.result as IResponibleDepartment[];
            // Limit the result if in admin mode
            if (result.mode === "admin") {
                const userProfile = action.data.userProfile as IUserProfile;
                if (userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
                    newResultList = newResultList.filter(r => r.Division === userProfile.permissions.checkRnDDivisionAdmin.divisionCode
                        || r.Division === userProfile.permissions.checkRnDDivisionAdmin.divisionTitle);
                }
                if (userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN])) {
                    newResultList = newResultList.filter(r => r.Division === userProfile.permissions.checkLLDivisionAdmin.divisionCode
                        || r.Division === userProfile.permissions.checkLLDivisionAdmin.divisionTitle);
                }
            }
            // Check unique
            newResultList.forEach((rs: IResponibleDepartment) => {
                if (rouLists.length === 0) {
                    rouLists.push(rs);
                }
                else if (rouLists.filter(rou => rou.ROU.Id === rs.ROU.Id).length === 0) {
                    rouLists.push(rs);
                }
            });
            result.rouLists = rouLists;
            // Check fisr loading, get first returned value
            if (result.rouLists.length > 0 && !result.commonReport.ROU) {
                result.commonReport.ROU = result.rouLists[0].ROU;
                result.commonReport.Division = result.rouLists[0].Division;
                result.commonReport.FeberDepartment = result.rouLists[0].Department;
            }
            // Check second load, set first result if changing department
            if (action.data.shouldSetFirstValue === true && newResultList.length > 0) {
                result.commonReport.ROU = newResultList[0].ROU;
                result.commonReport.Division = newResultList[0].Division;
                result.commonReport.FeberDepartment = newResultList[0].Department;
            }
            // Exception for BSH
            const bshROUList = result.rouLists.filter(r => r.Division === "BSH");
            if (bshROUList.length > 0 && result.commonReport.UploadType === Constants.DOCUMENT_TYPE.LL) {
                result.commonReport.ROU = null;
                result.commonReport.Division = bshROUList[0].Division;
                result.commonReport.FeberDepartment = bshROUList[0].Department;
            }

            result.changedAuthor = false;
            Helper.runNewTask(() => {
                if (!!action.data.callback) {
                    action.data.callback(result.rouLists);
                }
            });
            return result;
        }

        case Types.SET_GM_LIST: {
            let property = action.data;
            let result: IUpload = Object.assign({}, state);
            result.GroupManagerList = property.result;

            //Filter rouLists have same Department (As case Many Authors in same department) 
            let departmentList = result.GroupManagerList.map(data => data.Department)
            let filteredGroupManagerList = result.GroupManagerList.filter(({Department}, index) => !departmentList.includes(Department, index + 1))

            const GroupManagerList = [...filteredGroupManagerList.map(rou => Object.assign({}, rou))];
            let newResultList = action.data.result as IResponibleDepartment[];

            // Check unique
            newResultList.forEach((rs: IResponibleDepartment) => {
                if (GroupManagerList.length === 0) {
                    GroupManagerList.push(rs);
                }
                else if (GroupManagerList.filter(rou => rou.ROU.Id === rs.ROU.Id).length === 0) {
                    GroupManagerList.push(rs);
                }
            });
        
            result.GroupManagerList = GroupManagerList;
            // Check fisr loading, get first returned value
            let GroupManagerListFilter = GroupManagerList.filter(rou => rou.Division === "CR");
            if (GroupManagerListFilter.length > 0 && !result.commonReport.GroupManager) {
                
                result.commonReport.GroupManager = GroupManagerListFilter[0].ROU;
                result.commonReport.GroupDivision = GroupManagerListFilter[0].Division;
                result.commonReport.GroupDepartment = GroupManagerListFilter[0].Department;
            }
            // Check second load, set first result if changing department
            if (action.data.shouldSetFirstValue === true && newResultList.length > 0) {
                result.commonReport.GroupManager = newResultList[0].ROU;
                result.commonReport.GroupDivision = newResultList[0].Division;
                result.commonReport.GroupDepartment = newResultList[0].Department;
            }
            result.changedAuthor = false;
            Helper.runNewTask(() => {
                if (!!action.data.callback) {
                    action.data.callback(result.GroupManagerList);
                }
            });
            return result;           
        }

        case Types.SET_LL_DIVISION_ADMIN: {
            let result: IUpload = Object.assign({}, state);
            result.commonReport = { ...state.commonReport };
            result.commonReport.LLDivisionAdmin = (!!action.data.result) ? { ...action.data.result } : null;
            Helper.runNewTask(() => {
                if (!!action.data.callback) {
                    action.data.callback();
                }
            });
            return result;
        }
        case Types.CALLBACK_UPLOAD_REPORT: {
            Helper.runNewTask(() => {
                if (!!action.data.callback) {
                    action.data.callback(action.data.result);
                }
            });
        }
        
    }
    return state;

};
export const checkTabValidation = (state: IUpload) => {
    let formValidationResult: any = {};
    switch (state.steps.find(step => step.isSelected === true).label) {
        case "Upload": {
            formValidationResult = checkUploadTab(state);
            break;
        }
        case "Properties": {
            formValidationResult = checkPropertiesTab(state);
            break;
        }
        case "Accessibility": {
            formValidationResult = checkAccessibilityTab(state);
            break;
        }
        case "Abstract": {
            formValidationResult = checkAbstractTab(state);
            break;
        }
        case "Release": {
            formValidationResult = checkReleaseTab(state);
            break;
        }

    }
    return formValidationResult;
}
export const checkUploadTab = (state: IUpload) => {
    let result: any = {};
    //Radio button
    result = {
        ...result, ...checkRadioValue({
            value: (state.commonReport.UploadType !== null) ? state.commonReport.UploadType : null,
            fieldName: "UploadType",
            displayName: "uploadtype",
            checkRequired: true,
        })
    };

    if (!!state.commonReport.UploadType) {
        if (state.commonReport.UploadType === "Paper") {
            // Url
            result = {
                ...result, ...checkLinkValue({
                    value: (!!state.commonReport.AttachedUrl) ? state.commonReport.AttachedUrl : null,
                    fieldName: "AttachedUrl",
                    displayName: "url",
                    checkRequired: true,
                })
            };
        }
        else {
            //File
            result = {
                ...result, ...checkFile({
                    value: (!!state.commonReport.Attachment) ? state.commonReport.Attachment.name : "",
                    fieldName: "Attachment",
                    displayName: "attachment",
                    checkRequired: true,
                })
            };
        }
    }
    return result;
}
export const checkPropertiesTab = (state: IUpload) => {
    let result: any = {};
    // Title
    result = {
        ...result, ...checkTextInput({
            value: (!!state.commonReport.Title) ? state.commonReport.Title : null,
            fieldName: "Title",
            displayName: "title",
            checkRequired: true,
            minLength: 4,
            maxLength: 250
        })
    };

    //Authors
    if(state.commonReport.checkBoxChecked === true)
    {
        
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: (!!state.commonReport.ReportAuthor) ? (state.commonReport.ReportAuthor.length > 0) : true,
                fieldName: "ReportAuthor",
                displayName: "authors"
            })
        };
    }
    else
    {
        result = {
            ...result, ...checkPeoplePickerValue({
                condition: (!!state.commonReport.ReportAuthor) ? (state.commonReport.ReportAuthor.length > 0) : false,
                fieldName: "ReportAuthor",
                displayName: "authors"
            })
        };
    }

    // FeberAuthorDisplayName
    if(state.commonReport.checkBoxChecked === true)
    {
        result = {
            ...result, ...checkTextInput({
                value: (!!state.commonReport.FeberAuthorDisplayName) ? state.commonReport.FeberAuthorDisplayName : null,
                fieldName: "FeberAuthorDisplayName",
                displayName: "Author Name",
                checkRequired: true,
                minLength: 4,
                maxLength: 250
            })
        };
    }

    // Report Date
    result = {
        ...result, ...checkDatePickerValue({
            value: (!!state.commonReport.DocumentDate) ? state.commonReport.DocumentDate : null,
            fieldName: "DocumentDate",
            displayName: "report date",
            checkRequired: true,
            checkFutureDate: true
        })
    };
    switch (state.commonReport.UploadType) {
        case "RnD": {
            // Report Type
            result = {
                ...result, ...checkDropdownListValue({
                    condition: !_.isNil(state.commonReport.DocumentType) && state.commonReport.DocumentType !== "",
                    fieldName: "DocumentType",
                    displayName: "report type"
                })
            };


            // Document Number
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.DocumentNumber) ? state.commonReport.DocumentNumber : null,
                    fieldName: "DocumentNumber",
                    displayName: "report number",
                    checkRequired: false,
                    maxLength: 250
                })
            };

            // Project Number
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.ProjectNumber) ? state.commonReport.ProjectNumber : null,
                    fieldName: "ProjectNumber",
                    displayName: "project number",
                    checkRequired: false,
                    maxLength: 250
                })
            };
            break;
        }
        case "LL": {
            // Keywords
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.FeberKeywords) ? state.commonReport.FeberKeywords : null,
                    fieldName: "FeberKeywords",
                    displayName: "keywords",
                    checkRequired: true,
                    minLength: 10
                })
            };

            let requiredProcess = true;
            let requiredProduct = true;
            if ((!!state.commonReport.Process)) {
                if (state.commonReport.Process.length !== 0) {
                    requiredProduct = false;
                }

            }
            if ((!!state.commonReport.Product)) {
                if (state.commonReport.Product.length !== 0) {
                    requiredProcess = false;
                }
            }

            //Process
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.Process) ? state.commonReport.Process : null,
                    fieldName: "Process",
                    displayName: "process",
                    checkRequired: requiredProcess,
                    maxLength: 250,

                })
            };
            //Product
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.Product) ? state.commonReport.Product : null,
                    fieldName: "Product",
                    displayName: "product",
                    checkRequired: requiredProduct,
                    maxLength: 250,

                })
            };
            //Plant/BU
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.PlantorBU) ? state.commonReport.PlantorBU : null,
                    fieldName: "PlantorBU",
                    displayName: "Plant/BU",
                    checkRequired: true,
                    maxLength: 250,

                })
            };
            //IQIS number
            result = {
                ...result, ...checkTextInput({
                    value: (!!state.commonReport.IQISNumber) ? state.commonReport.IQISNumber : null,
                    fieldName: "IQISNumber",
                    displayName: "IQISNumber",
                    maxLength: 250,

                })
            };
            break;
        }
        case "Thesis": {
            // Report Type
            result = {
                ...result, ...checkDropdownListValue({
                    condition: !_.isNil(state.commonReport.DocumentType) && state.commonReport.DocumentType !== "",
                    fieldName: "DocumentType",
                    displayName: "report type"
                })
            };
            break;
        }
        case "Paper": {
            // Report Type
            result = {
                ...result, ...checkDropdownListValue({
                    condition: !_.isNil(state.commonReport.DocumentType) && state.commonReport.DocumentType !== "",
                    fieldName: "DocumentType",
                    displayName: "report type"
                })
            };
            if (state.commonReport.DocumentType === "Conference Paper") {

                //Name of conference 
                result = {
                    ...result, ...checkTextInput({
                        value: (!!state.commonReport.NameOfConference) ? state.commonReport.NameOfConference : null,
                        fieldName: "NameOfConference",
                        displayName: "name of conference",
                        checkRequired: true,
                        minLength: 5,
                        maxLength: 250,

                    })
                };

                //Location of conference 
                result = {
                    ...result, ...checkTextInput({
                        value: (!!state.commonReport.LocationOfConference) ? state.commonReport.LocationOfConference : null,
                        fieldName: "LocationOfConference",
                        displayName: "location of conference",
                        checkRequired: true,
                        minLength: 4,
                        maxLength: 250,

                    })
                };
                // Date of conference
                result = {
                    ...result, ...checkDatePickerValue({
                        value: (!!state.commonReport.DateOfConference) ? state.commonReport.DateOfConference : null,
                        fieldName: "DateOfConference",
                        displayName: "date of conference",
                        checkRequired: true,
                        checkFutureDate: true
                    })
                };
            }
            if (state.commonReport.DocumentType === "Journal Paper") {
                //Name of journal 
                result = {
                    ...result, ...checkTextInput({
                        value: (!!state.commonReport.NameOfJournal) ? state.commonReport.NameOfJournal : null,
                        fieldName: "NameOfJournal",
                        displayName: "name of journal",
                        checkRequired: true,
                        minLength: 5,
                        maxLength: 250,

                    })
                };
                // Date of publication
                result = {
                    ...result, ...checkDatePickerValue({
                        value: (!!state.commonReport.DateOfPublication) ? state.commonReport.DateOfPublication : null,
                        fieldName: "DateOfPublication",
                        displayName: "date of publication",
                        checkRequired: true,
                        checkFutureDate: true
                    })
                };
            }
            break;
        }
        default: break;
    }
    return result;
}

export const checkAccessibilityTab = (state: IUpload) => {
    let result: any = {};
    if (state.commonReport.UploadType !== "LL") {
        // Security Class
        result = {
            ...result, ...checkDropdownListValue({
                condition: !_.isNil(state.commonReport.SecurityClass) && state.commonReport.SecurityClass !== "",
                fieldName: "SecurityClass",
                displayName: "security class"
            })
        };
    }
    return result;
}

export const checkAbstractTab = (state: IUpload) => {
    let result: any = {};
    if (state.commonReport.UploadType !== "LL") {
        // Keywords     
        result = {
            ...result, ...checkTextInput({
                value: (!!state.commonReport.FeberKeywords) ? state.commonReport.FeberKeywords : null,
                fieldName: "FeberKeywords",
                displayName: "keywords",
                checkRequired: true,
                minLength: 10
            })
        };

        // Abstract
        result = {
            ...result, ...checkTextInput({
                value: (!!state.commonReport.Abstract) ? state.commonReport.Abstract : null,
                fieldName: "Abstract",
                displayName: "abstract",
                checkRequired: true,
            })
        };
    }
    return result;
}

export const checkReleaseTab = (state: IUpload) => {
    let result: any = {};
    const maxUserNotification = 50;
    result = {
        ...result, ...checkDropdownListValue({
            condition: !_.isNil(state.commonReport.ROU) && state.commonReport.ROU !== "",
            fieldName: "ROU",
            displayName: "responsible department"
        })
    };

    //Notifications

    result = {
        ...result, ...checkNotificationPickerValue({
            condition: (state.commonReport.NotificationUsers.length <= maxUserNotification) ? true : false,
            fieldName: "NotificationUsers",
            displayName: "NotificationUsers",
            maxUserNotification: maxUserNotification
        })
    };

    //Strategic Portfolio Owner
    if(state.commonReport.Division === "CR" && state.commonReport.UploadType === "RnD") {
        result = {
            ...result, ...checkGroupManagerPickerValue({
                condition: state.commonReport.GroupManager.Id !== "" ? true : false,
                fieldName: "GroupManager",
                displayName: "Strategic Portfolio Owner"
            })
        };
    }
    return result;

}

export const CommonSteps: IStep[] = [
    {
        label: "Upload",
        icon: "document-arrow-up",
        valid: true,
        isSelected: true
    },

    {
        label: "Properties",
        icon: "document-add",
        valid: null,
        isSelected: false
    },
    {
        label: "Accessibility",
        icon: "document-locked",
        valid: null,
        isSelected: false
    },
    {
        label: "Abstract",
        icon: "document-edit",
        valid: null,
        isSelected: false
    },
    {
        label: "Release",
        icon: "document-cv",
        valid: null,
        isSelected: false
    },
    {
        label: "Summary",
        icon: "document-check",
        valid: null,
        isSelected: false
    }
];