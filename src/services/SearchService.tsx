import Helper from '../core/libraries/Helper';
import Environment from '../Environment';
import Constants from '../core/libraries/Constants';
import BaseService from './BaseService';
import "@pnp/polyfill-ie11";
import { SearchResults, ISort, ISearchResult, ISearchQuery } from '@pnp/sp/presets/all';
import { ISearchResultsObj } from '../store/search/types';
import _ from 'lodash';


class SearchService extends BaseService {

    callSearch(
        searchText: string = "", // searched text
        status: any = "", // "" --> New Ssearch, "prev" --> previous page, "next" --> next page
        numberOfResults: number, // The number of returned results
        inputSearchCount = "", // The text to display for pagination
        inputSearchTotal: number | string = 0, // The total number of all results
        pageNumber: number = 0, // The number of page to be loaded
        sortList: ISort[], // Conditions of sort
        currentDrawResults: SearchResults | null // Draw results from previous search (if any)
    ): Promise<ISearchResultsObj | undefined> {
        let promise: Promise<ISearchResultsObj | undefined> = new Promise<ISearchResultsObj | undefined>((resolve) => {
            let ReturnedSearchResult: any[] = [];
            let SearchCount = "";
            let SearchTotal = 0;
            let getFunction = null;
            if (status === "prev" && pageNumber === 2) {
                pageNumber = 1;
                status = "";
            }
            switch (status) {
                case "": {
                    let queryOptions: ISearchQuery = {
                        Querytext: searchText,
                        //Querytext: "* ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper FeberDivision:AS FeberDivision:AA",
                        TrimDuplicates: false,
                        RowLimit: numberOfResults,
                        SelectProperties: ["ListID", "ListItemID", "Title", "FeberAccessMediatorPath", "FeberUploadType",
                            "FeberDocumentDate", "FeberAuthor", "FeberAuthorDisplayNameOWSMTXT", "FeberDepartment", "FeberDivision", "FeberSecurityClass",
                            "Path", "FeberGuid", "FeberKeywords", "FeberAbstract", "FeberDocumentType",
                            // RnD
                            "FeberDocumentNumber",
                            // LL
                            "FeberPlantorBU",
                            "FeberProcess",
                            "FeberProduct",
                            "LLReferenceNumber",
                            // Thesis - None
                            // Paper
                            "AttachedUrlOWSURLH",
                            "FeberNameOfConference",
                            "FeberLocationOfConference",
                            "FeberDateOfConference",
                            "FeberNameOfJournal",
                            "FeberDateOfPublication"
                        ],
                    };
                    if (_.isUndefined(queryOptions.SortList)) {
                        queryOptions.SortList = [];
                    }
                    if (sortList.length > 0) {
                        queryOptions.SortList = sortList;
                    }
                    pageNumber = 1;
                    SearchCount = "";
                    SearchTotal = 0;
                    getFunction = this.sp.search(queryOptions);
                    break;
                }
                case "prev": {
                    if (!_.isNil(currentDrawResults)) {
                        getFunction = currentDrawResults.getPage(pageNumber - 1);
                    }
                    break;
                }
                case "next": {
                    if (!_.isNil(currentDrawResults)) {
                        getFunction = currentDrawResults.getPage(pageNumber + 1);
                    }
                    break;
                }
                default: { // Go to page
                    if (!_.isNil(currentDrawResults)) {
                        getFunction = currentDrawResults.getPage(status);
                    }
                    break;
                }
            }
            (getFunction as any).then((rs: SearchResults) => {
                switch (status) {
                    case "": {
                        SearchCount = "1 - " + rs.RowCount;
                        break;
                    }
                    case "prev": {
                        SearchCount = (numberOfResults * (pageNumber - 2) + 1) + " - " + (+inputSearchCount.split(" - ")[0] - 1).toString();
                        --pageNumber;
                        break;
                    }
                    case "next": {
                        SearchCount = (+inputSearchCount.split(" - ")[1] + 1).toString() + " - "
                            + ((numberOfResults * (pageNumber + 1) < inputSearchTotal) ? numberOfResults * (pageNumber + 1) : inputSearchTotal);
                        ++pageNumber;
                        break;
                    }
                    default: { // Go to page
                        SearchCount = (numberOfResults * (status - 1) + 1) + " - "
                            + ((numberOfResults * status < inputSearchTotal) ? numberOfResults * status : inputSearchTotal);
                        pageNumber = status;
                        break;
                    }
                }
                SearchTotal = rs.TotalRows;
                let results = rs.PrimarySearchResults as any[];
                results.forEach(result => {
                    ReturnedSearchResult.push({
                        Title: result.Title,
                        ListID: result.ListID,
                        ListItemID: result.ListItemID,
                        AMPath: (!_.isNil(result.FeberAccessMediatorPath)) ? result.FeberAccessMediatorPath.split(',')[0] : "",
                        DocumentType: (result.FeberUploadType !== Constants.DOCUMENT_TYPE.LL) ? result.FeberDocumentType : "Lessons Learned",
                        Authors: Helper.getPeoplePickerString(result.FeberAuthor),
                        AuthorDisplayName: result.FeberAuthorDisplayNameOWSMTXT,
                        Division: result.FeberDivision,
                        Department: result.FeberDepartment.replace("_", "/"),
                        UploadType: result.FeberUploadType,
                        DocumentDate: (!_.isNil(result.FeberDocumentDate)) ? new Date(result.FeberDocumentDate) : null,
                        SecurityClass: result.FeberSecurityClass,
                        Keywords: result.FeberKeywords,
                        Abstract: result.FeberAbstract,
                        Path: result.Path,
                        Guid: result.FeberGuid,
                        // RnD
                        ReportNumber: result.FeberDocumentNumber,
                        // LL
                        PlantorBU: result.FeberPlantorBU,
                        Product: result.FeberProduct,
                        Process: result.FeberProcess,
                        LLReferenceNumber: result.LLReferenceNumber,
                        // Thesis - None
                        // Paper
                        AttachedUrl: (!_.isNil(result.AttachedUrlOWSURLH)) ? result.AttachedUrlOWSURLH.split(',')[0] : "",
                        ConferenceName: result.FeberNameOfConference,
                        ConferenceLocation: result.FeberLocationOfConference,
                        ConferenceDate: result.FeberDateOfConference,
                        JournalName: result.FeberNameOfJournal,
                        PublicationDate: result.FeberDateOfPublication
                    });
                });
                resolve({
                    results: ReturnedSearchResult,
                    count: SearchCount,
                    total: SearchTotal,
                    pageNumber: pageNumber,
                    sortList: sortList,
                    drawResults: rs
                } as ISearchResultsObj);
            }).catch((ex: any) => {
                resolve(undefined);
            });
        });
        return promise;
    }

