/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import * as querystring from 'querystring';
import { IconButton } from '@fluentui/react/lib/Button';
import Search_Result from '../../../Search/components/Search_Item/Search_Result';
import Search_Refinement_ReportDate from '../../../Search/components/Search_Refinement/Search_Refinement_ReportDate';
import Search_Refinement_ApprovedDate from '../../../Search/components/Search_Refinement/Search_Refinement_ApprovedDate';
import Search_Refinement_Author from '../../../Search/components/Search_Refinement/Search_Refinement_Author';
import SomethingWentWrong from '../../../../core/components/SomethingWentWrong';
import Search_ResultShimmer from '../../../Search/components/Search_Item/Search_ResultShimmer';
import Helper from '../../../../core/libraries/Helper';
import { IUserProfile } from '../../../../store/permission/types';
import { connect } from 'react-redux';
import { RootState } from '../../../../store/configureStore';
import { ISearchResultsObj, IRefinements } from '../../../../store/search/types';
import { addRefinements, handleSearch } from '../../../../store/search/actions';
import { getSearchResults } from '../../../../store/search/thunks';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../../bosch-react/components/label/RbLabel';
import RbSearchField from '../../../../bosch-react/components/search-field/RbSearchField';

interface MyApprovedOrdersProps {
    // User Profile
    userProfile: IUserProfile | undefined,
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

class MyApprovedOrders extends React.Component<MyApprovedOrdersProps, any> {

