import SearchService from './SearchService';
import Helper from '../core/libraries/Helper';
import Constants from '../core/libraries/Constants';
import { IColumn } from '@fluentui/react/lib/DetailsList';
import Environment from '../Environment';
import * as Excel from 'exceljs';
import DepartmentService from './DepartmentService';
import _ from 'lodash';

const FileSaver = require("file-saver");

class ExcelService {

    appUrl: string = "";

    searchSrv: SearchService = new SearchService();

    constructor(appUrl: string) {
        this.appUrl = appUrl;
    }

    exportSearchReport(searchText: string) {
        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];

                let worksheet = workbook.addWorksheet('Report');
                worksheet.addRow(["Link to document (AM-File)", "Title", "Author", "Author Name", "Department", "Report Date", "Approved Date", "Document Type", "Report Type", "Security Class", "Custom ACL"]);

                this.getAllSearchData(searchText).then((results: any[]) => {
                    results.forEach(rs => {
                        let link: string = rs.AccessLink;
                        if (rs.AttachedUrl !== "") {
                            // Get link, exceptional case for paper
                            link = rs.AttachedUrl;
                        }
                        worksheet.addRow([link, rs.Title, rs.Author, rs.AuthorName, rs.Department, rs.ReportDate, rs.ApproveDate, rs.DocumentType, rs.ReportType, rs.SecurityClass, rs.CustomACL]);
                    });

                    // Export data
                    workbook.xlsx.writeBuffer().then((data: any) => {
                        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                        FileSaver.saveAs(blob, "ExportedSearchResult.xlsx");
                        resolve(true);
                    });
                });
            } catch{
                resolve(false);
            }
        });
        return promise;
    }

    private getAllSearchData(searchText: string): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.searchSrv.searchAllResults(searchText, 1, [], null, (searchResults: any[]) => {
                let results: any[] = [];
                searchResults.forEach(searchRs => {
                    results.push({
                        AccessLink: Environment.phaPageUrl + "AMFile.aspx?Guid=" + searchRs.FeberGuid,
                        Title: searchRs.Title,
                        AttachedUrl: (!_.isNil(searchRs.AttachedUrlOWSURLH)) ? searchRs.AttachedUrlOWSURLH.split(',')[0] : "",
                        Author: Helper.getPeoplePickerString(searchRs.FeberAuthor, true),
                        AuthorName: Helper.getPeoplePickerString(searchRs.FeberAuthor),
                        Department: searchRs.FeberDepartment.replace('_', '/'),
                        ReportDate: ((!_.isNil(searchRs.FeberDocumentDate) && !_.isUndefined(searchRs.FeberDocumentDate)) ? Helper.getDateTimeFormatForUI(new Date(searchRs.FeberDocumentDate), true) : ""),
                        ApproveDate: ((!_.isNil(searchRs.FeberApproveDate) && !_.isUndefined(searchRs.FeberApproveDate)) ? Helper.getDateTimeFormatForUI(new Date(searchRs.FeberApproveDate), true) : ""),
                        DocumentType: searchRs.FeberUploadType,
                        ReportType: (searchRs.FeberUploadType !== Constants.DOCUMENT_TYPE.LL) ? searchRs.FeberDocumentType : "Lessons Learned",
                        SecurityClass: searchRs.FeberSecurityClass,
                        CustomACL: Helper.getPeoplePickerString(searchRs.FeberCustomACL)
                    });
                });
                resolve(results);
            });
        });
        return promise;
    }

    exportDepartmentValidationResults(division: string, items: any[]) {
        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];

                let worksheet = workbook.addWorksheet('Result');
                worksheet.addRow(["Division Name", "Approver", Constants.DOCUMENT_TYPE.RnD, Constants.DOCUMENT_TYPE.LL,
                    Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper, "Validation Status"]);
                items.forEach(item => {
                    worksheet.addRow([
                        item.DepartmentName,
                        item.Approver,
                        (item.RnD === true) ? "✔" : "",
                        (item.LL === true) ? "✔" : "",
                        (item.Thesis === true) ? "✔" : "",
                        (item.Paper === true) ? "✔" : "",
                        (item.Status === "Valid") ? "✔" : "✘"]);
                });
                for (let index = 1; index <= items.length + 1; index++) {
                    let row = worksheet.getRow(index);
                    if (index === 1) {
                        for (let index = 1; index <= 7; index++) {
                            // Bold for header
                            row.getCell(index).font = { bold: true };
                            // Set width
                            switch (index) {
                                case 1: {
                                    worksheet.getColumn(index).width = 20;
                                    break;
                                }
                                case 2: {
                                    worksheet.getColumn(index).width = 35;
                                    break;
                                }
                                case 3:
                                case 4:
                                case 5:
                                case 6: {
                                    worksheet.getColumn(index).width = 8;
                                    break;
                                }
                                case 7: {
                                    worksheet.getColumn(index).width = 15;
                                    break;
                                }
                                default: {
                                    break;
                                }
                            }
                        }
                    }
                    // Add other styles
                    for (let index = 1; index <= 7; index++) {
                        let cell = row.getCell(index);
                        // Add border
                        cell.border = {
                            top: { style: 'thin' },
                            right: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' }
                        };
                        switch (index) {
                            case 2: // Approver
                                {
                                    if (cell.value === "None") {
                                        cell.font = { italic: true };
                                    }
                                    break;
                                }
                            case 7: // Validation Status
                                {
                                    if (cell.value === "✔" || cell.value === "✘") {
                                        cell.font = (cell.value === "✔") ?
                                            { color: { argb: "FF008000" } }
                                            : { color: { argb: "FFE80000" } };
                                    }
                                    break;
                                }

                            default:
                                {
                                    break;
                                }
                        }
                    }
                }

                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, "Department_Validation_" + division + "_" + (new Date()).getFullYear() + ".xlsx");
                    resolve(true);
                });
            } catch{
                resolve(false);
            }
        });
        return promise;
    }

    exportAllDepartmentsValidationResults(ldivisions: any[], listitems: any[]) {
        // divisions.shift();
        // divisions.shift();
        // let divisions: any[] = [];
        // for (let i = 0; i < ldivisions.length; i++) {
        //     if(i > 1){
        //         divisions.push(ldivisions[i])
        //     }
        // }

        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 0, visibility: 'visible'
                }];
                let worksheet = workbook.addWorksheet('Result');
                worksheet.addRow(["Department Name", "Approver", Constants.DOCUMENT_TYPE.RnD, Constants.DOCUMENT_TYPE.LL,
                        Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper, "Validation Status"]);
                let count = 0;
                listitems.forEach(items => {
                    //let worksheet = workbook.addWorksheet(division.key);
                        items.forEach((item: any) => {
                            worksheet.addRow([
                                item.DepartmentName,
                                item.Approver,
                                (item.RnD === true) ? "✔" : "",
                                (item.LL === true) ? "✔" : "",
                                (item.Thesis === true) ? "✔" : "",
                                (item.Paper === true) ? "✔" : "",
                                (item.Status === "Valid") ? "✔" : "✘"]);
                        });
                        count = count + items.length;
                        
                });
                    for (let index = 1; index <= count + 1; index++) {
                        let row = worksheet.getRow(index);
                        if (index === 1) {
                            for (let index = 1; index <= 7; index++) {
                                // Bold for header
                                row.getCell(index).font = { bold: true };
                                // Set width
                                switch (index) {
                                    case 1: {
                                        worksheet.getColumn(index).width = 20;
                                        break;
                                    }
                                    case 2: {
                                        worksheet.getColumn(index).width = 35;
                                        break;
                                    }
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6: {
                                        worksheet.getColumn(index).width = 8;
                                        break;
                                    }
                                    case 7: {
                                        worksheet.getColumn(index).width = 15;
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                        }
                        // Add other styles
                        for (let index = 1; index <= 7; index++) {
                            let cell = row.getCell(index);
                            // Add border
                            cell.border = {
                                top: { style: 'thin' },
                                right: { style: 'thin' },
                                bottom: { style: 'thin' },
                                left: { style: 'thin' }
                            };
                            switch (index) {
                                case 2: // Approver
                                    {
                                        if (cell.value === "None") {
                                            cell.font = { italic: true };
                                        }
                                        break;
                                    }
                                case 7: // Validation Status
                                    {
                                        if (cell.value === "✔" || cell.value === "✘") {
                                            cell.font = (cell.value === "✔") ?
                                                { color: { argb: "FF008000" } }
                                                : { color: { argb: "FFE80000" } };
                                        }
                                        break;
                                    }
    
                                default:
                                    {
                                        break;
                                    }
                            }
                        }
                    }
                //});
                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, "Department_Validation_" + "All" + "_" + (new Date()).getFullYear() + ".xlsx");
                    resolve(true);
                });

            } catch{
                resolve(false);
            }
        });
        return promise;
    }

    exportSystemListData(columns: IColumn[], items: any[]) {
        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];
                let worksheet = workbook.addWorksheet('Report');

                let validColumnNames: string[] = [];
                let validColumnFieldNames: (string | undefined)[] = [];
                columns.forEach((column: IColumn) => {
                    if (column.name !== "") {
                        validColumnNames.push(column.name);
                        validColumnFieldNames.push(column.fieldName);
                    }
                });
                // Add title
                worksheet.addRow(validColumnNames);
                // Add rows
                items.forEach((item: any) => {
                    let rowData: string[] = [];
                    validColumnFieldNames.forEach((fieldName: string | undefined) => {
                        if (!_.isUndefined(fieldName)) {
                            rowData.push((!_.isNil(item[fieldName])) ? item[fieldName] : "");
                        }
                    });
                    worksheet.addRow(rowData);
                });
                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, "ExportedResult.xlsx");
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
            }
            catch{
                resolve(false);
            }
        });
        return promise;
    }

    exportMetadata(divisionCode: string) {
        let promise = new Promise((resolve, reject) => {
            let departmentListsSrv = new DepartmentService();
            departmentListsSrv.getAllListMetadata(divisionCode).then((itemArrs: any[]) => {
                let data = this.prepareMetaData(itemArrs);
                // Workbook
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];
                // RnD
                let worksheetRnD = workbook.addWorksheet(Constants.DOCUMENT_TYPE.RnD);
                worksheetRnD.addRow(data[Constants.DOCUMENT_TYPE.RnD].cols);
                data[Constants.DOCUMENT_TYPE.RnD].items.forEach((item: any) => {
                    worksheetRnD.addRow(this.prepareMetaDataRow(data[Constants.DOCUMENT_TYPE.RnD].fields, item));
                });
                // LL
                let worksheetLL = workbook.addWorksheet(Constants.DOCUMENT_TYPE.LL);
                worksheetLL.addRow(data[Constants.DOCUMENT_TYPE.LL].cols);
                data[Constants.DOCUMENT_TYPE.LL].items.forEach((item: any) => {
                    worksheetLL.addRow(this.prepareMetaDataRow(data[Constants.DOCUMENT_TYPE.LL].fields, item));
                });
                // Thesis
                let worksheetThesis = workbook.addWorksheet(Constants.DOCUMENT_TYPE.Thesis);
                worksheetThesis.addRow(data[Constants.DOCUMENT_TYPE.Thesis].cols);
                data[Constants.DOCUMENT_TYPE.Thesis].items.forEach((item: any) => {
                    worksheetThesis.addRow(this.prepareMetaDataRow(data[Constants.DOCUMENT_TYPE.Thesis].fields, item));
                });
                // Paper
                let worksheetPaper = workbook.addWorksheet(Constants.DOCUMENT_TYPE.Paper);
                worksheetPaper.addRow(data[Constants.DOCUMENT_TYPE.Paper].cols);
                data[Constants.DOCUMENT_TYPE.Paper].items.forEach((item: any) => {
                    worksheetPaper.addRow(this.prepareMetaDataRow(data[Constants.DOCUMENT_TYPE.Paper].fields, item));
                });
                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, "Metadata_" + divisionCode + ".xlsx");
                    resolve();
                });
            }).catch(() => {
                reject();
            });
        });
        return promise;
    }

    private prepareMetaDataRow(fields: string[], item: any) {
        let result: string[] = [];
        fields.forEach((field: string) => {
            if (field.indexOf("/") === -1) {
                if (field.toLowerCase().indexOf("date") === -1) { // Normal field
                    result.push(Helper.setEmptyIfNull(item[field]));
                }
                else { // Date field
                    let dateString: string = Helper.setEmptyIfNull(item[field]);
                    if (dateString !== "") {
                        dateString = new Date(dateString).toLocaleString();
                    }
                    result.push(dateString);
                }
            }
            else { // Lookup field
                let fieldArr: string[] = (field as string).split("/");
                if (!_.isNil(item[fieldArr[0]])) {
                    if (_.isUndefined(item[fieldArr[0]].results)) { // Single field
                        result.push(item[fieldArr[0]][fieldArr[1]]);
                    }
                    else { // Array field
                        let arr: string[] = [];
                        item[fieldArr[0]].results.forEach((element: any) => {
                            arr.push(element[fieldArr[1]]);
                        });
                        result.push(arr.join("; "));
                    }
                }
                else {
                    result.push("");
                }
            }
        });
        return result;
    }

    private prepareMetaData(itemArrs: any[]) {
        let result: any = { RnD: {}, LL: {}, Thesis: {}, Paper: {} };
        let uploadTypes: string[] = [
            Constants.DOCUMENT_TYPE.RnD,
            Constants.DOCUMENT_TYPE.LL,
            Constants.DOCUMENT_TYPE.Thesis,
            Constants.DOCUMENT_TYPE.Paper
        ];
        itemArrs.forEach((items: any[], index: number) => {
            switch (uploadTypes[index]) {
                case Constants.DOCUMENT_TYPE.RnD: {
                    result[uploadTypes[index]].cols = ["Title", "Access mediator path", "Authors", "Author display name", "Division", "Department", "Document date", "Guid", "Upload type", "Upload type description", "Document type", "Document number", "Project number", "Report contains export controlled material", "Security class", "Abstract", "Keywords", "Authorized associates", "Organizational units", "Additional approvers", "Notification users", "Submitter", "Uploaded date", "Approved date", "Order users", "Order workflow ids", "Correlation id", "Workflow id", "Custom ACL"];
                    result[uploadTypes[index]].fields = ["Title", "AccessMediatorPath/Url", "ReportAuthor/Title", "FeberAuthorDisplayName", "Division", "FeberDepartment", "DocumentDate", "GUID1", "UploadType", "UploadTypeDescription", "DocumentType", "DocumentNumber", "ProjectNumber", "RelevantforFDLegislation", "SecurityClass", "Abstract", "FeberKeywords", "AuthorizedAssociates/Title", "OrganizationalUnit/Title", "AdditionalApprovers/Title", "NotificationUsers/Title", "Submitter/Title", "FeberUploadDate", "FeberApproveDate", "OrderUsers/Title", "OrderWorkflowIds", "CorrelationId", "WorkflowID", "CustomACL/Title"];
                    result[uploadTypes[index]].items = items;
                    break;
                }
                case Constants.DOCUMENT_TYPE.LL: {
                    result[uploadTypes[index]].cols = ["Title", "Access mediator path", "Authors", "Author display name", "Division", "Department", "Document date", "Guid", "Upload type", "Upload type description", "IQIS number", "Plant or BU", "Process", "Product", "LL reference number", "Security class", "Keywords", "Submitter", "Uploaded date", "Approved date", "Correlation id", "Workflow id"];
                    result[uploadTypes[index]].fields = ["Title", "AccessMediatorPath/Url", "ReportAuthor/Title", "FeberAuthorDisplayName", "Division", "FeberDepartment", "DocumentDate", "GUID1", "UploadType", "UploadTypeDescription", "IQISNumber", "PlantorBU", "Process", "Product", "LLReferenceNumber", "SecurityClass", "FeberKeywords", "Submitter/Title", "FeberUploadDate", "FeberApproveDate", "CorrelationId", "WorkflowID"];
                    result[uploadTypes[index]].items = items;
                    break;
                }
                case Constants.DOCUMENT_TYPE.Thesis: {
                    result[uploadTypes[index]].cols = ["Title", "Access mediator path", "Authors", "Author display name", "Division", "Department", "Document date", "Guid", "Upload type", "Upload type description", "Document type", "Security class", "Abstract", "Keywords", "Authorized associates", "Organizational units", "Additional approvers", "Notification users", "Submitter", "Uploaded date", "Approved date", "Order users", "Order workflow ids", "Correlation id", "Workflow id", "Custom ACL"];
                    result[uploadTypes[index]].fields = ["Title", "AccessMediatorPath/Url", "ReportAuthor/Title", "FeberAuthorDisplayName", "Division", "FeberDepartment", "DocumentDate", "GUID1", "UploadType", "UploadTypeDescription", "DocumentType", "SecurityClass", "Abstract", "FeberKeywords", "AuthorizedAssociates/Title", "OrganizationalUnit/Title", "AdditionalApprovers/Title", "NotificationUsers/Title", "Submitter/Title", "FeberUploadDate", "FeberApproveDate", "OrderUsers/Title", "OrderWorkflowIds", "CorrelationId", "WorkflowID", "CustomACL/Title"];
                    result[uploadTypes[index]].items = items;
                    break;
                }
                case Constants.DOCUMENT_TYPE.Paper: {
                    result[uploadTypes[index]].cols = ["Title", "Access mediator path", "Authors", "AuthorD display name", "Division", "Department", "Document date", "Guid", "Upload type", "Upload type description", "Attached url", "Name of conference", "Date of conference", "Location of conference", "Name of journal", "Date of publication", "Document type", "Security class", "Keywords", "Additional approvers", "Notification users", "Submitter", "Uploaded date", "Approved date", "Correlation id", "Workflow id"];
                    result[uploadTypes[index]].fields = ["Title", "AccessMediatorPath/Url", "ReportAuthor/Title", "FeberAuthorDisplayName", "Division", "FeberDepartment", "DocumentDate", "GUID1", "UploadType", "UploadTypeDescription", "AttachedUrl/Url", "NameOfConference", "DateOfConference", "LocationOfConference", "NameOfJournal", "DateOfPublication", "DocumentType", "SecurityClass", "FeberKeywords", "AdditionalApprovers/Title", "NotificationUsers/Title", "Submitter/Title", "FeberUploadDate", "FeberApproveDate", "CorrelationId", "WorkflowID"];
                    result[uploadTypes[index]].items = items;
                    break;
                }
            }
        });
        return result;
    }

    exportStatistics(type: string, data: any[]) {
        let promise = new Promise((resolve) => {
            let count_data: any[] = this.getCountData(type, data);
            let detail_data: any = this.getDetailData(type, data);
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];

                let count_worksheet = workbook.addWorksheet('Count');
                count_worksheet.addRow(["Division", "Month", "Count"]);
                count_data.forEach(item => {
                    count_worksheet.addRow([item.Division, item.Month, item.Count]);
                });

                let detail_worksheet = workbook.addWorksheet('Detail');
                detail_worksheet.addRow(detail_data.cols);
                detail_data.items.forEach((item: any) => {
                    let row: string[] = [];
                    detail_data.fields.forEach((field: string) => {
                        row.push(item[field]);
                    });
                    detail_worksheet.addRow(row);
                });

                let nowString: string = (new Date()).getFullYear() + "_" + ((new Date()).getMonth() + 1) + "_" + (new Date()).getDate();
                let fileName = "StatisticReport_" + type.toUpperCase() + "_" + nowString + ".xlsx";
                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, fileName);
                    resolve(true);
                });
            } catch{
                resolve(false);
            }
        });
        return promise;
    }

    private getCountData(type: string, data: any[]) {
        let results: any[] = [];
        data.forEach((item: any) => {
            let division = (type !== "upload") ?
                ((!_.isNil(item["Division"])) ? item.Division : "")
                : ((!_.isNil(item["FeberDivision"])) ? item.FeberDivision : "");
            let eventMonth = this.getMonthNumber((type !== "upload") ? item.EventDate : item.FeberApproveDate);
            let createNewRecord = (_division: string, month: string) => {
                results.push({
                    Division: _division,
                    Month: month,
                    Count: 1
                });
            };
            if (results.length === 0) {
                createNewRecord(division, eventMonth);
            }
            else {
                let foundDividion: any = false;
                let foundMonth: any = false;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].Division === division) {
                        foundDividion = true;
                        if (results[i].Month === eventMonth) {
                            foundMonth = true;
                            // Increase count
                            results[i].Count += 1;
                        }
                    }
                }
                if (foundDividion === false) {
                    createNewRecord(division, eventMonth);
                }
                else if (foundMonth === false) {
                    createNewRecord(division, eventMonth);
                }
            }
        });
        results = Helper.sortObjects(results, "Month");
        results = Helper.sortObjects(results, "Division");
        return results;
    }

    private getDetailData(type: string, data: any[]) {
        let result: { cols: string[], fields: string[], items: any[] } = { cols: [], fields: [], items: [] };
        switch (type) {
            case "download":
            case "order":
            case "delete": {
                result.cols = ["Title", "Security class", "Guid", "Division", "Department", "Report type", "Document type", "AMFile url", "Event date"];
                result.fields = ["Title", "SecurityClass", "Guid", "Division", "Department", "ReportType", "DocumentType", "AMFileUrl", "EventDate"];
                data.forEach((item: any) => {
                    result.items.push({
                        Title: item.Title,
                        SecurityClass: Helper.getSCLongName(item.SecurityClass),
                        Guid: Helper.setEmptyIfNull(item.GUID1),
                        Division: Helper.setEmptyIfNull(item.Division),
                        Department: Helper.setEmptyIfNull(item.Department).replace("_", "/"),
                        ReportType: Helper.setEmptyIfNull(item.UploadType),
                        DocumentType: Helper.setEmptyIfNull(item.ReportType),
                        EventDate: (!_.isNil(item.EventDate)) ? new Date(item.EventDate).toLocaleDateString('en-GB') : "",
                        //EventDate: (!_.isNil(item.EventDate)) ? new Date(item.EventDate).toLocaleString().split(",")[0] : "",
                        //User: (!_.isNil(item.Submitter)) ? item.Submitter.Title : ""
                    });
                });
                result.items = Helper.sortObjects(result.items, "Title");
                result.items = Helper.sortObjects(result.items, "DocumentType");
                result.items = Helper.sortObjects(result.items, "ReportType");
                result.items = Helper.sortObjects(result.items, "Division");
                break;
            }
            case "upload": {
                result.cols = ["Title", "Security class", "Authors", "Division", "Department", "Report type", "Document type", "AMFile url", "Approved date"];
                result.fields = ["Title", "SecurityClass", "Authors", "Division", "Department", "ReportType", "DocumentType", "AMFileUrl", "ApprovedDate"];
                data.forEach((item: any) => {
                    result.items.push({
                        Title: item.Title,
                        SecurityClass: Helper.setEmptyIfNull(item.FeberSecurityClass),
                        Authors: Helper.getPeoplePickerString(item.FeberAuthor),
                        Division: Helper.setEmptyIfNull(item.FeberDivision),
                        Department: Helper.setEmptyIfNull(item.FeberDepartment).replace("_", "/"),
                        ReportType: Helper.setEmptyIfNull(item.FeberUploadType),
                        DocumentType: Helper.setEmptyIfNull(item.FeberDocumentType),
                        AMFileUrl: (!_.isNil(item.AttachedUrlOWSURLH) && item.AttachedUrlOWSURLH !== "") ? (item.AttachedUrlOWSURLH as string).split(",")[0] : Helper.generateAMFilePathByGuid(item.FeberGuid),
                        //ApprovedDate: (!_.isNil(item.FeberApproveDate)) ? new Date(item.FeberApproveDate).toLocaleString() : "",
                        ApprovedDate: (!_.isNil(item.FeberApproveDate)) ? new Date(item.FeberApproveDate).toLocaleDateString('en-GB') : "",
                    });
                });
                result.items = Helper.sortObjects(result.items, "Title");
                result.items = Helper.sortObjects(result.items, "DocumentType");
                result.items = Helper.sortObjects(result.items, "ReportType");
                result.items = Helper.sortObjects(result.items, "Division");
                break;
            }
            case "search": {
                result.cols = ["Title", "Event Date", "Division", "Department"];
                result.fields = ["Title", "EventDate", "Division", "Department"];
                data.forEach((item: any) => {
                    result.items.push({
                        Title: item.Title,
                        //EventDate: (!_.isNil(item.EventDate)) ? new Date(item.EventDate).toLocaleString().split(",")[0] : "",
                        EventDate: (!_.isNil(item.EventDate)) ? new Date(item.EventDate).toLocaleDateString('en-GB') : "",
                        Division: Helper.setEmptyIfNull(item.Division),
                        Department: Helper.setEmptyIfNull(item.Department).replace("_", "/"),
                        //User: item.Author.Title
                    });
                });
                result.items = Helper.sortObjects(result.items, "Title");
                result.items = Helper.sortObjects(result.items, "Division");
                break;
            }
        }
        return result;
    }

    private getMonthNumber(dateString: string) {
        if (!_.isNil(dateString)) {
            let date = new Date(dateString);
            return (date.getFullYear() + "/" + ((date.getMonth() + 1 < 10) ? "0" : "") + (date.getMonth() + 1));
        }
        return "";
    }


    private getCustomData(searchText: string): Promise<any[]> {
        let promise: Promise<any[]> = new Promise((resolve) => {
            this.searchSrv.searchAllResultsCustom(searchText, 1, [], null, (searchResults: any[]) => {
                let results: any[] = [];
                searchResults.forEach(searchRs => {
                    // if(searchRs.Title.startsWith("=") || searchRs.Title.startsWith("-")){
                    //     searchRs.Title = "'" + searchRs.Title
                    // }
                    // if(searchRs.AttachedUrlOWSURLH.startsWith("=") || searchRs.AttachedUrlOWSURLH.startsWith("-")){
                    //     searchRs.AttachedUrlOWSURLH = "'" + searchRs.AttachedUrlOWSURLH
                    // }
                    // if(searchRs.FeberAuthor.startsWith("=") || searchRs.FeberAuthor.startsWith("-")){
                    //     searchRs.FeberAuthor = "'" + searchRs.FeberAuthor
                    // }
                    // if(searchRs.FeberAuthorDisplayNameOWSMTXT.startsWith("=") || searchRs.FeberAuthorDisplayNameOWSMTXT.startsWith("-")){
                    //     searchRs.FeberAuthorDisplayNameOWSMTXT = "'" + searchRs.FeberAuthorDisplayNameOWSMTXT
                    // }
                    // if(searchRs.FeberDepartment.startsWith("=") || searchRs.FeberDepartment.startsWith("-")){
                    //     searchRs.FeberDepartment = "'" + searchRs.FeberDepartment
                    // }
                    // if(searchRs.FeberDocumentDate.startsWith("=") || searchRs.FeberDocumentDate.startsWith("-")){
                    //     searchRs.FeberDocumentDate = "'" + searchRs.FeberDocumentDate
                    // }
                    // if(searchRs.FeberUploadType.startsWith("=") || searchRs.FeberUploadType.startsWith("-")){
                    //     searchRs.FeberUploadType = "'" + searchRs.FeberUploadType
                    // }
                    // if(searchRs.FeberKeywords.startsWith("=") || searchRs.FeberKeywords.startsWith("-")){
                    //     searchRs.FeberKeywords = "'" + searchRs.FeberKeywords
                    // }
                    // if(searchRs.FeberAbstract.startsWith("=") || searchRs.FeberAbstract.startsWith("-")){
                    //     searchRs.FeberAbstract = "'" + searchRs.FeberAbstract
                    // }
                    results.push({
                        AccessLink: Environment.phaPageUrl + "AMFile.aspx?Guid=" + searchRs.FeberGuid,
                        Title: searchRs.Title,
                        AttachedUrl: (!_.isNil(searchRs.AttachedUrlOWSURLH)) ? searchRs.AttachedUrlOWSURLH.split(',')[0] : "",
                        Author: Helper.getPeoplePickerString(searchRs.FeberAuthor, true),
                        AuthorFullName: Helper.getPeopleFullName(searchRs.FeberAuthor),
                        AuthorDisplayName: searchRs.FeberAuthorDisplayNameOWSMTXT,
                        Department: searchRs.FeberDepartment.replace('_', '/'),
                        ReportDate: ((!_.isNil(searchRs.FeberDocumentDate) && !_.isUndefined(searchRs.FeberDocumentDate)) ? Helper.getDateTimeFormatForUI(new Date(searchRs.FeberDocumentDate), true) : ""),
                        DocumentType: searchRs.FeberUploadType,
                        ReportType: (searchRs.FeberUploadType !== Constants.DOCUMENT_TYPE.LL) ? searchRs.FeberDocumentType : "Lessons Learned",
                        Keywords: searchRs.FeberKeywords,
                        Abstract: searchRs.FeberAbstract
                    });
                });
                resolve(results);
            });
        });
        return promise;
    }

    exportCustomData(reportTypes: string[]) {
        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];
                reportTypes.forEach(element => {
                    if(element === "Paper"){
                        let journalWorksheet = workbook.addWorksheet("Journal Paper");
                        journalWorksheet.addRow(["Link to document (AM-File)", "Title", "Author", "Author Full Name", "Author Display Name", "Department", "Report Date", "Report Type", "Keywords", "Abstract"]);
                        let conferenceWorksheet = workbook.addWorksheet("Conference Paper");
                        conferenceWorksheet.addRow(["Link to document (AM-File)", "Title", "Author", "Author Full Name", "Author Display Name", "Department", "Report Date", "Report Type", "Keywords", "Abstract"]);
                        this.getCustomData("* ContentType:" + element).then((results: any[]) => {
                            results.forEach(rs => {
                                let link: string = rs.AccessLink;
                                if (rs.AttachedUrl !== "") {
                                    // Get link, exceptional case for paper
                                    link = rs.AttachedUrl;
                                }
                                if(rs.ReportType === "Journal Paper"){
                                    journalWorksheet.addRow([link, rs.Title, rs.Author, rs.AuthorFullName, rs.AuthorDisplayName, rs.Department, rs.ReportDate, rs.ReportType, rs.Keywords, rs.Abstract]);
                                }
                                else{
                                    conferenceWorksheet.addRow([link, rs.Title, rs.Author, rs.AuthorFullName, rs.AuthorDisplayName, rs.Department, rs.ReportDate, rs.ReportType, rs.Keywords, rs.Abstract]);
                                }
                            });
                        });
                    }
                    else {
                        let worksheet = workbook.addWorksheet(element);
                        worksheet.addRow(["Link to document (AM-File)", "Title", "Author", "Author Full Name", "Author Display Name", "Department", "Report Date", "Report Type", "Keywords", "Abstract"]);
                        this.getCustomData("* ContentType:" + element).then((results: any[]) => {
                            results.forEach(rs => {
                                let link: string = rs.AccessLink;
                                if (rs.AttachedUrl !== "") {
                                    // Get link, exceptional case for paper
                                    link = rs.AttachedUrl;
                                }
                                worksheet.addRow([link, rs.Title, rs.Author, rs.AuthorFullName, rs.AuthorDisplayName, rs.Department, rs.ReportDate, rs.ReportType, rs.Keywords, rs.Abstract]);
                            });
                        });
                    }
                });
                // Export data
                setTimeout(() => {
                    workbook.xlsx.writeBuffer().then((data: any) => {
                        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                        FileSaver.saveAs(blob, "ExportedCustomData.xlsx");
                        resolve(true);
                    });
                }, 6000)
                // workbook.xlsx.writeBuffer().then((data: any) => {
                //     const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                //     FileSaver.saveAs(blob, "ExportedCustomData.xlsx");
                //     resolve(true);
                // });
            } catch{
                resolve(false);
            }
        });
        return promise;
    }

    exportDivisionsAdmins(groupsAdmins: any[], divisions: any[]) {
        let promise = new Promise((resolve) => {
            try {
                let workbook = new Excel.Workbook();
                workbook.creator = 'Feber';
                workbook.created = new Date();
                workbook.views = [{
                    x: 0, y: 0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }];

                let worksheet = workbook.addWorksheet('Groups Members');
                worksheet.addRow(["Division", "Group Name", "Member Name", "Login Name", "Email"]);

                let filterAdmins : any[] = [];
                groupsAdmins.forEach(group => {
                    if(group.groupName.indexOf('Admin') > -1) {
                        filterAdmins.push(group);
                    }
                })

                let filterDivisionAdmins : any[] = [];
                filterAdmins.forEach(admin => {
                    if(admin.groupName.indexOf('Super') === -1) {
                        filterDivisionAdmins.push(admin);
                    }
                })

                filterDivisionAdmins.forEach(group => {
                    let division = group.groupName.substring(6, group.groupName.length);
                    division = division.substring(0, division.indexOf(" "));
                    if(divisions.indexOf(division) > -1)
                    {
                        if(group.members.length > 0){
                            group.members.forEach((member: any) =>{
                                worksheet.addRow([division, group.groupName, member.Title, member.LoginName, member.Email]);
                            })
                        }
                        else
                        {
                            worksheet.addRow([division, group.groupName, "", "", ""]);
                        }
    
                    }
                    else{
                        if(group.members.length > 0){
                            group.members.forEach((member: any) =>{
                                worksheet.addRow(["", group.groupName, member.Title, member.LoginName, member.Email]);
                            })
                        }
                        else
                        {
                            worksheet.addRow(["", group.groupName, "", "", ""]);
                        }
                    }
                });

                // Export data
                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                    FileSaver.saveAs(blob, "ExportedDivisionsAdministrators.xlsx");
                    resolve(true);
                });
            } catch{
                resolve(false);
            }
        });
        return promise;
    }
}

export default ExcelService;