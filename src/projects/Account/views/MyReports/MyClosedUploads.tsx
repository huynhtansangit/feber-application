import * as React from 'react';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import SystemService from '../../../../services/SystemService';
import Table from '../../../../core/components/Table';
import Constants from '../../../../core/libraries/Constants';
import ListActionsMenu from '../../../../core/common/ListActionsMenu';
import { IUserProfile } from '../../../../store/permission/types';
import { showDialog } from '../../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../../store/configureStore';
import { getClosedUploads } from '../../../../store/system/thunks';
import { searchText, changeMode, init } from '../../../../store/system/actions';
import Helper from '../../../../core/libraries/Helper';
import RbLabel, { LabelSize } from '../../../../bosch-react/components/label/RbLabel';

interface MyClosedUploadsProps {
    userProfile: IUserProfile | undefined,
    isAdminMode: boolean,
    items: any[],
    columns: IColumn[],
    showDialog: typeof showDialog,
    init: typeof init,
    changeMode: typeof changeMode,
    searchText: typeof searchText,
    getClosedUploads: any
}

class MyClosedUploads extends React.Component<MyClosedUploadsProps, any> {

    systemListsSrv: SystemService = new SystemService();

    constructor(props: MyClosedUploadsProps) {
        super(props);
        this.getClosedUploads = this.getClosedUploads.bind(this);
    }

    componentDidMount() {
        this.props.init();
        Helper.runNewTask(() => {
            this.getClosedUploads();
        });
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.props.items,
            columns: this.props.columns,
            onShouldVirtualize: () => { return true; }
        };
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm1" />
                    <div className="ms-Grid-col ms-sm10">

                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <RbLabel className="header-title" size={LabelSize.Large}>My Cancelled/Rejected Uploads</RbLabel>
                                <ListActionsMenu
                                    columns={detailsListProps.columns}
                                    items={detailsListProps.items}
                                    searchText={(value: any) => { this.props.searchText(value); }}
                                    showAdminResults={this.props.isAdminMode}
                                    getData={() => {
                                        this.props.changeMode();
                                        Helper.runNewTask(() => {
                                            this.getClosedUploads();
                                        });
                                    }}></ListActionsMenu>
                            </div>
                            <Table detailsListProps={detailsListProps}></Table>
                        </div>

                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>
            </div>
        );
        return element;
    }

    getClosedUploads() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_CLOSED_UPLOADS);
        let userId = (this.props.isAdminMode === true) ? null : this.props.userProfile?.id;
        this.props.getClosedUploads(userId, [() => {
            this.props.showDialog(false);
        }]);
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    isAdminMode: state.system.isAdminMode,
    items: state.system.filteredData,
    columns: state.system.columns
});

export default connect(mapStateToProps, {
    showDialog,
    init,
    changeMode,
    searchText,
    getClosedUploads
})(MyClosedUploads);