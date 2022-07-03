import Environment from '../Environment';
import Constants from '../core/libraries/Constants';
import BaseService from './BaseService';
import "@pnp/polyfill-ie11";
import { Web, ISiteGroupInfo } from '@pnp/sp/presets/all';
import SystemService from './SystemService';
import { ISiteUserInfo } from '@pnp/sp/site-users/types';
import { currentUserIfo_TestData } from '../core/libraries/TestData';
import { IUserProfile, IUserPermissions, IDivisionAdminInfo } from '../store/permission/types';
import Axios from 'axios';
import IDMService from './IDMService';
import _ from 'lodash';

class PermissionsService extends BaseService {

    systemListsSrv: SystemService = new SystemService();

    idmSrv: IDMService = new IDMService();

    getCurrentUserInfo(): Promise<IUserProfile> {
        let promise: Promise<IUserProfile> = new Promise((resolve, reject) => {
            let web = Web(Environment.rootWeb);         
            web.currentUser.expand("Groups").get().then((result: any) => {
                let userProfile: IUserProfile = {
                    id: result.Id,
                    loginName: result.LoginName,
                    name: result.Title,
                    email: result.Email,
                    groups: result.Groups.results,
                };
                this.getCurrentUserPermissions(userProfile, resolve);
            }).catch(() => {
                this.getCurrentUserPermissions(currentUserIfo_TestData, resolve);
            });
        });
        return promise;
    }

