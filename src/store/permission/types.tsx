export interface IPermission {
    userProfile: IUserProfile | undefined;
}

export interface IUserProfile {
    id: number;
    name: string;
    loginName: string;
    email: string;
    groups: any[];
    division?: string;
    department?: string;
    approverId?: string;
    approverName?: string;
    userToken?: string;
    permissions?: IUserPermissions;
    expires_in?: number;
    issued?: string;
    expires?: string;
}

export interface IUserPermissions {
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    checkRnDDivisionAdmin?: IDivisionAdminInfo;
    checkLLDivisionAdmin?: IDivisionAdminInfo;
    isLLAdmin?: boolean;
    isThesisAdmin?: boolean;
    isPaperAdmin?: boolean;
    isRnDUser?: boolean;
    rndGroup?: string;
    checkHasPermission: (permissions: string[]) => boolean;
    checkHasDivisionAdminPermission: (type: string, divisionCode: string, divisionTitle: string) => boolean;
}

export interface IDivisionAdminInfo {
    isAdmin?: boolean;
    divisionCode?: string;
    divisionTitle?: string;
}