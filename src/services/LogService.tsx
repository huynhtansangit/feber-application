import BaseService from "./BaseService";
import { IFileInfo } from "@pnp/sp/files";
import _ from 'lodash';
import { Web } from "@pnp/sp/webs";
import Environment from "../Environment";

class LogService extends BaseService {

    getLogFiles(logType: string): Promise<any[]> {
        let folderUrl: string = "";
        switch (logType) {
            case "api": {
                folderUrl = "/Shared Documents/FeberLogs";
                break;
            }
            case "api_soap": {
                folderUrl = "/Shared Documents/FeberSoapLogs";
                break;
            }
            case "wcf": {
                folderUrl = "/Shared Documents/WCFServiceApplicationLogs";
                break;
            }
            case "wcf_soap": {
                folderUrl = "/Shared Documents/WCFServiceSoapLogs";
                break;
            }
        }
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.sp.web.getFolderByServerRelativeUrl(folderUrl).files().then((files: IFileInfo[]) => {
                let results: any[] = _.chain(files)
                    .map((file: IFileInfo) => {
                        return { key: folderUrl + "/" + file.Name, text: file.Name };
                    })
                    .orderBy("text", "desc")
                    .filter((option: any) => {
                        return (option.key.indexOf('.zip') === -1);
                    }).value();
                resolve(results);
            }).catch(() => {
                resolve([]);
            });
        });
        return promise;
    }

    getLogContent(logFileUrl: string): Promise<string> {
        return this.sp.web.getFileByServerRelativeUrl(logFileUrl).getText();
    }

    getLogRules(): Promise<any[]> {
        var web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("LogRules").items.getAll();
    }

    getRuleById(id: any) {
        var web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("LogRules").items.getById(id).get();
    }

    createRule(ruleName: string, keywords: string) {
        var web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("LogRules").items.add({
            Title: ruleName,
            Keywords: keywords
        });
    }

    editRule(id: any, ruleName: string, keywords: string) {
        var web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("LogRules").items.getById(id).update({
            Title: ruleName,
            Keywords: keywords
        });
    }

    removeLogRule(item: any) {
        var web = Web(Environment.spaSiteUrl);
        return web.lists.getByTitle("LogRules").items.getById(item.Id).delete();
    }

}

export default LogService;