    checkPermission(userId: number, guid: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "Search/CheckPermission/" + userId + "/" + guid)
                .then((result) => {
                    resolve(result.data);
                }).catch(() => {
                    resolve(false);
                });
        });
        return promise;
    }

    checkPermissionByWebService(userToken: string, userId: string, guid: string) {
        let promise = new Promise((resolve) => {
            this.axios.get(Environment.feberWebServiceUrl + "IDM/CheckCustomACL?" + "userId=" + userId + "&reportGuid=" + guid, {
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "Authorization": userToken
                }
            }).then((result) => {
                resolve(result.data.ResultValue === "True");
            }).catch(() => {
                resolve(false);
            });
        });
        return promise;
    }

    // checkPermissionByWCF(userId: string, guid: string) {
    //     let jsonpAdapter = require('axios-jsonp');
    //     let promise = new Promise((resolve) => {
    //         this.axios({
    //             url: Environment.feberWCFUrl + "CheckCustomACL?userId=" + userId + "&reportGuid=" + guid,
    //             adapter: jsonpAdapter
    //         }).then((result) => {
    //             resolve(result.data.ResultValue === "True");
    //         }).catch(() => {
    //             resolve(false);
    //         });
    //     });
    //     return promise;
    // }

    searchAllResults(searchText: string = "", pageNumber: number = 1, results: ISearchResult[] = [], nextFunction: any = null, callback: any = null) {
        let executedFunction: Promise<SearchResults>;
        if (_.isNil(nextFunction)) {
            let queryOptions: ISearchQuery = {
                Querytext: searchText,
                TrimDuplicates: false,
                RowLimit: 500,
                SelectProperties: ['Title', 'FeberSecurityClass', 'FeberAuthor', "FeberDivision", 'FeberDepartment', 'FeberDocumentDate', 'AttachedUrlOWSURLH',
                    'FeberCustomACL', 'FeberUploadType', "FeberGuid", "FeberUploadDate", "FeberApproveDate", "FeberDocumentType"]
            };
            executedFunction = this.sp.search(queryOptions);
        }
        else {
            executedFunction = nextFunction.getPage(pageNumber);
        }
        executedFunction.then((data: SearchResults) => {
            data.PrimarySearchResults.forEach(rs => {
                results.push(rs);
            });
            if (results.length < data.TotalRows) {
                pageNumber++;
                this.searchAllResults("", pageNumber, results, data, callback);
            }
            else {
                if (!_.isNil(callback)) {
                    callback(results);
                }
            }
        });
    }

    searchAllResultsCustom(searchText: string = "", pageNumber: number = 1, results: ISearchResult[] = [], nextFunction: any = null, callback: any = null) {
        let executedFunction: Promise<SearchResults>;
        if (_.isNil(nextFunction)) {
            let queryOptions: ISearchQuery = {
                Querytext: searchText,
                TrimDuplicates: false,
                RowLimit: 500,
                SelectProperties: ["Title", "FeberAuthor", "FeberAuthorDisplayNameOWSMTXT", "FeberDivision", "FeberDepartment", "FeberDocumentDate", "AttachedUrlOWSURLH",
                "FeberUploadType", "FeberGuid", "FeberUploadDate", "FeberKeywords", "FeberAbstract", "FeberDocumentType"]
            };
            executedFunction = this.sp.search(queryOptions);
        }
        else {
            executedFunction = nextFunction.getPage(pageNumber);
        }
        executedFunction.then((data: SearchResults) => {
            data.PrimarySearchResults.forEach(rs => {
                results.push(rs);
            });
            if (results.length < data.TotalRows) {
                pageNumber++;
                this.searchAllResultsCustom("", pageNumber, results, data, callback);
            }
            else {
                if (!_.isNil(callback)) {
                    callback(results);
                }
            }
        });
    }

    searhReportByGuid(guid: string) {
        let searchResults: any;
        return this.callSearch(
            guid + " ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper",
            "", 1, "", 0, 0, [], searchResults);
    }

}

export default SearchService;