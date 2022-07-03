import BaseService from './BaseService';
import Environment from '../Environment';
import Configuration from '../core/libraries/Configuration';
import Constants from '../core/libraries/Constants';

class UploadService extends BaseService {

    uploadReport(userToken: string, report: any): Promise<boolean> {
        let promise: Promise<boolean> = new Promise((resolve) => {
            this.axios({
                method: "POST",
                url: Environment.feberWebServiceUrl + "Upload/CreateReport",
                data: report,
                headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
            }).then((uploadResult) => {
                if (!!uploadResult.data) {
                    this.addAttachment(userToken, {
                        ...report,
                        Id: uploadResult.data.Id,
                        Path: uploadResult.data.Path,
                        Submitter: uploadResult.data.Submitter,
                        Guid: uploadResult.data.Guid,
                        CorrelationId: uploadResult.data.CorrelationId,
                    }, resolve);
                }
                else {
                    resolve(false);
                }
            }).catch((error) => {
                resolve(error.response.status);
            });
        });
        return promise;
    }

    addAttachment(userToken: string, report: any, resolve: any) {
        let config = Object.assign({}, Configuration.webAPIHeader);
        config["Accept"] = 'multipart/form-data';
        config["Content-Type"] = 'multipart/form-data';
        if (!!report.Attachment) {
            const formData = new FormData();
            formData.append('body', report.Attachment);
            formData.append('Id', report.Id);
            formData.append('IsAdmin', report.IsAdmin);
            formData.append('Path', report.Path);
            this.axios.post(Environment.feberWebServiceUrl + "Upload/AddAttachment", formData, {
                headers: { ...config, "Authorization": userToken }
            }).then((rs: any) => {
                if (rs.data.Status === "Success") {
                    if (report.IsAdmin === true) {
                        resolve(rs.data);
                    }
                    else {
                        this.startUploadWorkflow(userToken, report, resolve);
                    }
                }
                else {
                    //rs.data.Message
                    resolve(rs.data);
                }
            }).catch(() => {
                resolve({ Status: "Failed", Message: "" });
            });
        }
        else {
            if (report.UploadType === Constants.DOCUMENT_TYPE.Paper && report.IsAdmin === false) {
                this.startUploadWorkflow(userToken, report, resolve);
            }
            else {
                resolve({ Status: "Success", Message: "" });
            }
        }
    }

    startUploadWorkflow(userToken: string, report: any, resolve: any) {
        this.axios({
            method: "POST",
            url: Environment.feberWebServiceUrl + "Upload/StartUploadWorkflow",
            data: report,
            headers: { ...Configuration.webAPIHeader, "Authorization": userToken }
        }).then((rs) => {
            if (rs.data.Status === "Success") {
                resolve(rs.data);
            }
            else {
                resolve(rs.data);
            }
        }).catch(() => {
            resolve({ Status: "Failed", Message: "" });
        });
    }

}

export default UploadService;