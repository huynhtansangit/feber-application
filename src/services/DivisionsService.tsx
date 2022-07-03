import SystemService from './SystemService';
import PermissionsService from './PermissionsService';
import Helper from '../core/libraries/Helper';
import Environment from '../Environment';
import Constants from '../core/libraries/Constants';
import BaseService from './BaseService';
import "@pnp/polyfill-ie11";
import { Web } from '@pnp/sp/presets/all';
import _ from 'lodash';

class DivisionsService extends BaseService {

    private systemListsSrv = new SystemService();
    private permissionsSrv = new PermissionsService();

    createNewDivision(shortName: string, longName: string, code: string) {
        let promise = new Promise((resolve) => {
            let obj = {
                Title: shortName,
                DivisionName: longName,
                DivisionCode: code
            };
            // check exisiting division before creating new division
            this._checkDivisionExistence(obj, resolve, () => {
                // Add new item into list Division Master
                this._addNewDivisionMasterItem(obj, resolve, () => {
                    // Create new sub-sites
                    this._addNewSubSites(obj, resolve, () => {
                        // Create new SP Groups
                        this._createNewSPGroups(obj, resolve, () => {
                            this._assignPermissionsToSubSites(obj, resolve, () => {
                                resolve({
                                    status: "Success",
                                    error: ""
                                });
                            });
                        });
                    });
                });
            });
        });
        return promise;
    }

