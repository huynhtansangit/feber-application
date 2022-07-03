import * as React from 'react';
import Constants from '../../../../core/libraries/Constants';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { connect } from 'react-redux';
import { RootState } from '../../../../store/configureStore';
import { IUserProfile } from '../../../../store/permission/types';
import Helper from '../../../../core/libraries/Helper';
import _ from 'lodash';
import RbLabel from '../../../../bosch-react/components/label/RbLabel';

interface Search_Refinement_ReportTypeProps {
    userProfile: IUserProfile | undefined,
    inputReportType: any,
    handleSearch: any
}

class Search_Refinement_ReportType extends React.Component<Search_Refinement_ReportTypeProps, any> {

    constructor(props: Search_Refinement_ReportTypeProps) {
        super(props);
        this.state = {
            reportTypes: Constants.DD_DOCUMENT_TYPES_FOR_SEARCH,
            selectedReportType: ""
        };
        this.handleSearch = this.handleSearch.bind(this);
    }

    componentDidMount() {
        Helper.runNewTask(() => {
            let reportTypes = this.state.reportTypes;
            let selectedReportType = (this.props.inputReportType !== "") ? this.props.inputReportType : "";
            if ((_.isNil(this.props.userProfile?.permissions)) ?
                true : (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.RND_USER, Constants.PERMISSIONS.SUPER_ADMIN]))) {
                reportTypes.splice(1, 1);
            }
            this.setState({
                reportTypes: reportTypes,
                selectedReportType: selectedReportType
            });
        });
    }

    render() {
        let element = (
            <div className="ms-Grid" style={{ marginBottom: "1.5rem" }}>
                <div className="ms-Grid-row">
                    <RbLabel>Report type</RbLabel>
                    <Dropdown
                        selectedKey={this.state.selectedReportType}
                        options={this.state.reportTypes}
                        onChange={this.handleSearch}
                    />
                </div>
            </div>
        );
        return element;
    }

    handleSearch(event: any, option: any) {
        this.props.handleSearch("reporttype", option.key);
        if (option.key === "") {
            this.setState({ selectedReportType: "" });
        }
        else {
            this.setState({ selectedReportType: option.key });
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps)(Search_Refinement_ReportType);