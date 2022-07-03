import { IAccessMediatorValidator } from "../../store/access-mediator/types";
import _ from "lodash";

export enum ERROR_MESSAGE {

    // FORM VALIDATION: FOR UPLOAD AND ACCESS MEDIATOR
    // Attachment
    ATTACHMENT_PLEASE_UPLOAD = "Please upload a PDF file.",
    ATTACHMENT_INCORRECT_FILE_TYPE = "Wrong file type: only PDF supported",
    ATTACHMENT_INVALID_CHARACTERS = "The attached file has one of these invalid characters (~ . # % & * { } \\ : < > ? / | “). Kindly change the file name and upload again.",
    ATTACHMENT_MAXIMUM_FILE_NAME = "File name (include extension) is too long: only 128 characters supported",
    UPLOAD_TYPE_REQUIRED = "Please choose the type of knowledge you would like to share.",
    // Text field
    TEXT_INPUT_REQUIRED = "Please fill in the {token}.",
    TEXT_INPUT_MIN = "The minimum number of characters in this field is {token}.",
    TEXT_INPUT_MAX = "The maximum number of characters in this field is {token}.",
    //Dropdown list
    DROPDOWN_REQUIRED = "Please choose the {token}.",
    // People picker
    PEOPLE_PICKER_REQUIRED = "Please fill in the {token}.",
    EXCEED_AUTHORS="You can not fill over 5 authors",
    PEOPLE_PICKER_MAX = "The maximum number of notification users is {token}.",
    // Date picker
    DATE_PICKER_REQUIRED = "Please choose the {token}.",
    DATE_PICKER_PAST = "Please do not choose past date.",
    DATE_PICKER_FUTURE = "Please do not choose future date.",
    // Link
    LINK_REQUIRED = "Please fill in the {token}.",
    LINK_IS_URL = "Please fill in a valid link.",

    //Radio value
    RADIO_REQUIRED = "Please choose the type of knowledge you would like to share.",

    //File
    FILE_REQUIRED = "Please upload a PDF file",
    
};

// Text Input
export const checkTextInput = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    const value = (validationObj.value !== null) ? (validationObj.value as string).trim() : "";
    if (value === "" && validationObj.checkRequired === true) {
        // Is empty
        result[validationObj.fieldName] = ERROR_MESSAGE.TEXT_INPUT_REQUIRED.replace("{token}", validationObj.displayName);
    }
    else {
        // Is not empty
        // Check min
        if ((_.isUndefined(validationObj.minLength)) ? false : value.length < validationObj.minLength) {
            result[validationObj.fieldName] = ERROR_MESSAGE.TEXT_INPUT_MIN.replace("{token}", validationObj.minLength.toString());
        }
        // Check max
        if ((_.isUndefined(validationObj.maxLength)) ? false : value.length > validationObj.maxLength) {
            result[validationObj.fieldName] = ERROR_MESSAGE.TEXT_INPUT_MAX.replace("{token}", validationObj.maxLength.toString());
        }
    }
    return result;
}
// Dropdown list
export const checkDropdownListValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.condition === false) {
        result[validationObj.fieldName] = ERROR_MESSAGE.DROPDOWN_REQUIRED.replace("{token}", validationObj.displayName);
    }
    return result;
}
// People picker
export const checkPeoplePickerValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.condition === false) {
        result[validationObj.fieldName] = ERROR_MESSAGE.PEOPLE_PICKER_REQUIRED.replace("{token}", validationObj.displayName);
    }
    return result;
}
// Author picker
export const checkAuthorsPickerValue = (validationObj: any) => {
    let result: any = {};
    if (validationObj.condition === false) {
        result[validationObj.fieldName] = ERROR_MESSAGE.PEOPLE_PICKER_REQUIRED.replace("{token}", validationObj.displayName);
    }
    else {
        if (validationObj.length > 5 && validationObj.mode !== "admin") {
            result[validationObj.fieldName] = ERROR_MESSAGE.EXCEED_AUTHORS;
        }
    }
    return result;
}


// Date picker
export const checkDatePickerValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if ((validationObj.value === "" || _.isNil(validationObj.value)) && validationObj.checkRequired === true) {
        // Is empty
        result[validationObj.fieldName] = ERROR_MESSAGE.DATE_PICKER_REQUIRED.replace("{token}", validationObj.displayName);
    }
    else {
        // Is not empty
        let today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        today.setSeconds(59);
        // Check past
        if ((_.isUndefined(validationObj.checkPastDate)) ? false : new Date(validationObj.value) < today) {
            result[validationObj.fieldName] = ERROR_MESSAGE.DATE_PICKER_PAST;
        }
        // Check future
        if ((_.isUndefined(validationObj.checkFutureDate)) ? false : new Date(validationObj.value) > today) {
            result[validationObj.fieldName] = ERROR_MESSAGE.DATE_PICKER_FUTURE;
        }
    }
    return result;
}
// Link
export const checkLinkValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.value === "" && validationObj.checkRequired === true) {
        // Is empty
        result[validationObj.fieldName] = ERROR_MESSAGE.LINK_REQUIRED.replace("{token}", validationObj.displayName);
    }
    else {
        // Is not empty
        if (validationObj.value !== "" && !checkUrl(validationObj.value)) {
            result[validationObj.fieldName] = ERROR_MESSAGE.LINK_IS_URL;
        }
    }
    return result;
}

export const checkUrl = (str: string) => {
    // eslint-disable-next-line
    let regexp: RegExp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
}



//Check radio button selected 
export const checkRadioValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.value === "" && validationObj.checkRequired === true) {
        // Is empty
        result[validationObj.fieldName] = ERROR_MESSAGE.RADIO_REQUIRED;
    }

    return result;
}


//Check choose file
export const checkFile = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.value === "" && validationObj.checkRequired === true) {
        // Is empty
        result[validationObj.fieldName] = ERROR_MESSAGE.FILE_REQUIRED;
    }
    return result;
}

// Notification Release
export const checkNotificationPickerValue = (validationObj: any) => {
    let result: any = {};
    if (validationObj.condition === false) {
        result[validationObj.fieldName] = ERROR_MESSAGE.PEOPLE_PICKER_MAX.replace("{token}", validationObj.maxUserNotification).toString();;
    }
    
    return result;
}

export const checkEmptyObject = (obj: any) => {
    for (var key in obj) {
        if (obj[key] !== "")
            return false;
    }
    return true;

}

export const checkGroupManagerPickerValue = (validationObj: IAccessMediatorValidator) => {
    let result: any = {};
    if (validationObj.condition === false) {
        result[validationObj.fieldName] = "Strategic Portfolio Owner could not be empty.";
    }
    return result;
}