    private _checkDivisionExistence(obj: any, resolve: any, callback: any) {
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            let found: any = false;
            results.forEach(d => {
                if (d.Title === obj.Title
                    || (obj.DivisionCode !== "" && !_.isNil(obj.DivisionCode) && d.DivisionCode === obj.DivisionCode)) {
                    found = true;
                }
            });
            if (!found) {
                // Add new item into the Division Master
                callback();
            }
            else {
                resolve({
                    status: "Failed",
                    error: "The division has already existed. Please choose another short name or code."
                });
            }
        }).catch(() => {
            resolve({
                status: "Failed",
                error: "Something went wrong while checking the division existence."
            });
        });
    }

    private _addNewDivisionMasterItem(obj: any, resolve: any, callback: any) {
        this.systemListsSrv.addNewDivisionMasterItem(obj).then((rs2) => {
            if (rs2 === true) {
                callback();
            }
            else {
                resolve({
                    status: "Failed",
                    error: "Something went wrong while adding new item into list Division Master."
                });
            }
        }).catch(() => {
            resolve({
                status: "Failed",
                error: "Something went wrong while adding new item into list Division Master."
            });
        });
    }

    private _addNewSubSites(obj: any, resolve: any, callback: any) {
        let addFunctions: any[] = [];
        let subsites = [Constants.DOCUMENT_TYPE.RnD, Constants.DOCUMENT_TYPE.LL,
        Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper];
        subsites.forEach(subsite => {
            let web = Web(Environment.rootWeb + "/" + subsite);
            addFunctions.push(web.webs.add(
                obj.DivisionName, // site name
                (obj.DivisionCode !== "") ? obj.DivisionCode : obj.Title, // url
                obj.DivisionName, // description
                (Environment.currentEnvironment !== "O") ? "STS#0" : "CMSPUBLISHING#0", // template // for SP Online
                1033, // language: English
                true // Inherit permission
            ));
        });
        Promise.all(addFunctions).then(() => {
            callback();
        }).catch(() => {
            resolve({
                status: "Failed",
                error: "Something went wrong while adding new sub-sites."
            });
        });
    }

    private _createNewSPGroups(obj: any, resolve: any, callback: any) {
        let groups: any[] = [
            {
                name: "FEBER " + obj.DivisionName + " RnD Division Admin",
                description: "Members of this group will have RnD admin rights to this particular division"
            },
            {
                name: "FEBER " + obj.DivisionName + " LL Division Admin",
                description: "Members of this group will have LL admin rights to this particular division"
            },
            {
                name: "FEBER " + obj.DivisionName + " SC2 Access",
                description: "Members of this group will have SC2 level rights"
            },
            {
                name: "FEBER " + obj.DivisionName + " SC3 Access",
                description: "Members of this group will have SC3 level rights"
            }
        ];
        let addGroupFunctions: any[] = [];
        groups.forEach(group => {
            addGroupFunctions.push(this.permissionsSrv.createNewSPGroup(group.name, group.description));
        });
        Promise.all(addGroupFunctions).then(() => {
            callback();
        }).catch(() => {
            resolve({
                status: "Failed",
                error: "Something went wrong while adding new SharePoint groups."
            });
        });
    }

    private _assignPermissionsToSubSites(obj: any, resolve: any, callback: any) {
        // Get groups
        this._getGroupsForNewDivision(obj).then((groups) => {
            // Get roles
            this._getRolesForNewDivision().then((roles) => {
                // Set permissions
                this._setPermissionsForNewDivision(obj, groups, roles).then((rs: any) => {
                    if (rs.status === "Success") {
                        callback();
                    }
                    else {
                        resolve(rs);
                    }
                }).catch(() => {
                    resolve({
                        status: "Failed",
                        error: "Something went wrong while assigning the permissions to sub-sites."
                    });
                });
            }).catch(() => {
                resolve({
                    status: "Failed",
                    error: "Something went wrong while getting neccessary roles."
                });
            });
        }).catch(() => {
            resolve({
                status: "Failed",
                error: "Something went wrong while getting neccessary groups."
            });
        });
    }

    private _getGroupsForNewDivision(obj: any) {
        let groups: any[] = [
            "FEBER " + obj.DivisionName + " RnD Division Admin", // 0
            "FEBER " + obj.DivisionName + " LL Division Admin", // 1
        ];
        let getFunctions: any[] = [];
        groups.forEach(groupName => {
            getFunctions.push(this.sp.web.siteGroups.getByName(groupName).get());
        });
        return Promise.all(getFunctions);
    }

    private _getRolesForNewDivision() {
        let roles: any[] = [
            "FeberNormalAdmin", // 0
        ];
        let getFunctions: any[] = [];
        roles.forEach(roleName => {
            getFunctions.push(this.sp.web.roleDefinitions.getByName(roleName).get());
        });
        return Promise.all(getFunctions);
    }

    private _setPermissionsForNewDivision(obj: any, groups: any[], roles: any[]) {
        let promise = new Promise((resolve) => {
            let subsiteUrl = (obj.DivisionCode !== "" && !_.isNil(obj.DivisionCode)) ? obj.DivisionCode : obj.Title;
            let rndWeb = Web(Environment.rootWeb + "/RnD/" + subsiteUrl);
            let llWeb = Web(Environment.rootWeb + "/LL/" + subsiteUrl);
            // Set unique permission
            let breakFunctions = [];
            breakFunctions.push(rndWeb.breakRoleInheritance(true));
            breakFunctions.push(llWeb.breakRoleInheritance(true));
            Promise.all(breakFunctions).then(() => {
                let setFunctions: any[] = [];
                setFunctions.push(rndWeb.roleAssignments.add(groups[0].Id, roles[0].Id));
                setFunctions.push(llWeb.roleAssignments.add(groups[1].Id, roles[0].Id));
                Promise.all(setFunctions).then(() => {
                    resolve({
                        status: "Success",
                        error: ""
                    });
                }).catch(() => {
                    resolve({
                        status: "Failed",
                        error: "Something went wrong while setting new permissions to sub-sites."
                    });
                });
            }).catch(() => {
                resolve({
                    status: "Failed",
                    error: "Something went wrong while breaking the permissions inheritance for sub-sites."
                });
            });
        });
        return promise;
    }

    removeDivision(division: any) {
        let promise = new Promise((resolve) => {
            this._getDepartmentCountByDivision(division).then((result: any) => {
                if (!_.isNil(result.RnD) && !_.isNil(result.LL) && !_.isNil(result.Thesis) && !_.isNil(result.Paper)) {
                    if (result.RnD === 0 && result.LL === 0 && result.Thesis === 0 && result.Paper === 0) {
                        this._removeDivision(division).then((rs) => {
                            resolve(rs);
                        }).catch(() => {
                            resolve({
                                status: "Failed",
                                error: "Something went wrong while removing division " + division.DivisionName + "."
                            });
                        });
                    }
                    else {
                        resolve({
                            status: "Failed",
                            error: "You cannot delete division " + division.DivisionName + " because it has"
                                + " " + result.RnD + " RnD list" + ((result.RnD > 1) ? "s" : "") + ","
                                + " " + result.LL + " LL list" + ((result.LL > 1) ? "s" : "") + ","
                                + " " + result.Thesis + " Thesis list" + ((result.Thesis > 1) ? "s" : "") + " and"
                                + " " + result.Paper + " Paper list" + ((result.Paper > 1) ? "s" : "") + "."
                        });
                    }
                }
                else {
                    resolve({
                        status: "Failed",
                        error: "Something went wrong while checking whether division " + division.DivisionName + " is empty."
                    });
                }
            }).catch(() => {
                resolve({
                    status: "Failed",
                    error: "Something went wrong while checking whether division " + division.DivisionName + " is empty."
                });
            });
        });
        return promise;
    }

    private _getDepartmentCountByDivision(division: any) {
        let promise = new Promise((resolve) => {
            let getFunction: any[] = [];
            let subsites: any[] = [Constants.DOCUMENT_TYPE.RnD, Constants.DOCUMENT_TYPE.LL,
            Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper];
            let divisionUrl = (division.DivisionCode !== "" && !_.isNil(division.DivisionCode)) ? division.DivisionCode : division.Title;
            subsites.forEach(subsite => {
                let web = Web(Environment.rootWeb + "/" + subsite + "/" + divisionUrl);
                getFunction.push(web.lists.get());
            });
            Promise.all(getFunction).then((results: any[]) => {
                let rs: number[] = [];
                results.forEach((siteResult: any[]) => {
                    let count: number = 0;
                    siteResult.forEach(list => {
                        if (!Helper.checkExistInSystemLists(list.Title)) {
                            count += 1;
                        }
                    });
                    rs.push(count);
                });
                resolve({
                    RnD: rs[0],
                    LL: rs[1],
                    Thesis: rs[2],
                    Paper: rs[3],
                });
            }).catch(() => {
                resolve({
                    RnD: null,
                    LL: null,
                    Thesis: null,
                    Paper: null,
                });
            });

        });
        return promise;
    }

    private _removeDivision(division: any) {
        let promise = new Promise((resolve) => {
            // Remove item from list Division Master
            this.systemListsSrv.removeItemFromDivisionMaster(division.Id).then(() => {
                // Remove sub-sites
                this._removeDivisionSubSites(division).then(() => {
                    // Remove SP groups
                    this._removeSPGroups(division).then(() => {
                        resolve({
                            status: "Success",
                            error: ""
                        });
                    }).catch(() => {
                        resolve({
                            status: "Failed",
                            error: "Something went wrong while removing division SharePoint groups."
                        });
                    });
                }).catch(() => {
                    resolve({
                        status: "Failed",
                        error: "Something went wrong while removing division sub-sites."
                    });
                });
            }).catch(() => {
                resolve({
                    status: "Failed",
                    error: "Something went wrong while removing item from list Division Master."
                });
            });
        });
        return promise;
    }

    private _removeDivisionSubSites(division: any) {
        let promise = new Promise((resolve) => {
            let subsiteUrl = (division.DivisionCode !== "" && !_.isNil(division.DivisionCode)) ? division.DivisionCode : division.Title;
            let rndWeb = Web(Environment.rootWeb + "/RnD/" + subsiteUrl);
            rndWeb.delete().then(() => {
                let llWeb = Web(Environment.rootWeb + "/LL/" + subsiteUrl);
                llWeb.delete().then(() => {
                    let thesisWeb = Web(Environment.rootWeb + "/Thesis/" + subsiteUrl);
                    thesisWeb.delete().then(() => {
                        let paperWeb = Web(Environment.rootWeb + "/Paper/" + subsiteUrl);
                        paperWeb.delete().then(() => {
                            resolve(true);
                        });
                    });
                });
            });
        });
        return promise;
    }

    private _removeSPGroups(division: any) {
        let promise = new Promise((resolve) => {
            this.permissionsSrv.removeSPGroup("FEBER " + division.DivisionName + " RnD Division Admin").then(() => {
                this.permissionsSrv.removeSPGroup("FEBER " + division.DivisionName + " LL Division Admin").then(() => {
                    this.permissionsSrv.removeSPGroup("FEBER " + division.DivisionName + " SC2 Access").then(() => {
                        this.permissionsSrv.removeSPGroup("FEBER " + division.DivisionName + " SC3 Access").then(() => {
                            resolve(true);
                        });
                    });
                });
            });
        });
        return promise;
    }

}

export default DivisionsService;