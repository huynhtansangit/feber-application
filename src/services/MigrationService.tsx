import Helper from '../core/libraries/Helper';
import DepartmentService from './DepartmentService';
import Environment from '../Environment';
import Constants from '../core/libraries/Constants';
import BaseService from './BaseService';
import "@pnp/polyfill-ie11";
import { Web } from '@pnp/sp/presets/all';
class MigrationService extends BaseService {
    retrieveData(obj: any) {
        let promise = new Promise((resolve) => {
            // PREPARE DATA
            // + Step 1: Get Document Types
            let documentTypes: any[] = [];
            if (obj.documentType === "") {
                documentTypes = [Constants.DOCUMENT_TYPE.RnD, Constants.DOCUMENT_TYPE.LL,
                Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper];
            }
            else {
                documentTypes.push(obj.documentType);
            }
            // + Step 2: Get Access Groups
            let accessGroupPromise = new Promise((resolveSub) => {
                let exampleWeb = Web(Environment.rootWeb + "/" + documentTypes[0] + "/" + obj.targetDivision);
                exampleWeb.get().then((web) => {
                    let targetDivisionTitle = web.Title;
                    let getAccessGroupFunctions: any[] = [];
                    let rootWeb = Web(Environment.rootWeb);
                    getAccessGroupFunctions.push(rootWeb.siteGroups.getByName("FEBER Thesis Admin").get());
                    getAccessGroupFunctions.push(rootWeb.siteGroups.getByName("FEBER " + targetDivisionTitle + " RnD Division Admin").get());
                    getAccessGroupFunctions.push(rootWeb.siteGroups.getByName("FEBER " + targetDivisionTitle + " SC2 Access").get());
                    getAccessGroupFunctions.push(rootWeb.siteGroups.getByName("FEBER " + targetDivisionTitle + " SC3 Access").get());
                    Promise.all(getAccessGroupFunctions).then((accessGroups) => {
                        resolveSub({
                            ThesisAdmin: accessGroups[0].Id,
                            RnDDivisionAdmin: accessGroups[1].Id,
                            SC2Access: accessGroups[2].Id,
                            SC3Access: accessGroups[3].Id
                        });
                    });
                });
            });
            // + Step 3: Get items
            accessGroupPromise.then((accessGroups) => {
                //console.log(accessGroups)
                let getItemsFunctions: any[] = [];
                documentTypes.forEach(documentType => {
                    let sourceDepartmentName = obj.sourceDepartment.replace("/", "_");
                    let web = Web(Environment.rootWeb + "/" + documentType + "/" + obj.sourceDivision);
                    // No SC
                    getItemsFunctions.push(web.lists.getByTitle(sourceDepartmentName).items.getAll().catch(() => { return []; }));
                    // SC1
                    getItemsFunctions.push(web.lists.getByTitle(sourceDepartmentName + "-SC1").items.getAll().catch(() => { return []; }));
                    // SC2
                    getItemsFunctions.push(web.lists.getByTitle(sourceDepartmentName + "-SC2").items.getAll().catch(() => { return []; }));
                    // SC3
                    getItemsFunctions.push(web.lists.getByTitle(sourceDepartmentName + "-SC3").items.getAll().catch(() => { return []; }));
                });
                Promise.all(getItemsFunctions).then((itemResults: any[]) => {
                    let items: any[] = [];
                    itemResults.forEach((results: any[]) => {
                        results.forEach((item: any) => {
                            items.push(item);
                        });
                    });
                    // + Step 3: Get Access Groups
                    this._saveData(obj, accessGroups, items).then(() => {
                        if (items.length > 0) {
                            resolve(true);
                        }
                        else {
                            resolve(undefined);
                        }
                    }).catch(() => {
                        resolve(false);
                    });
                });
            });
        });
        return promise;
    }

    private _saveData(infoObj: any, accessGroups: any, items: any[]) {
        //console.log(items)
        let promise = new Promise((resolve) => {
            let addFunctions: any[] = [];
            items.forEach(item => {
                let obj = {
                    Title: item.Title,
                    SourceDivision: infoObj.sourceDivision,
                    SourceList: Helper.getListName(item.UploadType, item.SecurityClass, infoObj.sourceDepartment),
                    TargetDivision: infoObj.targetDivision,
                    TargetList: Helper.getListName(item.UploadType, item.SecurityClass, infoObj.targetDepartment),
                    GUID1: item.GUID1,
                    Status: "New",
                    SourceUrl: Environment.rootWeb + "/" + item.UploadType + "/" + infoObj.sourceDivision + "/Lists/" + Helper.getListNameUrl(item) + "/DispForm.aspx?ID=" + item.Id,
                    TargetUrl: "",
                    AccessMembers: JSON.stringify(Helper.getAccessGroups(item.UploadType, item.SecurityClass, accessGroups, infoObj.rouId, infoObj.portfolioId)),
                    DocumentType: item.UploadType,
                    CheckOutUser: infoObj.checkOutUser
                };
                //console.log(item.__metadata.type)
                //console.log(obj)
                let spaWeb = Web(Environment.spaSiteUrl);
                addFunctions.push(spaWeb.lists.getByTitle("MigrationData").items.add(obj));
            });
            resolve(Promise.all(addFunctions));
        });
        return promise;
    }

