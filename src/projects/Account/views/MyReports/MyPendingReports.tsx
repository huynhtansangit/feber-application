import * as React from 'react';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import SystemService from '../../../../services/SystemService';
import CancelReasonDialog from '../../../../core/common/CancelReasonDialog';
import Constants from '../../../../core/libraries/Constants';
import Table from '../../../../core/components/Table';
import ListActionsMenu from '../../../../core/common/ListActionsMenu';
import ChangeWorkflowIdDialog from '../../../../core/common/ChangeWorkflowIdDialog';
import { IUserProfile } from '../../../../store/permission/types';
import { showDialog, showToastMessage } from '../../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../../store/configureStore';
import { getPendingUploads } from '../../../../store/system/thunks';
import { searchText, changeMode, init } from '../../../../store/system/actions';
import Helper from '../../../../core/libraries/Helper';
import RbLabel, { LabelSize } from '../../../../bosch-react/components/label/RbLabel';

interface MyPendingReportsProps {
    userProfile: IUserProfile | undefined,
    isAdminMode: boolean,
    items: any[],
    columns: IColumn[],
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    changeMode: typeof changeMode,
    searchText: typeof searchText,
    getPendingUploads: any
}

class MyPendingReports extends React.Component<MyPendingReportsProps, any> {

    systemListsSrv: SystemService = new SystemService();

    constructor(props: MyPendingReportsProps) {
        super(props);
        this.state = {
            selectedItem: null,
            showCancelDialog: false,
            showWorkflowIdDialog: false,
        };
        this.getPendingUploads = this.getPendingUploads.bind(this);
        this.changeWorkflowID = this.changeWorkflowID.bind(this);
        this.cancelUpload = this.cancelUpload.bind(this);
    }

    componentDidMount() {
        this.props.init();
        Helper.runNewTask(() => {
            this.getPendingUploads();
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
                                <RbLabel className="header-title" size={LabelSize.Large}> Pending Approval Reports </RbLabel>
                                <ListActionsMenu
                                    columns={this.props.columns}
                                    items={detailsListProps.items}
                                    searchText={(value: any) => { this.props.searchText(value); }}
                                    showAdminResults={this.props.isAdminMode}
                                    getData={() => {
                                        this.props.changeMode();
                                        Helper.runNewTask(() => {
                                            this.getPendingUploads();
                                        });
                                    }}></ListActionsMenu>
                            </div>
                            <Table detailsListProps={detailsListProps}></Table>
                        </div>

                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>
                {/* Change Workflow ID */}
                {(this.state.showWorkflowIdDialog === true) ? <ChangeWorkflowIdDialog closeDialog={this.changeWorkflowID}></ChangeWorkflowIdDialog> : ""}
                {/* Cancel dialog */}
                {(this.state.showCancelDialog === true) ? <CancelReasonDialog closeDialog={this.cancelUpload}></CancelReasonDialog> : ""}
            </div>
        );
        return element;
    }

    getPendingUploads() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_PENDING_UPLOADS);
        let userId = (this.props.isAdminMode === true) ? null : this.props.userProfile?.id;
        this.props.getPendingUploads(userId, [
            // Cancel upload
            (item: any) => {
                this.setState({
                    selectedItem: item,
                    showCancelDialog: true
                });
            },
            // Edit Workflow Id
            (item: any) => {
                this.setState({
                    selectedItem: item,
                    showWorkflowIdDialog: true
                });
            },
            // Finish loading
            () => {
                this.props.showDialog(false);
            }
        ]);
    }

    changeWorkflowID(workflowId: string) {
        if (workflowId !== "") { // OK
            let item = this.state.selectedItem;
            this.props.showDialog(Constants.DIALOG_MESSAGE.UPDATE_WORKFLOW_ID);
            this.systemListsSrv.changeWorkflowID("upload", item.Id, workflowId).then((rs: boolean) => {
                if (rs === true) {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.CHANGE_WORKFLOW_ID.SUCCESS
                    );
                    this.getPendingUploads();
                }
                else {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.CHANGE_WORKFLOW_ID.FAILED
                    );
                }
                this.props.showDialog(false);
                this.setState({
                    selectedItem: null,
                    showWorkflowIdDialog: false
                });
            }).catch(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.CHANGE_WORKFLOW_ID.FAILED
                );
                this.props.showDialog(false);
                this.setState({
                    selectedItem: null,
                    showWorkflowIdDialog: false
                });
            });
        }
        else { // Cancel
            this.setState({
                selectedItem: null,
                showWorkflowIdDialog: false
            });
        }
    }

    cancelUpload(reason: string) {
        if (reason !== "") { // OK
            let item = this.state.selectedItem;
            this.props.showDialog(Constants.DIALOG_MESSAGE.CANCEL_UPLOADED_REPORT);
            this.systemListsSrv.cancelReport(this.props.userProfile.userToken,item.CorrelationId, item.WorkflowId, reason).then((rs: boolean) => {
                    if (rs === true) {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.CANCEL_REPORT.UPLOAD.SUCCESS
                        );
                        this.getPendingUploads();
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.CANCEL_REPORT.UPLOAD.FAILED
                        );
                    }
                    this.props.showDialog(false);
                    this.setState({
                        selectedItem: null,
                        showCancelDialog: false
                    });
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.CANCEL_REPORT.UPLOAD.FAILED
                    );
                    this.props.showDialog(false);
                    this.setState({
                        selectedItem: null,
                        showCancelDialog: false
                    });
                });
        }
        else { // Cancel
            this.setState({
                selectedItem: null,
                showCancelDialog: false
            });
        }
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
    showToastMessage,
    init,
    changeMode,
    searchText,
    getPendingUploads
})(MyPendingReports);