import * as React from "react";
import { IDetailsListProps, CheckboxVisibility, IColumn } from '@fluentui/react/lib/DetailsList';
import DepartmentService from '../../../../services/DepartmentService';
import Constants from '../../../../core/libraries/Constants';
import Table from '../../../../core/components/Table';
import { connect } from "react-redux";
import { showDialog, showToastMessage, confirmDialog } from "../../../../store/util/actions";
import { RootState } from "../../../../store/configureStore";
import RbLabel from "../../../../bosch-react/components/label/RbLabel";
import RbButton from "../../../../bosch-react/components/button/RbButton";

interface ProceedData_PendingAttachmentProps {
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    items: any[],
    columns: IColumn[],
    refreshData: (callback?: any) => {}
}

class ProceedData_PendingAttachment extends React.Component<ProceedData_PendingAttachmentProps, any> {

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: ProceedData_PendingAttachmentProps) {
        super(props);

        this.state = {
            tableRef: React.createRef()
        };
        this.continue = this.continue.bind(this);
        this.clean = this.clean.bind(this);
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.props.items,
            columns: this.props.columns.filter(c => c.name !== "Status"),
            componentRef: this.state.tableRef,
            checkboxVisibility: CheckboxVisibility.always,
            selectionPreservedOnEmptyClick: true
        };
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <RbButton label="Continue" onClick={this.continue} />&nbsp;
                    <RbButton label="Clean" onClick={this.clean} />
                </div>
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel><b>Total: {this.props.items.length}</b></RbLabel></div>
                </div>
                <Table detailsListProps={detailsListProps} height={60} allowSelection={true}></Table>
            </div>
        );
        return element;
    }

    continue() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            let selectedItems: any[] = [];
            selectedIndexes.forEach((index: number) => {
                let item = this.props.items[index];
                // More details
                item.MigrationId = item.Id;
                item.SourceId = item.SourceUrl.split("=")[1];
                item.UploadType = item.DocumentType;
                item.Division = item.TargetDivision;
                item.Id = item.TargetUrl.split("=")[1];
                selectedItems.push(item);
            });
            this.props.showDialog(Constants.DIALOG_MESSAGE.ADD_ATTACHMENTS);
            this.departmentListsSrv.addPendingAttachments(selectedItems).then(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.MIGRATION.ADD_ATTACHMENT_SUCCESS
                );
                this.state.tableRef.current._selection.setAllSelected(false);
                this.props.refreshData();
                this.props.showDialog(false);
            }).catch(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.MIGRATION.ADD_ATTACHMENT_FAILED
                );
                this.state.tableRef.current._selection.setAllSelected(false);
                this.props.refreshData();
                this.props.showDialog(false);
            });
        }
    }

    clean() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            let selectedItems: any[] = [];
            selectedIndexes.forEach((index: number) => {
                selectedItems.push(this.props.items[index]);
            });
            this.props.showDialog(Constants.DIALOG_MESSAGE.CLEAN);
            this.departmentListsSrv.removeMigratedReports(selectedItems, true).then(() => {
                this.departmentListsSrv.removeMigratedLists("Target", selectedItems).then(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.MIGRATION.CLEAN_SUCCESS
                    );
                    this.state.tableRef.current._selection.setAllSelected(false);
                    this.props.refreshData();
                    this.props.showDialog(false);
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.MIGRATION.CLEAN_SUCCESS
                    );
                    this.state.tableRef.current._selection.setAllSelected(false);
                    this.props.refreshData();
                    this.props.showDialog(false);
                });
            }).catch(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.MIGRATION.CLEAN_FAILED
                );
                this.props.showDialog(false);
            });
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    columns: state.system.columns
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(ProceedData_PendingAttachment);