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

interface ProceedData_CompleteProps {
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    items: any[],
    columns: IColumn[],
    refreshData: (callback?: any) => {}
}

class ProceedData_Complete extends React.Component<ProceedData_CompleteProps, any> {

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: ProceedData_CompleteProps) {
        super(props);

        this.state = {
            tableRef: React.createRef()
        };
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
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
                    <RbButton label="Accept" onClick={this.accept} />&nbsp;
                    <RbButton label="Reject" onClick={this.reject} />
                </div>
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel><b>Total: {this.props.items.length}</b></RbLabel></div>
                </div>
                <Table detailsListProps={detailsListProps} height={60} allowSelection={true}></Table>
            </div>
        );
        return element;
    }

    accept() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            this.props.confirmDialog(
                Constants.CONFIRMATION_MESSAGE.CAUTION,
                Constants.CONFIRMATION_MESSAGE.ACCEPT_REPORT,
                false,
                () => {
                    let selectedItems: any[] = [];
                    selectedIndexes.forEach((index: number) => {
                        selectedItems.push(this.props.items[index]);
                    });
                    this.props.showDialog(Constants.DIALOG_MESSAGE.ACCEPT_REPORTS);
                    this.departmentListsSrv.removeOldReports(selectedItems).then(() => {
                        this.departmentListsSrv.removeMigratedLists("Source", selectedItems).then(() => {
                            this.props.showToastMessage(
                                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                Constants.MIGRATION.ACCEPT_SUCCESS
                            );
                            this.state.tableRef.current._selection.setAllSelected(false);
                            this.props.refreshData();
                            this.props.showDialog(false);
                        }).catch(() => {
                            this.props.showToastMessage(
                                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                Constants.MIGRATION.ACCEPT_SUCCESS
                            );
                            this.state.tableRef.current._selection.setAllSelected(false);
                            this.props.refreshData();
                            this.props.showDialog(false);
                        });
                    }).catch(() => {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.MIGRATION.ACCEPT_FAILED
                        );
                        this.props.showDialog(false);
                    });
                }
            );
        }
    }

    reject() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            this.props.confirmDialog(
                Constants.CONFIRMATION_MESSAGE.CAUTION,
                Constants.CONFIRMATION_MESSAGE.REJECT_REPORT,
                false,
                () => {
                    let selectedItems: any[] = [];
                    selectedIndexes.forEach((index: number) => {
                        selectedItems.push(this.props.items[index]);
                    });
                    this.props.showDialog(Constants.DIALOG_MESSAGE.REJECT_REPORTS);
                    this.departmentListsSrv.removeMigratedReports(selectedItems).then(() => {
                        this.departmentListsSrv.removeMigratedLists("Target", selectedItems).then(() => {
                            this.props.showToastMessage(
                                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                Constants.MIGRATION.REJECT_SUCCESS
                            );
                            this.state.tableRef.current._selection.setAllSelected(false);
                            this.props.refreshData();
                            this.props.showDialog(false);
                        }).catch(() => {
                            this.props.showToastMessage(
                                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                Constants.MIGRATION.REJECT_SUCCESS
                            );
                            this.state.tableRef.current._selection.setAllSelected(false);
                            this.props.refreshData();
                            this.props.showDialog(false);
                        });
                    }).catch(() => {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.MIGRATION.REJECT_FAILED
                        );
                        this.props.showDialog(false);
                    });
                }
            );
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    columns: state.system.columns
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(ProceedData_Complete);