    private getUserToken(ntid: string) {
        return this.axios.post(Environment.feberWebServiceUrl + "token", "Username=" + ntid + "&grant_type=password", {
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    private async getCurrentUserPermissions(userProfile: IUserProfile, resolve: any) {
        let permissions: IUserPermissions = {
            checkHasPermission: () => { return false; },
            checkHasDivisionAdminPermission: () => { return false; }
        };

        let getFunctions: any[] = [];
        getFunctions.push(this.getNormalAdminDivision(userProfile.groups));
        if (Environment.currentEnvironment !== "O") { // Sandbox, D, Q, Production
            let userToken = await this.getUserToken(userProfile.loginName.split("\\")[1]);
            getFunctions.push(userToken);
            getFunctions.push(this.checkRnDPermissionByWebServices((!_.isUndefined(userToken)) ? ("Bearer " + ((!_.isNil(userToken.data)) ? userToken.data.access_token : "")): "", userProfile.id));
            //getFunctions.push(this.checkRnDPermissionByWCF(userProfile.id))
            getFunctions.push(this.idmSrv.getResponsibleDepartments((!_.isUndefined(userToken)) ? ("Bearer " + ((!_.isNil(userToken.data)) ? userToken.data.access_token : "")) : "" ,userProfile.loginName.split("\\")[1]));
            
        }
        else { // Local
            getFunctions.push(new Promise((resolve)=>{
                resolve("Fake token");
            }));
            getFunctions.push(new Promise((resolve) => {
                resolve({
                    Permission: false,
                    GroupName: "idm2bcd_feber_user"
                });
            }));
            getFunctions.push(new Promise((resolve) => {
                resolve([{
                    Division: "",
                    Department: "",
                    ApproverID: "",
                    ApproverName: ""
                }]);
            }));
        }
        Axios.all(getFunctions).then(Axios.spread((divisionResult: any, userToken: any, RnDCheck: any, rouResult: any[]) => {

            // Check RnD user
            permissions.isRnDUser = RnDCheck.Permission;
            permissions.rndGroup = RnDCheck.GroupName;

            // ROU Information
            userProfile.division = (!_.isUndefined(rouResult[0])) ? rouResult[0].Division : "";
            userProfile.department = (!_.isUndefined(rouResult[0])) ? rouResult[0].Department.replace("_", "/") : "";
            userProfile.approverId = (!_.isUndefined(rouResult[0])) ? rouResult[0].ApproverID : "";
            userProfile.approverName = (!_.isUndefined(rouResult[0])) ? rouResult[0].ApproverName : "";

            // Token
            userProfile.userToken = (!_.isUndefined(userToken)) ? ("Bearer " + ((!_.isNil(userToken.data)) ? userToken.data.access_token : "")) : "";
            
            userProfile.issued = (!_.isUndefined(userToken)) ? userToken.data.issued : "";
            userProfile.expires = (!_.isUndefined(userToken)) ? userToken.data.expires : "";
            userProfile.groups.forEach((group: any) => {
                // Check Super Admin
                if (group.Title === Constants.SP_GROUP.FEBER_SUPER_ADMIN) {
                    permissions.isSuperAdmin = true;
                }
                else {
                    // Check RnD Division Admin
                    if (divisionResult.AdminType === Constants.DOCUMENT_TYPE.RnD) {
                        permissions.checkRnDDivisionAdmin = {} as IDivisionAdminInfo;
                        permissions.checkRnDDivisionAdmin.isAdmin = true;
                        permissions.checkRnDDivisionAdmin.divisionCode = divisionResult.DivisionCode;
                        permissions.checkRnDDivisionAdmin.divisionTitle = divisionResult.DivisionTitle;
                    }
                    // Check LL Division Admin
                    if (divisionResult.AdminType === Constants.DOCUMENT_TYPE.LL) {
                        permissions.checkLLDivisionAdmin = {} as IDivisionAdminInfo;
                        permissions.checkLLDivisionAdmin.isAdmin = true;
                        permissions.checkLLDivisionAdmin.divisionCode = divisionResult.DivisionCode;
                        permissions.checkLLDivisionAdmin.divisionTitle = divisionResult.DivisionTitle;
                    }
                    // Check LL Admin
                    if (group.Title === Constants.SP_GROUP.FEBER_LL_ADMIN) {
                        permissions.isLLAdmin = true;
                    }
                    // Check Thesis Admin
                    if (group.Title === Constants.SP_GROUP.FEBER_THESIS_ADMIN) {
                        permissions.isThesisAdmin = true;
                    }
                    // Check Paper Admin
                    if (group.Title === Constants.SP_GROUP.FEBER_PAPER_ADMIN) {
                        permissions.isPaperAdmin = true;
                    }
                }
            });
            // Check is Admin user for further check
            permissions.isAdmin = (permissions.isSuperAdmin === true
                || permissions.checkRnDDivisionAdmin?.isAdmin === true || permissions.checkLLDivisionAdmin?.isAdmin === true
                || permissions.isLLAdmin === true || permissions.isThesisAdmin === true || permissions.isPaperAdmin === true);

            permissions.checkHasPermission = (permissionList: string[]): boolean => {
                return this.checkHasPermission(permissionList, permissions);
            };
            permissions.checkHasDivisionAdminPermission = (type: string, divisionCode: string = "", divisionTitle: string = ""): boolean => {
                return this.checkHasDivisionAdminPermission(type, divisionCode, divisionTitle, permissions);
            };
            userProfile.permissions = permissions;
            resolve(userProfile);
        }));
    }

    private checkHasPermission(permissionList: string[], permissions: IUserPermissions): boolean {
        let hasPermission = false;
        permissionList.forEach((permission: string) => {
            switch (permission) {
                case Constants.PERMISSIONS.ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isAdmin)) ? permissions.isAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.SUPER_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isSuperAdmin)) ? permissions.isSuperAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.RND_DIVISION_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.checkRnDDivisionAdmin?.isAdmin)) ? permissions.checkRnDDivisionAdmin.isAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.LL_DIVISION_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.checkLLDivisionAdmin?.isAdmin)) ? permissions.checkLLDivisionAdmin.isAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.LL_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isLLAdmin)) ? permissions.isLLAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.THESIS_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isThesisAdmin)) ? permissions.isThesisAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.PAPER_ADMIN: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isPaperAdmin)) ? permissions.isPaperAdmin : false);
                    break;
                }
                case Constants.PERMISSIONS.RND_USER: {
                    hasPermission = hasPermission || ((!_.isUndefined(permissions.isRnDUser)) ? permissions.isRnDUser : false);
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return hasPermission;
    }

    private checkHasDivisionAdminPermission(type: string, divisionCode: string = "", divisionTitle: string = "", permissions: IUserPermissions) {
        let hasPermission: boolean = false;
        let checkDivisionAdmin: IDivisionAdminInfo | undefined = {};
        switch (type) {
            case Constants.DOCUMENT_TYPE.RnD: {
                checkDivisionAdmin = permissions.checkRnDDivisionAdmin;
                break;
            }
            case Constants.DOCUMENT_TYPE.LL: {
                checkDivisionAdmin = permissions.checkLLDivisionAdmin;
                break;
            }
        }
        if (divisionCode !== "" && !_.isUndefined(checkDivisionAdmin?.isAdmin)) {
            hasPermission = hasPermission || (checkDivisionAdmin.isAdmin && checkDivisionAdmin.divisionCode === divisionCode);
        }
        if (divisionTitle !== "" && !_.isUndefined(checkDivisionAdmin?.isAdmin)) {
            hasPermission = hasPermission || (checkDivisionAdmin.isAdmin && checkDivisionAdmin.divisionTitle === divisionTitle);
        }
        return hasPermission;
    }

    getUserById(userId: number) {
        console.log(userId)
        let promise = new Promise((resolve, reject) => {
            this.sp.web.siteUsers.getById(userId).get().then((result) => {
                resolve(result);
            }, (error) => {
                reject(error);
            });
        });
        return promise;
    }

    getNormalAdminDivision(groups: any[]) {
        let promise = new Promise((resolve) => {
            let result = { AdminType: "", DivisionTitle: "", DivisionCode: "" };
            let divisionName = "";
            groups.forEach(group => {
                if (group.Title.indexOf(" RnD Division Admin") > -1) {
                    result.AdminType = Constants.DOCUMENT_TYPE.RnD;
                    divisionName = group.Title.replace("FEBER ", "").replace(" RnD Division Admin", "");
                }
                else if (group.Title.indexOf(" LL Division Admin") > -1) {
                    result.AdminType = Constants.DOCUMENT_TYPE.LL;
                    divisionName = group.Title.replace("FEBER ", "").replace(" LL Division Admin", "");
                }
            });
            if (divisionName !== "") {
                this.sp.web.lists.getByTitle("DivisionMaster").items.getAll().then((rs: any[]) => {
                    rs.forEach(item => {
                        if (item.DivisionName === divisionName) {
                            result.DivisionTitle = item.Title;
                            result.DivisionCode = (_.isNil(item.DivisionCode)) ? item.Title : item.DivisionCode;
                        }
                    });
                    resolve(result);
                }).catch(() => {
                    resolve(result);
                });
            }
            else {
                resolve(result);
            }
        });
        return promise;
    }

    checkRnDPermission(userId: number) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "Search/CheckRnDPermission/" + userId)
                .then((result) => {
                    if (result.data.Status === "Success") {
                        resolve({
                            Permission: result.data.ResultValue,
                            GroupName: result.data.GroupName
                        });
                    }
                    else {
                        resolve({
                            Permission: false,
                            GroupName: ""
                        });
                    }
                }).catch(() => {
                    resolve({
                        Permission: false,
                        GroupName: ""
                    });
                });
        });
        return promise;
    }


    checkRnDPermissionByWebServices(userToken: string, userId: number) {
        let promise = new Promise((resolve) => {
            let checkRnDPermissionDone = false;
            let checkFunctions: any[] = [
                this.axios.get(Environment.feberWebServiceUrl + "IDM/CheckRnDUser?" + "userId=" + userId, {
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "Authorization": userToken
                    }
                }),
                this.systemListsSrv.getAllListItems("RnDADGroups", Environment.rootWeb, "Created")
            ];
            this.axios.all(checkFunctions).then(this.axios.spread((wcfResult: any, adGroup: any[]) => {
                checkRnDPermissionDone = true;
                resolve({
                    Permission: wcfResult.data.ResultValue === "TRUE",
                    GroupName: adGroup[0].Title
                });
            })).catch(() => {
                checkRnDPermissionDone = true;
                resolve({
                    Permission: false,
                    GroupName: ""
                });
            });
            // Prevent the case the service has issue
            setTimeout(() => {
                if (checkRnDPermissionDone === false) {
                    resolve({
                        Permission: false,
                        GroupName: ""
                    });
                }
            }, 10000);
        });
        return promise;
    }

    //     checkRnDPermissionByWCF(userId: number) {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise = new Promise((resolve) => {
    //         let checkRnDPermissionDone = false;
    //         let checkFunctions: any[] = [
    //             this.axios({
    //                 url: "http://localhost:58528/FeberWorkOnConnector.svc/" + "CheckRnDUser?userId=" + userId,
    //                 adapter: jsonpAdapter
    //             }),
    //             this.systemListsSrv.getAllListItems("RnDADGroups", Environment.rootWeb, "Created")
    //         ];
    //         this.axios.all(checkFunctions).then(this.axios.spread((wcfResult: any, adGroup: any[]) => {
    //             checkRnDPermissionDone = true;
    //             resolve({
    //                 Permission: wcfResult.data.ResultValue === "TRUE",
    //                 GroupName: adGroup[0].Title
    //             });
    //         })).catch(() => {
    //             checkRnDPermissionDone = true;
    //             resolve({
    //                 Permission: false,
    //                 GroupName: ""
    //             });
    //         });
    //         // Prevent the case the service has issue
    //         setTimeout(() => {
    //             if (checkRnDPermissionDone === false) {
    //                 resolve({
    //                     Permission: false,
    //                     GroupName: ""
    //                 });
    //             }
    //         }, 10000);
    //     });
    //     return promise;
    // }

    getFEBERGroupsList(): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.sp.web.siteGroups.filter("substringof('FEBER',Title) eq true or substringof('Feber',Title) eq true or substringof('feber',Title) eq true").get().then((groups: ISiteGroupInfo[]) => {
                resolve(groups);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    createNewSPGroup(groupName: string, description: string = "", members: { new: any[], delete: any[] } | null = null): Promise<boolean> {
        let promise: Promise<boolean> = new Promise((resolve) => {
            let groupInfo = {
                Title: groupName,
                Description: description,
                OnlyAllowMembersViewMembership: false
            };
            this.sp.web.siteGroups.add(groupInfo).then(() => {
                if (!_.isNil(members)) {
                    this.modifyMembers(groupName, members).then((rs: boolean) => {
                        resolve(rs);
                    });
                }
                else {
                    resolve(true);
                }
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    editSPGroup(groupId: number, groupName: string, description: string = "", members: { new: any[], delete: any[] } | null = null) {
        let promise = new Promise((resolve) => {
            this.sp.web.siteGroups.getById(groupId).update({ Title: groupName, Description: description }).then(() => {
                if (members !== null) {
                    this.modifyMembers(groupName, members).then((rs: boolean) => {
                        resolve(rs);
                    });
                }
                else {
                    resolve(true);
                }
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    modifyMembers(groupName: string, members: { new: any[], delete: any[] }): Promise<boolean> {
        let promise: Promise<boolean> = new Promise((resolve) => {
            // Delete users
            members.delete.forEach((item: any) => {
                this.sp.web.siteGroups.getByName(groupName).users.removeById(item.id);
            });
            // Add users
            if (members.new.length > 0) {
                let getFns: any[] = [];
                members.new.forEach((item: any) => {
                    getFns.push(this.sp.web.siteUsers.getById(item.id).get());
                });
                Promise.all(getFns).then((users: ISiteUserInfo[]) => {
                    let addFns: any[] = [];
                    users.forEach((user: ISiteUserInfo) => {
                        addFns.push(this.sp.web.siteGroups.getByName(groupName).users.add(user.LoginName));
                    });
                    Promise.all(addFns).then(() => {
                        resolve(true);
                    }).catch(() => {
                        resolve(false);
                    });
                });
            } else {
                resolve(true);
            }
        });
        return promise;
    }

    getGroupById(groupId: number) {
        let promise = new Promise((resolve) => {
            this.sp.web.siteGroups.getById(groupId).get().then((group: ISiteGroupInfo) => {
                resolve(group);
            }).catch(() => {
                resolve({ Id: 0, Title: "", Description: "" });
            });
        });
        return promise;
    }

    getMembersByGroupId(groupId: number) {
        let promise = new Promise((resolve) => {
            this.sp.web.siteGroups.getById(groupId).users.get().then((users: ISiteUserInfo[]) => {
                resolve(users);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    getLLDivisionAdmin(division: string) {
        let promise = new Promise((resolve) => {
            let systemSrv = new SystemService();
            systemSrv.getDivisionsList().then((results: any[]) => {
                let divisionLongName = results.filter(r => r.Title === division)[0].DivisionName;
                this.sp.web.siteGroups.getByName("FEBER " + divisionLongName + " LL Division Admin").users.get().then((users: ISiteUserInfo[]) => {
                    resolve((users.length > 0) ? users[0] : null);
                }).catch(() => {
                    resolve(null);
                });
            }).catch(() => {
                resolve(null);
            });
        });
        return promise;
    }

    getMembersByGroupName(groupName: string) {
        let promise = new Promise((resolve) => {
            this.sp.web.siteGroups.getByName(groupName).users.get().then((users: ISiteUserInfo[]) => {
                resolve(users);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    removeSPGroup(groupName: string) {
        let promise = new Promise((resolve) => {
            this.sp.web.siteGroups.removeByLoginName(groupName).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

}

export default PermissionsService;