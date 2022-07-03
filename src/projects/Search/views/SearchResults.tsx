/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import * as querystring from 'querystring';
import Search_Result from '../components/Search_Item/Search_Result';
import Search_Refinement_ReportType from '../components/Search_Refinement/Search_Refinement_ReportType';
import Search_Refinement_ReportDate from '../components/Search_Refinement/Search_Refinement_ReportDate';
import Search_Refinement_Department from '../components/Search_Refinement/Search_Refinement_Department';
import Search_Refinement_Division from '../components/Search_Refinement/Search_Refinement_Division';
import Search_Refinement_Author from '../components/Search_Refinement/Search_Refinement_Author';
import Search_ResultShimmer from '../components/Search_Item/Search_ResultShimmer';
import SomethingWentWrong from '../../../core/components/SomethingWentWrong';

import SystemService from '../../../services/SystemService';
import ExcelService from '../../../services/ExcelService';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import Helper from '../../../core/libraries/Helper';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import { IUserProfile } from '../../../store/permission/types';
import { showDialog, showToastMessage, confirmDialog } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { ISearchResultsObj, IRefinements } from '../../../store/search/types';
import { getSearchResults } from '../../../store/search/thunks';
import { addRefinements, handleSearch } from '../../../store/search/actions';
import _, { forEach, isUndefined } from 'lodash';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import RbSearchField from '../../../bosch-react/components/search-field/RbSearchField';

interface SearchResultsProps {
    // User Profile
    userProfile: IUserProfile | undefined,
    // Utilities
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    // Search
    isLoading: boolean | null,
    searchResultsObj: ISearchResultsObj | undefined,
    refinements: IRefinements,
    getSearchResults: any,
    addRefinements: typeof addRefinements,
    handleSearch: any,
    // Other Props
    location: any,
    history: any
}

class SearchResults extends React.Component<SearchResultsProps, any> {

    systemListsSrv: SystemService = new SystemService();

    excelSrv: ExcelService = new ExcelService(Environment.appUrl);

    constructor(props: SearchResultsProps) {
        super(props);

        this.state = {
            selectedSort: "",
            SearchBoxRef: React.createRef(),
            ReportDateRef: React.createRef(),
            AuthorRef: React.createRef(),
            DepartmentRef: React.createRef(),

        };

        this.callSearch = this.callSearch.bind(this);
        this.searchNewText = this.searchNewText.bind(this);
        this.addToSearchedStatistics = this.addToSearchedStatistics.bind(this);

        this.handleSearch = this.handleSearch.bind(this);

        this.getReportTypes = this.getReportTypes.bind(this);
        this.getDepartments = this.getDepartments.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.changeNumberOfResults = this.changeNumberOfResults.bind(this);

        this.addSubscription = this.addSubscription.bind(this);
        this.closeSubscriptionDialog = this.closeSubscriptionDialog.bind(this);

        this.exportMetaData = this.exportMetaData.bind(this);

        this.sendCIHotlineRequest = this.sendCIHotlineRequest.bind(this);
        this.refineDivisionName = this.refineDivisionName.bind(this);

        this.exportCustomData = this.exportCustomData.bind(this);
    }

