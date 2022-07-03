/* eslint no-useless-escape: 0 */
import Helper from '../core/libraries/Helper';
import Environment from '../Environment';
import BaseService from './BaseService';
import Constants from '../core/libraries/Constants';
import _ from 'lodash';
import Configuration from '../core/libraries/Configuration';

class SystemService extends BaseService {

    // CONFIGURATIONS
    getConfigurations(): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Configurations").items.getAll().then((results: any[]) => {
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    // DIVISION MASTER
    getDivisionsList(): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("DivisionMaster").then((results: any[]) => {
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    addNewDivisionMasterItem(obj: any) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("DivisionMaster").items.add(obj).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    removeItemFromDivisionMaster(id: any) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("DivisionMaster").items.getById(id).delete().then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    // REPORT TYPE
    getReportType(listName: string): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems(listName, Environment.rootWeb, "ID", true).then((results: any[]) => {
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    // BOOKMARKS
    getAllBookmarksByUser(userId: number | null): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("Bookmarks", Environment.rootWeb, "ID", false, (!_.isNil(userId)) ? "Author/Id eq " + userId : "",
                ["*,BookmarkUser/Title"], ["BookmarkUser"]).then((results: any[]) => {
                    let rs: any[] = [];
                    results.forEach(item => {
                        if ((!_.isNil(item.DocumentTitle)) ? (item.DocumentTitle.Url.indexOf("?Guid=") > -1) : false) {
                            let guid = item.DocumentTitle.Url.split("?Guid=")[1];
                            rs.push({
                                Id: item.ID,
                                Guid: guid,
                                Title: item.DocumentTitle.Description,
                                Url: Helper.generateAccessMediatorPathByGuid(guid),
                                Authors: item.Authors,
                                FeberAuthorDisplayName: item.FeberAuthorDisplayName,
                                BookmarkDate: (!_.isNil(item.BookmarkDate)) ? Helper.getDateTimeFormatForList(new Date(item.BookmarkDate)) : "",
                                BookmarkUser: item.BookmarkUser.Title,
                                Keywords: item.Keywords
                            });
                        }
                    });
                    resolve(rs);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    addBookmark(data: any) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Bookmarks").items.add(data).then((item: any) => {
                resolve(item.data.ID);
            }).catch(() => {
                resolve(-1);
            });
        });
        return promise;
    }

    removeBookmark(Id: number) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Bookmarks").items.getById(Id).delete().then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    changeWorkflowID(listType: string, itemId: any, workflowId: string): Promise<boolean> {
        let promise = new Promise<boolean>((resolve) => {
            switch (listType) {
                case "order": {
                    this.sp.web.lists.getByTitle("PendingOrderReports").items.getById(itemId).update({ WorkflowID: workflowId })
                        .then(() => { resolve(true); })
                        .catch(() => { resolve(false); });
                    break;
                }
                case "upload": {
                    this.sp.web.lists.getByTitle("PendingApprovalReports").items.getById(itemId).update({ WorkflowID: workflowId })
                        .then(() => { resolve(true); })
                        .catch(() => { resolve(false); });
                    break;
                }
            }
        });
        return promise;
    }