    getData(): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("MigrationData", Environment.spaSiteUrl).then((results) => {
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    deleteItem(id: any) {
        let promise = new Promise((resolve) => {
            let web = Web(Environment.spaSiteUrl);
            web.lists.getByTitle("MigrationData").items.getById(id).delete().then((results) => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    updateMigrationInfo(updatedObj: any, items: any[]) {
        let promise = new Promise((resolve) => {
            let updateFunctions: any[] = [];
            items.forEach(item => {
                let web = Web(Environment.spaSiteUrl);
                updateFunctions.push(web.lists.getByTitle("MigrationData").items.getById(item.Id).update(updatedObj));
            });
            Promise.all(updateFunctions).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    createMigratedReports(migrationInfos: any[]) {
        let promise = new Promise((resolve) => {
            let getItemFunctions: any[] = [];
            migrationInfos.forEach(migrationInfo => {
                // Get Items
                let web = Web(Environment.rootWeb + "/" + migrationInfo.DocumentType + "/" + migrationInfo.SourceDivision);
                let id = migrationInfo.SourceUrl.split("=")[1];
                getItemFunctions.push(web.lists.getByTitle(migrationInfo.SourceList).items.getById(id).get().catch(() => { return {}; }));
            });
            Promise.all(getItemFunctions).then((sourceItems: any[]) => {
                // Create target meta-data objects
                let targetItems = [];
                for (let index = 0; index < sourceItems.length; index++) {
                    let item = sourceItems[index];
                    
                    //User Story 104711: Auto-fill Report Date -- Case: Multiple Reports Move
                    if(item.DocumentDate === null) {
                        let currentDate = new Date().toISOString();
                        if (item.FeberUploadDate === null) {
                            item.FeberUploadDate = currentDate;
                        }
                        if (item.FeberApproveDate === null) {
                            item.FeberApproveDate = currentDate;
                        }
                    }
                    else {
                        if (item.FeberUploadDate === null) {
                            item.FeberUploadDate = item.DocumentDate;
                        }
                        if (item.FeberApproveDate === null) {
                            item.FeberApproveDate = item.DocumentDate;
                        }
                    }
                    //console.log(item)
                    let addtionalCustomACL = JSON.parse(migrationInfos[index].AccessMembers) as number[];
                    if (addtionalCustomACL.length > 0) {
                        try {
                            let customACL = item.CustomACLId.results as number[];
                            customACL.push(...addtionalCustomACL);
                            item.CustomACLId = { results: customACL };
                        } catch {
                            // There is no CustomACL for failed object
                        }
                    }
                    item.FeberDepartment = migrationInfos[index].TargetList.replace("-SC1", "").replace("-SC2", "").replace("-SC3", "").replace("_", "/");
                    item.Division = migrationInfos[index].TargetDivision;
                    // More details
                    item.MigrationId = migrationInfos[index].Id;
                    item.SourceDivision = migrationInfos[index].SourceDivision;
                    item.SourceList = migrationInfos[index].SourceList;
                    item.TargetList = migrationInfos[index].TargetList;
                    item.SourceId = migrationInfos[index].SourceUrl.split("=")[1];
                    targetItems.push(item);
                }
                //console.log(targetItems);
                let departmentListsSrv: DepartmentService = new DepartmentService();
                departmentListsSrv.createMigratedReports(targetItems).then(() => {
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    removeData(id: any) {
        let web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("MigrationData").items.getById(id).delete();
    }

    isMultiMovesReport(guid: string) {
        let promise = new Promise((resolve) => {
            let web = Web(Environment.spaSiteUrl);
            web.lists.getByTitle("MigrationData").items.filter("GUID1 eq '" + guid + "'").get().then((results: any[]) => {
                if (results.length > 0) {
                    let lockUser = results[0].CheckOutUser as string;
                    if (lockUser.indexOf("\\") > -1) {
                        lockUser = lockUser.split("\\")[1];
                    }
                    resolve(lockUser.toUpperCase());
                }
                else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

}

export default MigrationService;