    componentDidMount() {
        let parameters: any = querystring.parse(this.props.location.search);
        // Keyword
        let keyword = (!_.isUndefined(parameters["?keyword"])) ? Helper.decodeCustomized(decodeURIComponent(parameters["?keyword"])) : "*";
        this.state.SearchBoxRef.current.setValue(keyword);
        // Division
        let division = (!_.isUndefined(parameters["division"])) ? decodeURIComponent(parameters["division"]) : "";
        // Report date
        let reportDate = (!_.isUndefined(parameters["reportdate"])) ? decodeURIComponent(parameters["reportdate"]) : "";
        this.state.ReportDateRef.current.setDefaultValues(reportDate);
        // Report type
        let reporttype = (!_.isUndefined(parameters["reporttype"])) ? decodeURIComponent(parameters["reporttype"]) : "";
        // Author
        let author = (!_.isUndefined(parameters["author"])) ? decodeURIComponent(parameters["author"]) : "";
        this.state.AuthorRef.current.setDefaultValues(author);
        // Department
        let department = (!_.isUndefined(parameters["department"])) ? decodeURIComponent(parameters["department"]) : "";
        this.state.DepartmentRef.current.setDefaultValues(department);
        // Sort
        let selectedSort = (!_.isUndefined(parameters["sort"]) && parameters["sort"] !== "") ? decodeURIComponent(parameters["sort"]) : "";
        this.setState({ selectedSort: selectedSort });
        let sortList = (selectedSort !== "") ? [{
            Property: selectedSort.split("_")[0],
            Direction: parseInt(selectedSort.split("_")[1])
        }] : [];
        // Paging
        let pagenumber: number = (!_.isUndefined(parameters["pagenumber"]) && parameters["pagenumber"] !== "") ? parseInt(decodeURIComponent(parameters["pagenumber"])) : 1;
        // UPDATE STATE AND SEARCH
        this.props.addRefinements([
            { name: "keyword", value: keyword },
            { name: "division", value: division },
            { name: "reportDate", value: reportDate },
            { name: "reportType", value: reporttype },
            { name: "author", value: author },
            { name: "department", value: department },
            { name: "sortList", value: sortList },
            { name: "numberOfResults", value: Helper.changeSearchNumberOfResultsFromCache() },
            { name: "pageNumber", value: pagenumber }
        ]);
        Helper.runNewTask(() => {
            this.callSearch("");
        });
    }

