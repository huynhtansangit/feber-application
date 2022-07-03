import * as React from 'react';
import SystemService from '../../../services/SystemService';
import Constants from '../../../core/libraries/Constants';
import Helper from '../../../core/libraries/Helper';
import Table from '../../../core/components/Table';
import { IDetailsListProps } from '@fluentui/react/lib/DetailsList';
import Template from '../../../core/libraries/Template';
import { IUserProfile } from '../../../store/permission/types';
import { showDialog } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbSearchField from '../../../bosch-react/components/search-field/RbSearchField';

interface Statistic_SearchProps {
    userProfile: IUserProfile | undefined,
    showDialog: typeof showDialog,
}

class Statistic_Search extends React.Component<Statistic_SearchProps, any> {

    searchBoxRef: React.RefObject<any> = React.createRef();

    systemListsSrv: SystemService = new SystemService();

    constructor(props: Statistic_SearchProps) {
        super(props);
        this.state = {
            results: null,
            groups: [],
            columns: [
                {
                    key: 'title',
                    name: 'Title',
                    fieldName: 'title',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.title}</RbLabel>);
                    }
                },
                {
                    key: 'eventDate',
                    name: 'Event Date',
                    fieldName: 'eventDate',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.eventDate}</RbLabel>);
                    }
                },
                {
                    key: 'division',
                    name: 'Division',
                    fieldName: 'division',
                    currentWidth: Helper.resizeColumnByScreenWidth(8),
                    minWidth: Helper.resizeColumnByScreenWidth(8),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.division}</RbLabel>);
                    }
                },
                {
                    key: 'department',
                    name: 'Department',
                    fieldName: 'department',
                    currentWidth: Helper.resizeColumnByScreenWidth(8),
                    minWidth: Helper.resizeColumnByScreenWidth(8),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.department}</RbLabel>);
                    }
                },
                {
                    key: 'uploadType',
                    name: 'Upload Type',
                    fieldName: 'uploadType',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.uploadType}</RbLabel>);
                    }
                },
                {
                    key: 'reportType',
                    name: 'Report Type',
                    fieldName: 'reportType',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.reportType}</RbLabel>);
                    }
                },
                {
                    key: 'guid',
                    name: 'Guid',
                    fieldName: 'guid',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.guid}</RbLabel>);
                    }
                },
                {
                    key: 'user',
                    name: 'User',
                    fieldName: 'user',
                    currentWidth: Helper.resizeColumnByScreenWidth(28), //14
                    minWidth: Helper.resizeColumnByScreenWidth(28), //14
                    isResizable: true, 
                    onRender: (item: any) => {
                        return Template.renderReadOnlyPeoplePickerTags(item.user);
                    }
                },
            ]
        };
        this.search = this.search.bind(this);
        this.generateRow = this.generateRow.bind(this);
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.state.results,
            columns: this.state.columns,
            groups: this.state.groups,
            groupProps: {
                showEmptyGroups: true,
            }
        };
        return (
            <div className="ms-Grid">

                {/* Searchbox */}
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm4">
                        <RbSearchField placeholder="Search..." onSearch={(event, newValue) => this.search(newValue)} />
                    </div>
                </div>
                {/* Title */}
                {(!_.isNil(this.state.results)) ?
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm12">
                            <RbLabel style={{ fontWeight: "bold" }}>Results</RbLabel>&nbsp;
                            <RbLabel style={{ fontStyle: "italic", fontSize: "small" }}>
                                {this.state.results.length} result{(this.state.results.length > 1) ? "s" : ""} found
                                                </RbLabel>
                        </div>
                    </div> : ""}


                <div className="statistic-results">
                    {/* Results */}
                    {(!_.isNil(this.state.results)) ?
                        <div className="ms-Grid-row">
                            <Table detailsListProps={detailsListProps} height={50}></Table>
                        </div> : ""}

                </div>


            </div >
        );
    }

    search(value: string) {
        let searchedValue: string = ((!!value) ? value : "").trim().toLocaleLowerCase();
        if (searchedValue !== "") {
            this.props.showDialog(Constants.DIALOG_MESSAGE.SEARCHING);
            let getFunctions: any = [
                this.systemListsSrv.getStatisticList(Constants.STATISTICS.DOWNLOAD).catch(() => { return []; }),
                this.systemListsSrv.getStatisticList(Constants.STATISTICS.UPLOAD).catch(() => { return []; }),
                this.systemListsSrv.getStatisticList(Constants.STATISTICS.ORDER).catch(() => { return []; }),
                this.systemListsSrv.getStatisticList(Constants.STATISTICS.SEARCH).catch(() => { return []; }),
                this.systemListsSrv.getStatisticList(Constants.STATISTICS.DELETE).catch(() => { return []; })
            ];
            let groups: any[] = [
                { key: 'groupredDownload', name: 'Downloaded statistics"', startIndex: 0, count: 0, level: 0 },
                { key: 'groupredUpload', name: 'Uploaded statistics"', startIndex: 0, count: 0, level: 0 },
                { key: 'groupredOrder', name: 'Ordered statistics"', startIndex: 0, count: 0, level: 0 },
                { key: 'groupredSearch', name: 'Searched statistics"', startIndex: 0, count: 0, level: 0 },
                { key: 'groupredDelete', name: 'Deleted statistics"', startIndex: 0, count: 0, level: 0 },
            ];
            Promise.all(getFunctions).then((results: any[]) => {
                let items: any[] = [];
                results.forEach((statistics: any[], index: number) => {
                    let rows = this.generateRow(index, statistics, searchedValue);
                    groups[index].count = rows.length;
                    groups[index].startIndex = items.length;
                    items.push.apply(items, rows);
                });
                this.setState({ results: items, groups: groups });
                this.props.showDialog(false);
            }).catch(() => {
                this.props.showDialog(false);
                this.setState({ results: [], groups: groups });
            });
        }
        else {
            this.setState({ results: null });
        }
    }

    generateRow(index: number, statistics: any[], searchedValue: string) {
        let results: any[] = [];
        statistics.forEach((statistic: any) => {
            switch (index) {
                case 0: // Download
                case 1: // Upload
                case 2: // Order
                case 4: { // Delete
                    let title = (Helper.setEmptyIfNull(statistic.Title) as string).toLocaleLowerCase();
                    let department1 = (Helper.setEmptyIfNull(statistic.Department) as string).toLocaleLowerCase().replace("_", "/");
                    let department2 = (Helper.setEmptyIfNull(statistic.Department) as string).toLocaleLowerCase().replace("/", "_");
                    let guid = (Helper.setEmptyIfNull(statistic.GUID1) as string).toLocaleLowerCase();
                    if ((title.indexOf(searchedValue) > -1) || (guid.indexOf(searchedValue) > -1)
                        || (department1.indexOf(searchedValue) > -1) || (department2.indexOf(searchedValue) > -1)) {
                        results.push({
                            title: statistic.Title,
                            eventDate: Helper.getDateTimeFormatForList(new Date(statistic.EventDate)),
                            division: statistic.Division,
                            department: statistic.Department,
                            uploadType: statistic.UploadType,
                            reportType: statistic.ReportType,
                            guid: statistic.GUID1,
                            user: statistic.Submitter.Title
                        });
                    }
                    break;
                }
                case 3: { // Search
                    let title = (Helper.setEmptyIfNull(statistic.Title) as string).toLocaleLowerCase();
                    let department1 = (Helper.setEmptyIfNull(statistic.Department) as string).toLocaleLowerCase().replace("_", "/");
                    let department2 = (Helper.setEmptyIfNull(statistic.Department) as string).toLocaleLowerCase().replace("/", "_");
                    if ((title.indexOf(searchedValue) > -1) || (department1.indexOf(searchedValue) > -1) || (department2.indexOf(searchedValue) > -1)) {
                        results.push({
                            title: statistic.Title,
                            eventDate: Helper.getDateTimeFormatForList(new Date(statistic.EventDate)),
                            division: statistic.Division,
                            department: statistic.Department,
                            uploadType: "",
                            reportType: "",
                            guid: "",
                            user: statistic.Author.Title
                        });
                    }
                    break;
                }
            }
        });
        return results;
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { showDialog })(Statistic_Search);