    // PENDING ORDER REPORTS
    getAllPendingOrdersByUser(userId: number | null): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("PendingOrderReports", Environment.rootWeb, "ID", false, (!_.isNil(userId)) ? ("OrderRequestUser/Id eq " + userId) : "",
                ["*", "ReportAuthor/Title", "OrderApprover/Title", "OrderRequestUser/Title"], ["ReportAuthor", "OrderApprover", "OrderRequestUser"]).then((results: any[]) => {
                    let rs: any[] = [];
                    results.forEach(item => {
                        let authors: string[] = [];
                        if (!_.isUndefined(item.ReportAuthor.results)) {
                            item.ReportAuthor.results.forEach((author: any) => {
                                authors.push(author.Title);
                            });
                        }
                        rs.push({
                            Id: item.ID,
                            Title: item.Title,
                            Authors: authors.join(" ; "),
                            FeberAuthorDisplayName: item.FeberAuthorDisplayName,
                            Approver: item.OrderApprover.Title,
                            Comment: item.OrderComments,
                            OrderDate: (!_.isNil(item.OrderDate)) ? Helper.getDateTimeFormatForList(new Date(item.OrderDate)) : "",
                            SecurityClass: item.SecurityClass,
                            CorrelationId: (!_.isNil(item.CorrelationId)) ? item.CorrelationId : "",
                            Guid: (!_.isNil(item.FeberGuid)) ? item.FeberGuid : "",
                            WorkflowId: (!_.isNil(item.WorkflowID)) ? item.WorkflowID : "",
                            OrderUser: item.OrderRequestUser.Title,
                            Url: Helper.generateAccessMediatorPathByGuid((!_.isNil(item.FeberGuid)) ? item.FeberGuid : "",),
                        });
                    });
                    resolve(rs);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    // PENDING APPROVAL REPORTS
    getAllPendingUploadsByUser(userId: number | null): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("PendingApprovalReports", Environment.rootWeb, "ID", false, (!_.isNil(userId)) ? ("Submitter/Id eq " + userId) : "",
                ["*", "ReportAuthor/Title,Submitter/Title"], ["ReportAuthor", "Submitter"]).then((results: any[]) => {
                    let rs: any[] = [];
                    results.forEach(item => {
                        let authors: string[] = [];
                        if (!_.isUndefined(item.ReportAuthor.results)) {
                            item.ReportAuthor.results.forEach((author: any) => {
                                authors.push(author.Title);
                            });
                        }
                        rs.push({
                            Id: item.ID,
                            Title: item.Title,
                            Url: Helper.generateAccessMediatorPathByGuid(item.GUID1),
                            Authors: authors.join(" ; "),
                            FeberAuthorDisplayName: item.FeberAuthorDisplayName,
                            Division: item.Division,
                            Department: item.FeberDepartment.replace("_", "/"),
                            Keywords: item.FeberKeywords,
                            UploadType: item.UploadTypeDescription,
                            HasAttachment: item.Attachments,
                            CorrelationId: (!_.isNil(item.CorrelationId)) ? item.CorrelationId : "",
                            WorkflowId: (!_.isNil(item.WorkflowID)) ? item.WorkflowID : "",
                            Submitter: item.Submitter.Title
                        });
                    });
                    resolve(rs);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    // CLOSED PENDING REPORTS
    getAllClosedPendingUploadsByUser(userId: number | null): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.getAllListItems("ClosedPendingReports", Environment.rootWeb, "ID", false, (!_.isNil(userId)) ? ("Submitter/Id eq " + userId) : "",
                ["*", "ReportAuthor/Title", "Submitter/Title"], ["ReportAuthor", "Submitter"]).then((results: any[]) => {
                    let rs: any[] = [];
                    results.forEach(item => {
                        let authors: string[] = [];
                        if (!_.isUndefined(item.ReportAuthor.results)) {
                            item.ReportAuthor.results.forEach((author: any) => {
                                authors.push(author.Title);
                            });
                        }
                        rs.push({
                            Id: item.ID,
                            Title: item.Title,
                            Url: Helper.generateAccessMediatorPathByGuid(item.GUID1),
                            Authors: authors.join(" ; "),
                            FeberAuthorDisplayName: item.FeberAuthorDisplayName,
                            Division: item.Division,
                            Department: item.FeberDepartment.replace("_", "/"),
                            UploadType: item.UploadTypeDescription,
                            HasAttachment: item.Attachments,
                            WorkflowID: (!_.isNil(item.WorkflowID)) ? item.WorkflowID : "",
                            Submitter: item.Submitter.Title
                        });
                    });
                    resolve(rs);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    // CANCEL UPLOADED / OREDERED REPORTS
    cancelReport(userToken: string, correlationId: string, workflowId: string, reason: string): Promise<boolean> {
        let promise = new Promise<boolean>((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "WorkOn/CancelWorkflow",
                data: {
                    CorrelationId: correlationId,
                    WorkflowId: workflowId,
                    Reason: reason
                },
                headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
            })
                .then((result) => {
                    resolve(result.data.Status === "Success");
                }).catch(() => {
                    resolve(false);
                });
        });
        return promise;
    }

    // SEARCH SUBSCRIPTION
    getAllSubscriptionsByUser(userId: number): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Search Subscriptions").items
                .filter("SubscriptionUser/Id eq " + userId).getAll().then((results: any[]) => {
                    let rs: any[] = [];
                    if (results.length > 0) {
                        let result = results[0];
                        if (result.Subscription1 !== "" && !_.isNil(result.Subscription1)) {
                            rs.push(result.Subscription1);
                        }
                        if (result.Subscription2 !== "" && !_.isNil(result.Subscription2)) {
                            rs.push(result.Subscription2);
                        }
                        if (result.Subscription3 !== "" && !_.isNil(result.Subscription3)) {
                            rs.push(result.Subscription3);
                        }
                    }
                    resolve(rs);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    addSubscription(userId: number, userNTID: string, value: string) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Search Subscriptions").items
                .filter("SubscriptionUser/Id eq " + userId).getAll().then((results: any[]) => {
                    if (results.length > 0) { // Update
                        let result = results[0];
                        let updatedData: any = {};
                        if (_.isNil(result.Subscription1)) {
                            updatedData.Subscription1 = value;
                        }
                        else if (_.isNil(result.Subscription2)) {
                            updatedData.Subscription2 = value;
                        }
                        else if (_.isNil(result.Subscription3)) {
                            updatedData.Subscription3 = value;
                        }
                        else { // Full subscriptions -> Replace the first one
                            updatedData = {
                                Subscription1: result.Subscription2,
                                Subscription2: result.Subscription3,
                                Subscription3: value
                            };
                        }
                        this.sp.web.lists.getByTitle("Search Subscriptions").items
                            .getById(result.ID).update(updatedData).then(() => {
                                resolve(true);
                            }).catch(() => {
                                resolve(false);
                            });
                    }
                    else { // Create New
                        let newObj: any = {
                            Title: userNTID,
                            Subscription1: value,
                            Subscription2: null,
                            Subscription3: null,
                            SubscriptionUserId: userId
                        };
                        this.sp.web.lists.getByTitle("Search Subscriptions").items.add(newObj).then(() => {
                            resolve(true);
                        }).catch(() => {
                            resolve(false);
                        });
                    }
                });
        });
        return promise;
    }

    removeSubscription(userId: number, value: string) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle("Search Subscriptions").items
                .filter("SubscriptionUser/Id eq " + userId).getAll().then((results: any[]) => {
                    if (results.length > 0) {
                        let result = results[0];
                        let updatedData = {
                            Subscription1: result.Subscription1,
                            Subscription2: result.Subscription2,
                            Subscription3: result.Subscription3
                        };
                        switch (value) {
                            case result.Subscription1: {
                                updatedData = {
                                    Subscription1: result.Subscription2,
                                    Subscription2: result.Subscription3,
                                    Subscription3: null
                                };
                                break;
                            }
                            case result.Subscription2: {
                                updatedData = {
                                    Subscription1: result.Subscription1,
                                    Subscription2: result.Subscription3,
                                    Subscription3: null
                                };
                                break;
                            }
                            case result.Subscription3: {
                                updatedData = {
                                    Subscription1: result.Subscription1,
                                    Subscription2: result.Subscription2,
                                    Subscription3: null
                                };
                                break;
                            }
                        }
                        this.sp.web.lists.getByTitle("Search Subscriptions").items
                            .getById(result.ID).update(updatedData).then(() => {
                                resolve(true);
                            }).catch(() => {
                                resolve(false);
                            });
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

    // Statistics
    addNewStatisticRecord(listName: string, data: any) {
        let promise = new Promise((resolve) => {
            this.sp.web.lists.getByTitle(listName).items.add(data).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    getStatisticList(listName: string) {
        return this.getAllListItems(listName, Environment.rootWeb, "ID", false, "",
            (listName !== Constants.STATISTICS.SEARCH) ? ["*", "Submitter/Title"] : ["*", "Author/Title"],
            (listName !== Constants.STATISTICS.SEARCH) ? ["Submitter"] : ["Author"]);
    }

    // AIM History
    getAIMHistoryList() {
        return this.getAllListItems("AIMHistory");
    }

    addAIMHistoryItem(data: any) {
        return this.sp.web.lists.getByTitle("AIMHistory").items.add(data);
    }

    sendAIMEmails(userToken: string, transactionId: any) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "IDM/SendAIMEmails?" + "transactionId=" + transactionId, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            }).then(() => {
                resolve(0);
            }).catch(() => {
                resolve(0);
            });
        });
        return promise;
    }

    // sendAIMEmails(transactionId: any) {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise = new Promise((resolve) => {
    //         this.axios({
    //             url: Environment.feberWCFUrl + "SendAIMEmails?transactionId=" + transactionId,
    //             adapter: jsonpAdapter
    //         }).then(() => {
    //             resolve(0);
    //         }).catch(() => {
    //             resolve(0);
    //         });
    //     });
    //     return promise;
    // }

}

export default SystemService;