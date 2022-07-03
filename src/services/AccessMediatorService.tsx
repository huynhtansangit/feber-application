import BaseService from './BaseService';
import Environment from '../Environment';
import Configuration from '../core/libraries/Configuration';

class AccessMediatorService extends BaseService {

    getReport(userToken: string, guid: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "AccessMediator/GetReport/" + guid, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            })
                .then((rs) => {
                    resolve(rs.data);
                }).catch(() => {
                    resolve(null);
                });
        });
        return promise;
    }

    restartUpload(userToken: string, pendingReport: any) {
        let promise = new Promise((resolve) => {
            this.updateReport(userToken, pendingReport).then(() => {
                this.axios({
                    method: "POST",
                    url: Environment.feberWebServiceUrl + "AccessMediator/Restart",
                    data: pendingReport,
                    headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
                })
                    .then((result) => {
                        resolve(result.data.Status === "Success");
                    }).catch(() => {
                        resolve(false);
                    });
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    orderReport(userToken: string, report: any) {
        let promise = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "AccessMediator/Order",
                data: report,
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
    //note
    updateReport(userToken: string, report: any) {
        let promise = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "AccessMediator/Update",
                data: report,
                headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
            })
                .then(() => {
                    this.addAttachment(userToken, report, resolve);
                }).catch(() => {
                    resolve(false);
                });
        });
        return promise;
    }

    addAttachment(userToken: string, report: any, resolve: any) {
        let config = Object.assign({}, Configuration.webAPIHeader);
        config["Accept"] = 'multipart/form-data';
        config["Content-Type"] = 'multipart/form-data';
        if (report.Attachment !== null) {
            const formData = new FormData();
            formData.append('body', report.Attachment);
            formData.append('Id', report.Id);
            formData.append('Path', report.Path);
            formData.append('ReportStatus', report.ReportStatus);
            formData.append('ReplacedROU', null);
            formData.append('Comment', "");
            formData.append('IsFileUpdate', "TRUE");
            this.axios.post(Environment.feberWebServiceUrl + "AccessMediator/UploadFile", formData, {
                headers: { ...config, "Authorization": userToken }
            }).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false)
            });
        }
        else {
            resolve(true);
        }
    }

    deleteReport(userToken: string, report: any) {
        let promise = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "AccessMediator/Delete",
                data: JSON.stringify(report),
                headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
            })
                .then((result: any) => {
                    resolve(result.data.Status === "Success");
                }).catch(() => {
                    resolve(false);
                });
        });
        return promise;
    }

}

export default AccessMediatorService;