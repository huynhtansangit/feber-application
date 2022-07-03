import Environment from '../Environment';
import BaseService from './BaseService';
import Configuration from '../core/libraries/Configuration';
import { IResponibleDepartment } from '../store/upload/types';

class IDMService extends BaseService {

    getSubDepartments(userToken: string, department: string) {
        //let dept = department.replace("/", "_");
        let promise = new Promise((resolve) => {
            let getROUDone = false;
            //this.axios.get(Environment.feberWebServiceUrl + "IDM/GetSubDepartments/" + department)
            this.axios.get(Environment.feberWebServiceUrl + "IDM/GetSubDepartments?departmentName=" + department, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            })
            .then((results) => {
                let rs = results.data as any[];
                rs.forEach(item => {
                    item = item.replace("/", "_");
                });
                rs.push(department);
                resolve(rs);
            }).catch(() => {
                resolve([department]);
            });
            // Prevent the case the service has issue
            setTimeout(() => {
                if (getROUDone === false) {
                    resolve([department]);
                }
            }, 10000);
        });
        return promise;
    }

    // getSubDepartmentsByWCF(department: string) {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise = new Promise((resolve) => {
    //         let getROUDone = false;
    //         this.axios({
    //             url: Environment.feberWCFUrl + "GetSubDepartmentsForSearch?Department=" + department,
    //             adapter: jsonpAdapter
    //         }).then((results) => {
    //             let rs = results.data as any[];
    //             rs.forEach(item => {
    //                 item = item.replace("/", "_");
    //             });
    //             rs.push(department);
    //             resolve(rs);
    //         }).catch(() => {
    //             resolve([department]);
    //         });
    //         // Prevent the case the service has issue
    //         setTimeout(() => {
    //             if (getROUDone === false) {
    //                 resolve([department]);
    //             }
    //         }, 10000);
    //     });
    //     return promise;
    // }

    getResponsibleDepartments(userToken: string, userNTID: string = ""): Promise<any[]> {
        let getROUDone = false;
        let promise: Promise<any[]> = new Promise(async (resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "IDM/getResponsibleDepartments?" + "userNTID=" + userNTID + "&HostUri=" + Environment.rootWeb, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            })
            .then((result) => {
                getROUDone = true;
                let rouArr = result.data;
                if (rouArr.ROUDetails.length > 0) {
                    let rouInfo = rouArr.ROUDetails[0]
                    let approverIdArr = rouInfo.ApproverId.split(";");
                    resolve([{ Division: approverIdArr[2], Department: approverIdArr[1], ApproverId: approverIdArr[0], ApproverName: rouInfo.ApproverName }]);
                }
                else {
                    resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
                }

            }).catch(() => {
                getROUDone = true;
                resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
            });
            //Prevent the case the service has issue
            setTimeout(() => {
                if (getROUDone === false) {
                    resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
                }
            }, 10000);
        });
        return promise;
    }

    // getResponsibleDepartmentsByWCF(userNTID: string = ""): Promise<any[]> {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise: Promise<any[]> = new Promise((resolve) => {
    //         let getROUDone = false;
    //         this.axios({
    //             url: Environment.feberWCFUrl + "GetROU?"
    //                 + "UserId=" + userNTID + "&HostUri=" + Environment.rootWeb,
    //             adapter: jsonpAdapter
    //         }).then((result) => {
    //             getROUDone = true;
    //             let rouArr = result.data;
    //             console.log(rouArr)
    //             console.log(rouArr.ROUDetails)
    //             if (rouArr.length > 0) {
    //                 let rouInfo = rouArr[0].Value[0];
    //                 let approverIdArr = rouInfo.ApproverId.split(";");
    //                 resolve([{ Division: approverIdArr[2], Department: approverIdArr[1], ApproverId: approverIdArr[0], ApproverName: rouInfo.ApproverName }]);
    //             }
    //             else {
    //                 resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
    //             }
    //         }).catch(() => {
    //             getROUDone = true;
    //             resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
    //         });
    //         // Prevent the case the service has issue
    //         setTimeout(() => {
    //             if (getROUDone === false) {
    //                 resolve([{ Division: "", Department: "", ApproverId: "", ApproverName: "" }]);
    //             }
    //         }, 10000);
    //     });
    //     return promise;
    // }

    getROU(departmentName: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "IDM/GetROUByDepartment/" + departmentName)
                .then((results) => {
                    let jsonData = results.data as string;
                    let rs = JSON.parse(jsonData);
                    resolve(rs);
                }).catch(() => {
                    resolve({});
                });
        });
        return promise;
    }

    getROUByPeoplePickerValues(authors: any[]): Promise<IResponibleDepartment[]> {
        let promise: Promise<IResponibleDepartment[]> = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "IDM/GetROUListsByPeoplePickerValues",
                data: authors,
                headers: { ...Configuration.webAPIHeader }
            })
                .then((result) => {
                    resolve(result.data);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }

    getROUByDepartments(departments: any[]): Promise<IResponibleDepartment[]> {
        let promise: Promise<IResponibleDepartment[]> = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "IDM/GetROUListsByDepartments",
                data: departments,
                headers: { ...Configuration.webAPIHeader }
            })
                .then((result) => {
                    resolve(result.data);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }
    getROUId(userToken: string, department: string): Promise<number> {
        let promise: Promise<number> = new Promise((resolve) => {
            let getROUDone = false;
            this.axios.get(Environment.feberWebServiceUrl + "IDM/GetROUIdByDepartment?" + "departmentName=" + department + "&HostUri=" + Environment.rootWeb, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            }).then((result) => {
                getROUDone = true;
                if (result.data <= 0) {
                    resolve(0);
                }
                else {
                    resolve(result.data);
                }
            }).catch(() => {
                getROUDone = true;
                resolve(0);
            });
            // Prevent the case the service has issue
            setTimeout(() => {
                if (getROUDone === false) {
                    resolve(0);
                }
            }, 10000);
        });

        return promise;
    }
    //Replace by getROUId

    // getROUByWCF(department: string): Promise<number> {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise: Promise<number> = new Promise((resolve) => {
    //         let getROUDone = false;
    //         this.axios({
    //             url: Environment.feberWCFUrl + "GetROUIdByDepartment?"
    //                 + "DepartmentName=" + department + "&HostUri=" + Environment.rootWeb,
    //             adapter: jsonpAdapter
    //         }).then((result) => {
    //             getROUDone = true;
    //             if (result.data <= 0) {
    //                 resolve(0);
    //             }
    //             else {
    //                 resolve(result.data);
    //             }
    //         }).catch(() => {
    //             getROUDone = true;
    //             resolve(0);
    //         });
    //         // Prevent the case the service has issue
    //         setTimeout(() => {
    //             if (getROUDone === false) {
    //                 resolve(0);
    //             }
    //         }, 10000);
    //     });

    //     return promise;
    // }

    getROUValidation(userToken: string, department: string): Promise<string> {
        let promise: Promise<string> = new Promise((resolve) => {
            let getROUDone = false;
            this.axios.get(Environment.feberWebServiceUrl + "IDM/GetDepartmentApprover?" + "departmentName=" + department + "&HostUri=" + Environment.rootWeb, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            }).then((result) => {
                getROUDone = true;
                resolve(result.data);
            }).catch(() => {
                getROUDone = true;
                resolve(null);
            });
            // Prevent the case the service has issue
            setTimeout(() => {
                if (getROUDone === false) {
                    resolve(null);
                }
            }, 10000);
        });
        return promise;
    }
    // getROUByWCFValidation(department: string): Promise<string> {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise: Promise<string> = new Promise((resolve) => {
    //         let getROUDone = false;
    //         this.axios({
    //             url: Environment.feberWCFUrl + "GetDepartmentApprover?"
    //                 + "DepartmentName=" + department + "&HostUri=" + Environment.rootWeb,
    //             adapter: jsonpAdapter
    //         }).then((result) => {
    //             getROUDone = true;
    //             resolve(result.data);
    //         }).catch(() => {
    //             getROUDone = true;
    //             resolve(null);
    //         });
    //         // Prevent the case the service has issue
    //         setTimeout(() => {
    //             if (getROUDone === false) {
    //                 resolve(null);
    //             }
    //         }, 10000);
    //     });

    //     return promise;
    // }

    GetGroupManagerByPeoplePickerValues(authors: any[]): Promise<IResponibleDepartment[]> {
        let promise: Promise<IResponibleDepartment[]> = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "IDM/GetGroupManagerByPeoplePickerValues",
                data: authors,
                headers: { ...Configuration.webAPIHeader }
            })
                .then((result) => {
                    resolve(result.data);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }
    GetGroupManagerByDepartments(departments: any[]): Promise<IResponibleDepartment[]> {
        let promise: Promise<IResponibleDepartment[]> = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "IDM/GetGroupManagerByDepartments",
                data: departments,
                headers: { ...Configuration.webAPIHeader }
            })
                .then((result) => {
                    resolve(result.data);
                }).catch(() => {
                    resolve([]);
                });
        });
        return promise;
    }
}

export default IDMService;