    constructor(props: MyApprovedOrdersProps) {
        super(props);
        this.state = {
            SearchBoxRef: React.createRef(),
            ReportDateRef: React.createRef(),
            ApprovedDateRef: React.createRef(),
            AuthorRef: React.createRef()
        };
        this.callSearch = this.callSearch.bind(this);
        this.searchNewText = this.searchNewText.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    componentDidMount() {
        let parameters: any = querystring.parse(this.props.location.search);
        // Keyword
        let keyword = (!_.isUndefined(parameters["?keyword"])) ? Helper.decodeCustomized(decodeURIComponent(parameters["?keyword"])) : "*";
        this.state.SearchBoxRef.current.setValue(keyword);
        // Report date
        let reportdate = (!_.isUndefined(parameters["reportdate"])) ? decodeURI(parameters["reportdate"]) : "";
        this.state.ReportDateRef.current.setDefaultValues(reportdate);
        // Approved date
        let approveddate = (!_.isUndefined(parameters["approveddate"])) ? decodeURI(parameters["approveddate"]) : "";
        this.state.ApprovedDateRef.current.setDefaultValues(approveddate);
        // Author
        let author = (!_.isUndefined(parameters["author"])) ? decodeURI(parameters["author"]) : "";
        this.state.AuthorRef.current.setDefaultValues(author);
        // Paging
        let pagenumber: number = (!_.isUndefined(parameters["pagenumber"]) && parameters["pagenumber"] !== "") ? parseInt(decodeURIComponent(parameters["pagenumber"])) : 1;
        // UPDATE STATE AND SEARCH
        this.props.addRefinements([
            { name: "keyword", value: keyword },
            { name: "reportdate", value: reportdate },
            { name: "approveddate", value: approveddate },
            { name: "author", value: author },
            { name: "numberOfResults", value: Helper.changeSearchNumberOfResultsFromCache() },
            { name: "pageNumber", value: pagenumber }
        ]);
        Helper.runNewTask(() => {
            this.callSearch("");
        });
    }

    render() {
        let element = (
            <div>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">

                        {/* Refinement Area */}
                        <div className="ms-Grid-col ms-sm2" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                            <Search_Refinement_ReportDate ref={this.state.ReportDateRef} handleSearch={this.handleSearch} />
                            <Search_Refinement_ApprovedDate ref={this.state.ApprovedDateRef} handleSearch={this.handleSearch} />
                            <Search_Refinement_Author ref={this.state.AuthorRef} handleSearch={this.handleSearch} />
                        </div>

                        {/* Search Results */}
                        <div className="ms-Grid-col ms-sm10">

                            {/* Search Boxes and Buttons */}
                            <div className="ms-Grid">
                                <div className="ms-Grid-row" style={{ marginTop: "-10px" }}>
                                    <div className="ms-Grid-col ms-sm12" style={{ paddingLeft: "0px" }}>
                                        <RbLabel className="header-title" size={LabelSize.Large}> My Approved Orders </RbLabel>
                                    </div>
                                    <div className="ms-Grid-col ms-sm6" style={{ paddingLeft: "0px" }}>
                                        <RbSearchField value={this.props.refinements.keyword} ref={this.state.SearchBoxRef}
                                            placeholder="Search..." onSearch={(event, newValue) => this.searchNewText(newValue)} />
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            {(this.props.isLoading == null) ?
                                <SomethingWentWrong />
                                :
                                ((this.props.isLoading === true) ?
                                    <div className="ms-Grid">
                                        <div className="ms-Grid-row">
                                            <div className="ms-Grid-col ms-sm8" style={{ paddingRight: "5vw" }}>
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                                <Search_ResultShimmer />
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        {/* Results */}
                                        {(Helper.setEmptyArrayIfNull(this.props.searchResultsObj?.results).length > 0) ?
                                            this.props.searchResultsObj?.results.map((searchResult: any, index: any) =>
                                                <Search_Result data={searchResult} key={index} />
                                            ) : ""}

                                        {/* Paging */}
                                        {(Helper.setEmptyArrayIfNull(this.props.searchResultsObj?.results).length > 0) ?
                                            (<div className="ms-Grid" style={{ marginTop: "10px", marginBottom: "10px" }}>
                                                <div className="ms-Grid-row ms-textAlignCenter">
                                                    <div className="ms-Grid-col ms-sm9">
                                                        <IconButton iconProps={{ iconName: "CaretLeftSolid8" }} title="Previous" disabled={this.props.searchResultsObj?.pageNumber === 1} onClick={() => { this.callSearch("prev") }} />
                                                        <RbLabel style={{ marginLeft: "10px", marginRight: "10px", minWidth: "5vw", display: "inline-block" }}>
                                                            {(this.props.searchResultsObj?.count !== "") ?
                                                                this.props.searchResultsObj?.count : ""}
                                                        </RbLabel>
                                                        <IconButton iconProps={{ iconName: "CaretRightSolid8" }} title="Next" disabled={
                                                            Helper.setZeroIfNull(this.props.searchResultsObj?.pageNumber) + 1
                                                            > Math.ceil(Helper.setZeroIfNull(this.props.searchResultsObj?.total) / 10)
                                                        }
                                                            onClick={() => { this.callSearch("next") }} />
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
            </div>
        );
        return element;
    }

    callSearch(status = "", isReloaded = false) {
        this.setState({
            isLoading: true
        });
        // Scroll to top of page
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        // Search 
        this.props.getSearchResults(
            this.props.refinements.keyword + " ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper OrderUsersOWSUser:" + this.props.userProfile?.name
            + ((this.props.refinements.reportDate !== "") ? (" FeberDocumentDate" + this.props.refinements.reportDate) : "")
            + ((this.props.refinements.approvedDate !== "") ? (" FeberApproveDate" + this.props.refinements.approvedDate) : "")
            + ((this.props.refinements.author !== "") ? (" FeberAuthor:" + this.props.refinements.author + " OR FeberAuthorDisplayNameOWSMTXT:" + this.props.refinements.author) : ""),
            status,
            Helper.changeSearchNumberOfResultsFromCache(),
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
        let href = "/MyApprovedOrders" + window.location.href.split("/MyApprovedOrders")[1];
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

    handleSearch(property: string, value: any, shouldCallSearch = true) {
        Helper.runNewTask(() => {
            this.props.handleSearch(property, value, "/MyApprovedOrders",
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

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    isLoading: state.search.isLoading,
    searchResultsObj: state.search.searchResultsObj,
    refinements: state.search.refinements
});

export default connect(mapStateToProps, {
    getSearchResults,
    addRefinements,
    handleSearch
})(MyApprovedOrders);