    render() {
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <br />

                    {/* Refinement Area */}
                    <div className="ms-Grid-col ms-sm2" style={{ paddingLeft: "20px", paddingRight: "20px", marginTop: "-24px" }}>
                        <Search_Refinement_ReportType inputReportType={this.props.refinements.reportType} handleSearch={this.handleSearch} />
                        <Search_Refinement_ReportDate ref={this.state.ReportDateRef} handleSearch={this.handleSearch} />
                        <Search_Refinement_Department ref={this.state.DepartmentRef} handleSearch={this.handleSearch} />
                        <Search_Refinement_Division inputDivision={this.props.refinements.division} handleSearch={this.handleSearch} />
                        <Search_Refinement_Author ref={this.state.AuthorRef} handleSearch={this.handleSearch} />
                    </div>

                    {/* Search Results */}
                    <div className="ms-Grid-col ms-sm10" style={{ position: "relative", left: "0.5rem" }}>

                        {/* Search Boxes and Buttons */}
                        <div className="ms-Grid">
                            <div className="ms-Grid-row" style={{ marginTop: "10px", marginBottom: "10px" }}>
                                {(!_.isNil(this.props.userProfile?.permissions)) ? ((!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.RND_USER, Constants.PERMISSIONS.SUPER_ADMIN])) ? <div className="ms-Grid-col ms-sm12 font-bold font-underline" style={{ paddingLeft: "0px", paddingBottom: "1rem", marginTop: "-2rem" }}>
                                    <RbLabel style={{ color: "#0000ff", fontSize: "10px", cursor: "pointer" }} onClick={this.sendCIHotlineRequest} title="Click here to send a request email to CI-Hotline">You do not have the rights to view R&amp;D-Content at the moment. Please contact your IdM-Administrator/CI-Hotline and ask for '{this.props.userProfile?.permissions?.rndGroup}'</RbLabel>
                                </div> : "") : ""}
                                <div className="ms-Grid-col ms-sm6" style={{ paddingLeft: "0px", marginTop: "-0.75rem" }}>
                                    <RbSearchField value={this.props.refinements.keyword} ref={this.state.SearchBoxRef}
                                        placeholder="Search..." onSearch={(event, newValue) => this.searchNewText(newValue)} />
                                </div>
                                <div className="ms-Grid-col ms-sm6" style={{ paddingLeft: "0px" }}>
                                    <span className="rb-ic rb-ic-import pointer" title="Subscribe"
                                        style={{ margin: "0px 0.25rem" }} onClick={this.addSubscription} />
                                    {
                                        (!_.isNil(this.props.userProfile?.permissions)) ?
                                            ((this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) ?
                                                <span className="rb-ic rb-ic-document-xls pointer" title="Export"
                                                    style={{ margin: "0px 0.25rem" }} onClick={this.exportMetaData} /> : "") : ""
                                    }
                                    {/* <span className="rb-ic pointer" style={{ margin: "0px 0.25rem", backgroundColor: "red", height: "25px", width: "25px"}}
                                    onClick={this.exportCustomData}
                                    ></span> */}
                                </div>
                                <div className="ms-Grid-col ms-sm12" />
                                {/* Sort */}
                                <div className="ms-Grid-col ms-sm3" style={{ paddingTop: "10px", paddingLeft: "0px" }}>
                                    <Dropdown
                                        selectedKey={this.state.selectedSort}
                                        options={Constants.DD_SEARCH_SORT_OPTIONS}
                                        onChange={this.changeSort}
                                    />
                                </div>
                                {/* Number of results */}
                                <div className="ms-Grid-col ms-sm5" style={{ paddingTop: "10px", paddingRight: "0px" }}>
                                    <Dropdown style={{ float: "right", marginRight: "3vw", width: "5rem" }}
                                        selectedKey={this.props.refinements.numberOfResults}
                                        options={Constants.DD_SEARCH_NUMBER_OF_RESULTS}
                                        onChange={this.changeNumberOfResults}
                                    />
                                    <RbLabel style={{ float: "right", height: "2rem", paddingTop: "1rem", paddingRight: "0.5rem" }}>Results/Page:&nbsp;</RbLabel>
                                </div>
                                <div className="ms-Grid-col ms-sm12"></div>
                            </div>
                        </div>

                        {(this.props.isLoading == null) ?
                            <SomethingWentWrong />
                            :
                            ((this.props.isLoading === true) ?
                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid-col ms-sm8" style={{ paddingLeft: "0px", paddingRight: "4vw" }}>
                                            {Array.from(Array(this.props.refinements.numberOfResults), () => {
                                                return <Search_ResultShimmer key={Math.random()} />;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                :
                                <div>
                                    {/* Results */}
                                    {(Helper.setEmptyArrayIfNull(this.props.searchResultsObj?.results).length > 0) ?
                                        this.props.searchResultsObj?.results.map((searchResult: any[], index: any) =>
                                            <Search_Result data={searchResult} key={index} />
                                        ) : ""}

                                    {/* Paging */}
                                    {(Helper.setEmptyArrayIfNull(this.props.searchResultsObj?.results).length > 0) ? (
                                        <div className="ms-Grid" style={{ marginTop: "10px", marginBottom: "10px" }}>
                                            <div className="ms-Grid-row ms-textAlignCenter">
                                                <div className="ms-Grid-col ms-sm9">

                                                    {/* Left arrow */}
                                                    <span title="Previous" className={
                                                        "rb-ic rb-ic-back-left"
                                                        + ((this.props.searchResultsObj?.pageNumber === 1) ? "-light-gray" : " pointer")
                                                    } onClick={() => {
                                                        if (this.props.searchResultsObj?.pageNumber !== 1) {
                                                            this.callSearch("prev");
                                                        }
                                                    }} />

                                                    {/* Page numbers */}
                                                    <RbLabel style={{ lineHeight: "3rem", padding: "1rem", minWidth: "5vw", display: "inline-block" }}>
                                                        {(this.props.searchResultsObj?.count !== "") ?
                                                            this.props.searchResultsObj?.count : ""}
                                                    </RbLabel>

                                                    {/* Right arrow */}
                                                    <span title="Next" className={
                                                        "rb-ic rb-ic-forward-right"
                                                        + (Helper.setZeroIfNull(this.props.searchResultsObj?.pageNumber) + 1
                                                            > Math.ceil(Helper.setZeroIfNull(this.props.searchResultsObj?.total) / this.props.refinements.numberOfResults) ? "-light-gray" : " pointer")
                                                    } onClick={() => {
                                                        const condition = Helper.setZeroIfNull(this.props.searchResultsObj?.pageNumber) + 1
                                                            > Math.ceil(Helper.setZeroIfNull(this.props.searchResultsObj?.total) / this.props.refinements.numberOfResults);
                                                        if (!condition) {
                                                            this.callSearch("next");
                                                        }
                                                    }} />

                                                </div>
                                            </div>
                                        </div>) : ""}

                                    {/* Total */}
                                    <div className="ms-Grid" style={{ marginTop: "10px", marginBottom: "10px" }}>
                                        <div className="ms-Grid-row ms-textAlignCenter">
                                            <div className="ms-Grid-col ms-sm9">
                                                <RbLabel>
                                                    {(Helper.setZeroIfNull(this.props.searchResultsObj?.total) > 0) ?
                                                        (Helper.numberWithComma(this.props.searchResultsObj?.total)
                                                            + " result" + ((Helper.setZeroIfNull(this.props.searchResultsObj?.total) > 1) ? "s" : ""))
                                                        : "No result found"}
                                                </RbLabel>
                                            </div>
                                        </div>
                                    </div>

                                </div>)
                        }

                    </div>

                </div>
            </div>
        );
        return element;
    }

    callSearch(status = "", isReloaded = false) {
        // Scroll to top of page
        //document.body.scrollTop = document.documentElement.scrollTop = 0;
        
        // Search
        this.props.getSearchResults(
            this.props.refinements.keyword + this.getReportTypes(this.props.refinements.reportType)
            //+ ((this.props.refinements.division !== "") ? (" FeberDivision:" + this.props.refinements.division) : "")
            + ((this.props.refinements.division.length !== 0) ? (this.refineDivisionName(this.props.refinements.division)) : "")
            + ((this.props.refinements.reportDate !== "") ? (" FeberDocumentDate" + this.props.refinements.reportDate) : "")
            + ((this.props.refinements.author !== "") ? (" FeberAuthor:" + this.props.refinements.author + " OR FeberAuthorDisplayNameOWSMTXT:" + this.props.refinements.author) : "")
            + ((this.props.refinements.department !== "") ? this.getDepartments(this.props.refinements.department) : ""),
            status,
            this.props.refinements.numberOfResults,
            this.props.searchResultsObj?.count,
            this.props.searchResultsObj?.total,
            this.props.searchResultsObj?.pageNumber,
            Helper.setEmptyArrayIfNull(this.props.refinements.sortList),
            this.props.searchResultsObj?.drawResults,
            () => {
                if (status !== "prev" && status !== "next") { // Search or Reload search
                    if ((this.props.refinements.pageNumber === 1 && isReloaded === false) || isReloaded === true) { // First load
                    }
                    else { // Has paging
                        let pageNumber: any = this.props.refinements.pageNumber;
                        this.callSearch(pageNumber, true);
                    }
                }
                else { // Next or previous page
                    this.props.addRefinements([{
                        name: "PageNumber",
                        value: this.props.refinements.pageNumber + ((status === "next") ? 1 : -1)
                    }]);
                    this.handleSearch("pagenumber", this.props.refinements.pageNumber, false);
                };
            }
        );
    }

    searchNewText(text = "*") {
        let searchedText = (text.trim() !== "") ? text.trim() : "*";
        // Add the search information into the SearchedStatistics
        this.addToSearchedStatistics(searchedText);

        let href = "/SearchResults" + window.location.href.split("/SearchResults")[1];
        let array = href.split("&");
        array.forEach(item => {
            if (item.indexOf("?") > -1) {
                let keyword = "?" + item.split("?")[1];
                href = href.replace(keyword, "?keyword=" + encodeURIComponent(Helper.encodeCustomized(searchedText)));
            }
        });
        this.props.history.push(href);
        this.props.addRefinements([
            { name: "Keyword", value: searchedText },
            { name: "PageNumber", value: 1 }
        ]);
        this.handleSearch("pagenumber", 1);
    }

    addToSearchedStatistics(searchedText: string) {
        let data = {
            Title: searchedText,
            EventDate: new Date(),
            Division: this.props.userProfile?.division,
            Department: this.props.userProfile?.department
        };
        this.systemListsSrv.addNewStatisticRecord("SearchedStatistics", data).then((rs: any) => {
            if (rs === true) {
                console.log("Added keyword \"" + searchedText + "\" to searched statistic");
            }
            else {
                console.log("Error in adding keyword \"" + searchedText + "\" to searched statistic");
            }
        }).catch(() => {
            console.log("Error in adding keyword \"" + searchedText + "\" to searched statistic");
        });
    }

    handleSearch(property: string, value: any, shouldCallSearch = true) {
        Helper.runNewTask(() => {
            this.props.handleSearch(property, value, "/SearchResults",
                () => {
                    this.props.addRefinements([{ name: property, value: value }]);
                },
                (href: string) => {
                    this.props.history.push(href);
                    if (shouldCallSearch === true) {
                        if (property.toLowerCase() !== "pagenumber") {
                            this.handleSearch("pagenumber", 1, true);
                            return;
                        }
                        this.callSearch("");
                    }
                });
        });
    }

    getReportTypes(value: any) {
        let result = "";
        if (value === "") { // All
            let contentTypesArr = ["ResearchReports", "LessonsLearned", Constants.DOCUMENT_TYPE.Thesis, Constants.DOCUMENT_TYPE.Paper];
            contentTypesArr.forEach(contentType => {
                result += " ContentType:" + contentType;
            });
        }
        else { // 1 selected
            result = " ContentType:" + value;
        }
        return result;
    }

    getDepartments(departmentString: any) {
        let result = "";
        let departmentArr = (!_.isUndefined(departmentString)) ? JSON.parse(departmentString) : [];
        departmentArr.forEach((department: any) => {
            result += " FeberDepartment:" + department;
        });
        return result;
    }

    changeSort(event: any, option: any) {
        if (option.key === "") {
            this.props.addRefinements([{ name: "SortList", value: [] }]);
        }
        else {
            let values = option.key.split("_");
            let sortObj = {
                Property: values[0],
                Direction: parseInt(values[1])
            }
            this.props.addRefinements([{ name: "SortList", value: [sortObj] }]);
        }
        this.setState({ selectedSort: option.key }, () => {
            this.handleSearch("sort", option.key);
        });
    }

    changeNumberOfResults(event: any, option: any) {
        this.props.addRefinements([{ name: "NumberOfResults", value: Helper.changeSearchNumberOfResultsFromCache(option.key) }]);
        this.handleSearch("pagenumber", 1);
    }

    addSubscription() {
        let value = this.state.SearchBoxRef.current.state.value.trim();
        if (value !== "") {
            this.systemListsSrv.getAllSubscriptionsByUser(this.props.userProfile?.id as number).then((results: any[]) => {
                let found: any = false;
                results.forEach((result: any) => {
                    if (result.trim() === value) {
                        found = true;
                    }
                });
                if (found === true) {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.INFO,
                        Constants.SUBSCRIPTION_MESSAGE.CREATE.EXISTED.replace("{0}", value)
                    );
                }
                else {
                    if (results.length === 3) {
                        this.props.confirmDialog(
                            Constants.CONFIRMATION_MESSAGE.SUBSCRIPTION_UPDATE.TITLE,
                            Constants.CONFIRMATION_MESSAGE.SUBSCRIPTION_UPDATE.CONTENT
                                .replace("{0}", results[0])
                                .replace("{1}", value), false, () => {
                                    this.closeSubscriptionDialog(value);
                                }
                        );
                    }
                    else {
                        this.systemListsSrv.addSubscription(this.props.userProfile?.id as number
                            , this.props.userProfile?.loginName as string, value).then((rs: any) => {
                                if (rs === true) {
                                    this.props.showToastMessage(
                                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                        Constants.SUBSCRIPTION_MESSAGE.CREATE.SUCCESS.replace("{0}", value)
                                    );
                                } else {
                                    this.props.showToastMessage(
                                        Constants.TOAST_MESSAGE_CODE.ERROR,
                                        Constants.SUBSCRIPTION_MESSAGE.CREATE.FAILED.replace("{0}", value)
                                    );
                                }
                            }).catch(() => {
                                this.props.showToastMessage(
                                    Constants.TOAST_MESSAGE_CODE.ERROR,
                                    Constants.SUBSCRIPTION_MESSAGE.CREATE.FAILED.replace("{0}", value)
                                );
                            });
                    }

                }
            });
        }
    }

    closeSubscriptionDialog(value: string) {
        this.systemListsSrv.addSubscription(this.props.userProfile?.id as number
            , this.props.userProfile?.loginName as string, value).then((rs: any) => {
                if (rs === true) {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.SUBSCRIPTION_MESSAGE.CREATE.SUCCESS.replace("{0}", value)
                    );
                } else {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.SUBSCRIPTION_MESSAGE.CREATE.FAILED.replace("{0}", value)
                    );
                }
            }).catch(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.SUBSCRIPTION_MESSAGE.CREATE.FAILED.replace("{0}", value)
                );
            });
    }

    exportMetaData() {

        let searchRefinement = this.props.refinements.keyword + this.getReportTypes(this.props.refinements.reportType)
        + ((this.props.refinements.division.length !== 0) ? (this.refineDivisionName(this.props.refinements.division)) : "")
        + ((this.props.refinements.reportDate !== "") ? (" FeberDocumentDate" + this.props.refinements.reportDate) : "")
        + ((this.props.refinements.author !== "") ? (" FeberAuthor:" + this.props.refinements.author + " OR FeberAuthorDisplayNameOWSMTXT:" + this.props.refinements.author) : "")
        + ((this.props.refinements.department !== "") ? this.getDepartments(this.props.refinements.department) : "")

        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT_SEARCH_DATA);
        let searchText = this.props.refinements.keyword;
        let permissions = this.props.userProfile?.permissions;
        // Super Admin
        // if (permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
        //     searchText += " ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper";
        // }
        // else {
        //     // RnD Division Admin
        //     if (permissions?.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
        //         searchText += " FeberDivision:" + permissions.checkRnDDivisionAdmin?.divisionTitle + " ContentType:ResearchReports";
        //     }
        //     // LL Admin
        //     else if (permissions?.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN])) {
        //         searchText += " ContentType:LessonsLearned";
        //     }
        //     // LL Division Admin
        //     else if (permissions?.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN])) {
        //         searchText += " FeberDivision:" + permissions.checkLLDivisionAdmin?.divisionTitle + " ContentType:LessonsLearned";
        //     }
        //     // Thesis Admin
        //     else if (permissions?.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
        //         searchText += " ContentType:Thesis";
        //     }
        //     // Paper Admin
        //     else if (permissions?.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN])) {
        //         searchText += " ContentType:Paper";
        //     }
        // }
        this.excelSrv.exportSearchReport(searchRefinement).then((result: any) => {
            if (result === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.SEARCH_MESSAGE.EXPORT_DATA.SUCCESS
                );
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.SEARCH_MESSAGE.EXPORT_DATA.FAILED
                );
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.SEARCH_MESSAGE.EXPORT_DATA.FAILED
            );
        }).finally(() => {
            this.props.showDialog(false);
        });

    }

    sendCIHotlineRequest() {
        window.location.href = "mailto:ITServiceDesk@bosch.com?"
            + "subject=Request for IDM Role %22" + this.props.userProfile?.permissions?.rndGroup + "%22"
            + "&body="
            + "Dear CI-Hotline, %0D%0A %0D%0A"
            + "Please help grant the FEBER idm role %22" + this.props.userProfile?.permissions?.rndGroup + "%22 to my account. %0D%0A"
            + "Reason: Access to FEBER research and development reports. %0D%0A %0D%0A"
            + "My NTID is " + this.props.userProfile?.loginName + " %0D%0A %0D%0A"
            + "Best Regards, %0D%0A"
            + this.props.userProfile.name;
    }

    refineDivisionName(divisions: any){
        let result = "";
        let toArrayDivision: any;
        if(typeof(divisions) === "string"){
            if(divisions === ""){
                return "";
            }
            else{
                toArrayDivision = divisions.split(",");
                toArrayDivision.forEach((division: any) => {
                    result += " FeberDivision:" + division;
                })
            }
        }
        else {
            
            if(divisions.length === 0){
    
            }
            else{
                if(divisions.length === 1 && divisions[0] === ""){
                    result = "";
                }
                else {
                    divisions.forEach((division: any) => {
                        result += " FeberDivision:" + division;
                    })
                }
                
            }
        }
        return result
    }


    exportCustomData(){
        //let searchRefinement = "* ContentType:LessonsLearned ContentType:Thesis ContentType:Paper";
        let reportTypes = ["Thesis","LessonsLearned", "Paper", ];
        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT_SEARCH_DATA);
        this.excelSrv.exportCustomData(reportTypes).then((result: any) => {
            if (result === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.SEARCH_MESSAGE.EXPORT_DATA.SUCCESS
                );
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.SEARCH_MESSAGE.EXPORT_DATA.FAILED
                );
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.SEARCH_MESSAGE.EXPORT_DATA.FAILED
            );
        }).finally(() => {
            this.props.showDialog(false);
        });
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    isLoading: state.search.isLoading,
    searchResultsObj: state.search.searchResultsObj,
    refinements: state.search.refinements
});

export default connect(mapStateToProps, {
    confirmDialog,
    showDialog,
    showToastMessage,
    getSearchResults,
    addRefinements,
    handleSearch
})(SearchResults);