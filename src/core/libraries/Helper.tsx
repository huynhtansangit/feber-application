import Constants from './Constants';
import Environment from '../../Environment';
import _ from 'lodash';

class Helper {

    // GENERAL FUNCTIONS
    static getDateTimeFormatForUI(data: any, isShort: boolean = false) {
        if (_.isNil(data)) {
            return "";
        }
        else if (typeof data === "string") {
            data = new Date(data);
        }
        let monthNames: string[] = []
        if (isShort === true) {
            monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
        }
        else {
            monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
        }
        return ((isShort === true) ? ((data.getDate() < 10) ? "0" : "") + data.getDate() : data.getDate())
            + " " + monthNames[data.getMonth()]
            + ", " + data.getFullYear();
    }

    static getDateTimeFormatForList(data: any) {
        return data.toLocaleString('en-US', { hour12: true });
    }

    static getLastDate(year: number, month: number) {
        let date = new Date(year, month + 1, 0);
        return date.getDate();
    }

    static parseDate(value: any) {
        if (value === "" || _.isNil(value)) {
            return null;
        }
        else if (value instanceof Date) {
            return value;
        }
        return new Date(value);
    }

    static sortObjects(items: any[], property: string, isAccending: boolean = true) {
        let result = items.sort((a: any, b: any) => {
            let _a = Object.assign({}, a);
            let _b = Object.assign({}, b);
            if (isNaN(_a) && isNaN(_b)) {
                _a[property] = _a[property].toLowerCase();
                _b[property] = _b[property].toLowerCase();
            }
            if (isAccending === true) {
                if (_a[property] > _b[property]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            else {
                if (_a[property] < _b[property]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        });
        return result;
    }

    static encodeCustomized(text: string) {
        let result = text;
        // Replace %
        result = result.replace(/%/g, "___percent___");
        return result;
    }

    static decodeCustomized(text: string) {
        let result = text;
        // Replace %
        result = result.replace(/___percent___/g, "%");
        return result;
    }

    static uniqueStringArray(arr: string[]) {
        let results: string[] = [];
        _.forEach(arr, (item: any) => {
            if (results.length === 0
                || (results.length > 0 && results.indexOf(item) === -1)) {
                results.push(item);
            }
        });
        results.sort();
        return results;
    }

    static numberWithComma(value: any, isDecimal: boolean = false) {
        if (isDecimal === true) {
            let parts = value.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        } else {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    static generateYearsArray(yearRange: number = 10) {
        let result: any[] = [];
        let currentYear: number = (new Date()).getFullYear();
        for (let year = currentYear - yearRange; year <= currentYear + yearRange; year++) {
            result.push({ key: year, text: year });
        }
        return result;
    }

    static openDialog(url: string) {
        console.log(window.screen);
        window.open(url, "_blank", "width=" + (window.screen.availWidth / 3) * 2 + "px,height=" + (window.screen.availHeight / 3) * 2 + "px,centerscreen=yes,scrollbars=yes,resizable=yes");
    }

    static openNewTab(url: string) {
        window.open(url, "_blank");
    }

    static resizeColumnByScreenWidth(input: number) {
        return (input / 100 // Percentage
            * (document.body.clientWidth * 7 / 12)); // Screen real width - 2 X paddings
    }

    static runNewTask(func: any) {
        setTimeout(() => {
            func();
        }, 10);
    }

    static setEmptyIfNull(value: any) {
        return ((!_.isNil(value)) ? value : "");
    }

    static setZeroIfNull(value: any) {
        return ((!_.isNil(value)) ? value : 0);
    }

    static setEmptyArrayIfNull(value: any) {
        return ((!_.isNil(value)) ? value : []);
    }


    // FOR FEBER BUSINESS

    static getSCShortName(sc: string) {
        let result = "";
        switch (sc) {
            case Constants.SECURITY_CLASS_LONG_NAME.SC1: {
                result = Constants.SECURITY_CLASS_SHORT_NAME.SC1;
                break;
            }
            case Constants.SECURITY_CLASS_LONG_NAME.SC2: {
                result = Constants.SECURITY_CLASS_SHORT_NAME.SC2;
                break;
            }
            case Constants.SECURITY_CLASS_LONG_NAME.SC3: {
                result = Constants.SECURITY_CLASS_SHORT_NAME.SC3;
                break;
            }
        }
        return result;
    }

    static getSCLongName(sc: string) {
        let result = "";
        switch (sc) {
            case Constants.SECURITY_CLASS_SHORT_NAME.SC1: {
                result = Constants.SECURITY_CLASS_LONG_NAME.SC1;
                break;
            }
            case Constants.SECURITY_CLASS_SHORT_NAME.SC2: {
                result = Constants.SECURITY_CLASS_LONG_NAME.SC2;
                break;
            }
            case Constants.SECURITY_CLASS_SHORT_NAME.SC3: {
                result = Constants.SECURITY_CLASS_LONG_NAME.SC3;
                break;
            }
        }
        return result;
    }

    static getSCPostfix(sc: string) {
        let result = "";
        switch (sc) {
            case Constants.SECURITY_CLASS_LONG_NAME.SC1: {
                result = Constants.SECURITY_CLASS_POSTFIX.SC1;
                break;
            }
            case Constants.SECURITY_CLASS_LONG_NAME.SC2: {
                result = Constants.SECURITY_CLASS_POSTFIX.SC2;
                break;
            }
            case Constants.SECURITY_CLASS_LONG_NAME.SC3: {
                result = Constants.SECURITY_CLASS_POSTFIX.SC3;
                break;
            }
        }
        return result;
    }

    static getSCOptionsByDocumentType(documentType: string) {
        let result: any[] = [];
        switch (documentType) {
            case Constants.DOCUMENT_TYPE.RnD: {
                result = Constants.DD_SECURITY_CLASSES;
                break;
            }
            case Constants.DOCUMENT_TYPE.LL: {
                result = Constants.DD_SECURITY_CLASSES_ONLY_1;
                break;
            }
            case Constants.DOCUMENT_TYPE.Thesis: {
                result = Constants.DD_SECURITY_CLASSES_ONLY_2;
                break;
            }
            case Constants.DOCUMENT_TYPE.Paper: {
                result = Constants.DD_SECURITY_CLASSES_ONLY_1;
                break;
            }
            default: {
                break;
            }
        }
        return result;
    }

    static getListName(documentType: string, securityClass: string, department: string) {
        let departmentName = department.replace("/", "_");
        if (departmentName !== "NoDepartmentReports" && documentType !== Constants.DOCUMENT_TYPE.LL && documentType !== Constants.DOCUMENT_TYPE.Paper) {
            // RnD or Thesis
            return departmentName + this.getSCPostfix(securityClass);
        }
        // No department or LL or Paper
        return departmentName;
    }

    static getListNameUrl(type: string) {
        return type.replace("SP.Data.", "")
            .replace("ListItem", "")
            .replace("_x005f_", "_");
    }

    static getAccessGroups(documentType: string, securityClass: string, accessGroups: any, rouId: any, portfolioId: any) {
        let result = [];
        switch (documentType) {
            case Constants.DOCUMENT_TYPE.RnD: {
                switch (securityClass) {
                    case Constants.SECURITY_CLASS_LONG_NAME.SC2: {
                        result.push(accessGroups.RnDDivisionAdmin);
                        result.push(accessGroups.SC2Access);
                        result.push(rouId);
                        if(portfolioId != 0){
                            result.push(portfolioId);
                        }
                        break;
                    }
                    case Constants.SECURITY_CLASS_LONG_NAME.SC3: {
                        result.push(accessGroups.RnDDivisionAdmin);
                        result.push(accessGroups.SC3Access);
                        result.push(rouId);
                        if(portfolioId != 0){
                            result.push(portfolioId);
                        }
                        break;
                    }
                    case Constants.SECURITY_CLASS_LONG_NAME.SC1:
                    default: {
                        break;
                    }
                }
                break;
            }
            case Constants.DOCUMENT_TYPE.Thesis: {
                switch (securityClass) {
                    case Constants.SECURITY_CLASS_LONG_NAME.SC2: {
                        result.push(accessGroups.ThesisAdmin);
                        result.push(accessGroups.SC2Access);
                        result.push(rouId);
                        break;
                    }
                    case Constants.SECURITY_CLASS_LONG_NAME.SC1:
                    default: {
                        break;
                    }
                }
                break;
            }
        }
        return result;
    }

    static checkBookmarked(guid: string, itemsList: any[]) {
        let result = -1;
        itemsList.forEach(item => {
            if (item.Guid === guid) {
                result = item.Id;
            }
        });
        return result;
    }

    static getPeoplePickerString(ppsString: string, getNTID: boolean = false) {
        let result: any[] = [];
        if (ppsString !== "") {
            let pps = ppsString.split(";");
            pps.forEach(pp => {
                let ppArr = pp.split("|");
                result.push((getNTID === false) ?
                    ppArr[1].trim()
                    : ((ppArr[3].indexOf("\\") > -1) ?
                        ppArr[3].split("\\")[1].trim()
                        : ppArr[3].trim()));
            });
        }
        else {
            return "";
        }
        return result.join("; ");
    }

    static getPeopleFullName(ppsString: string) {
        let result: any[] = [];
        if (ppsString !== "") {
            let pps = ppsString.split(";");
            pps.forEach(pp => {
                let ppArr = pp.split("|");
                result.push(
                    ppArr[1].trim()
                );
            });
        }
        else {
            return "";
        }
        return result.join("; ");
    }

    static getPeoplePickerStringByObjectArray(data: any[]) {
        let result: string[] = [];
        if (!!data) {
            data.forEach((item: any) => {
                if (item !== null) {
                    result.push(item.Title);
                }
            });
        }
        return result.join("; ");
    }

    static mergeAuthors(authors: string, authorDisplayName: string) {
        let result = authors;
        if (!_.isNil(authorDisplayName) && authorDisplayName !== "") {
            if (authorDisplayName.indexOf(')') > -1) {
                // Remove Duplicated authors
                let authorsArr = authorDisplayName.split(')');
                for (let i = 0; i < authorsArr.length; i++) {
                    authorsArr[i] = authorsArr[i].replace(';', '').trim();
                    if (authorsArr[i].indexOf('(') >= 0) {
                        let authorName = authorsArr[i].split('(')[0].trim();
                        if (result.toUpperCase().trim().indexOf(authorName.toUpperCase()) === -1) {
                            result += ((result !== "") ? " ; " : "") + authorsArr[i] + ")";
                        }
                    }
                }
            }
            else { // Old data for Thesis and Paper does not have department with brackets
                let authorsArr = authorDisplayName.split(';');
                for (let i = 0; i < authorsArr.length; i++) {
                    if (result.toUpperCase().trim().indexOf(authorsArr[i].toUpperCase()) === -1) {
                        result += ((result !== "") ? " ; " : "") + authorsArr[i];
                    }
                }
            }
        }
        return result;
    }

    static checkExistInSystemLists(departmentName: string) {
        let systemLists: any[] = [
            "Composed Looks",
            "Master Page Gallery",
            "Documents",
            "Images",
            "Pages",
            "Site Assets",
            "Site Pages",
            "Workflow Tasks",
            "Microfeed",
            "MicroFeed",
            "Access Requests",
        ];
        let found = false;
        systemLists.forEach(systemList => {
            if (systemList === departmentName) {
                found = true;
            }
        });
        return found;
    }

    static generateAccessMediatorPathByGuid(guid: string) {
        return Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + guid;
    }

    static generateAMFilePathByGuid(guid: string) {
        return Environment.phaPageUrl + "AMFile.aspx?Guid=" + guid;
    }

    static changeSearchNumberOfResultsFromCache(value: number | null = null) {
        let result: any = 10;
        if (_.isNil(localStorage.getItem('Feber_ResultNumber'))) {
            localStorage.setItem("Feber_ResultNumber", "10");
        }
        if (!_.isNil(value)) {
            localStorage.setItem("Feber_ResultNumber", value.toString());
        }
        result = localStorage.getItem('Feber_ResultNumber');
        return parseInt(result);
    }

    static getUploadTypeDescription(uploadType: string) {
        let result = "";
        switch (uploadType) {
            case Constants.DOCUMENT_TYPE.RnD:
                {
                    result = "Research and Development";
                    break;
                }
            case Constants.DOCUMENT_TYPE.LL:
                {
                    result = "Lessons Learned";
                    break;
                }
            case Constants.DOCUMENT_TYPE.Thesis:
                {
                    result = Constants.DOCUMENT_TYPE.Thesis;
                    break;
                }
            case Constants.DOCUMENT_TYPE.Paper:
                {
                    result = Constants.DOCUMENT_TYPE.Paper;
                    break;
                }
        }
        return result;

    }

}
export default Helper;