export enum PageName {
    ACCESS_MEDIATOR = "ACCESS_MEDIATOR",
    ORDER = "ORDER",
    NON_RND_USER = "NON_RND_USER",
    NOT_FOUND = "NOT_FOUND"
}

export enum ReportStatus {
    PUBLISHED = "Published",
    PENDING = "Pending",
    CLOSED = "Closed",
    NOT_FOUND = "Not found"
}

export interface IAccessMediator {
    page: string,
    mode: string;
    data: any;
    error: string,
    validation: any;
    securityClasses: any[];
    reportTypes: any[];
    status: string;
    checkBoxChecked?: boolean;
    isFirstLoad?: boolean
}

export interface IAccessMediatorValidator {
    fieldName: string;
    displayName: string;
    value?: any;
    checkRequired?: boolean;
    condition?: boolean;
    checkPastDate?: boolean;
    checkFutureDate?: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface IProperty {
    field: string;
    value: any;
}