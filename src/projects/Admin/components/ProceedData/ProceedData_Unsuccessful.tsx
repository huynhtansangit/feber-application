import * as React from "react";
import { IDetailsListProps, CheckboxVisibility, IColumn } from '@fluentui/react/lib/DetailsList';
import DepartmentService from '../../../../services/DepartmentService';
import MigrationService from '../../../../services/MigrationService';
import Constants from '../../../../core/libraries/Constants';
import Table from '../../../../core/components/Table';
import { connect } from "react-redux";
import { showDialog, showToastMessage, confirmDialog } from "../../../../store/util/actions";
import { RootState } from "../../../../store/configureStore";
import RbLabel from "../../../../bosch-react/components/label/RbLabel";
import RbButton from "../../../../bosch-react/components/button/RbButton";

interface ProceedData_UnsuccessfulProps {
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    items: any[],
    columns: IColumn[],
    refreshData: (callback?: any) => {}
}

class ProceedData_Unsuccessful extends React.Component<ProceedData_UnsuccessfulProps, any> {

    departmentListsSrv: DepartmentService = new DepartmentService();

    migrationDataSrv: MigrationService = new MigrationService();

    constructor(props: ProceedData_UnsuccessfulProps) {
        super(props);

        this.state = {
            tableRef: React.createRef()
        };
        this.restart = this.restart.bind(this);
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
                    <RbButton label="Restart" onClick={this.restart} />&nbsp;
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

    restart() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            let selectedItems: any[] = [];
            selectedIndexes.forEach((index: number) => {
                selectedItems.push(this.props.items[index]);
            });
            this.props.showDialog(Constants.DIALOG_MESSAGE.CLEAN);
            this.departmentListsSrv.removeMigratedReports(selectedItems, true).then(() => {
                this.departmentListsSrv.removeMigratedLists("Target", selectedItems).then(() => {

                    // Create lists
                    this.props.showDialog(Constants.DIALOG_MESSAGE.CREATE_LISTS);
                    // Get all document types
                    let uploadTypeGroups: any[] = [];
                    selectedItems.forEach(item => {
                        if (uploadTypeGroups.length === 0) {
                            uploadTypeGroups.push({
                                UploadType: item.DocumentType,
                                Division: item.TargetDivision,
                                DepartmentLists: [item.TargetList]
                            });
                        }
                        else {
                            let foundGroup = false;
                            uploadTypeGroups.forEach(group => {
                                if (group.UploadType === item.DocumentType) {
                                    foundGroup = true;
                                    let foundList = false;
                                    group.DepartmentLists.forEach((list: any) => {
                                        if (list === item.TargetList) {
                                            foundList = true;
                                        }
                                    });
                                    if (foundList === false) {
                                        group.DepartmentLists.push(item.TargetList);
                                    }
                                }
                            });
                            if (foundGroup === false) {
                                uploadTypeGroups.push({
                                    UploadType: item.DocumentType,
                                    Division: item.TargetDivision,
                                    DepartmentLists: [item.TargetList]
                                });
                            }
                        }
                    });
                    // Create all necessary department lists
                    this.departmentListsSrv.createDepartmentLists(uploadTypeGroups).then(() => {
                        this.props.showDialog(Constants.DIALOG_MESSAGE.MIGRATE);
                        // Change status to Unsuccessful
                        this.migrationDataSrv.updateMigrationInfo({ Status: "Unsuccessful" }, selectedItems).then(() => {
                            this.migrationDataSrv.createMigratedReports(selectedItems).then((rs: any) => {
                                if (rs === true) {
                                    this.props.showToastMessage(
                                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                                        Constants.MIGRATION.SUCCESS
                                    );
                                }
                                else {
                                    this.props.showToastMessage(
                                        Constants.TOAST_MESSAGE_CODE.ERROR,
                                        Constants.MIGRATION.FAILED
                                    );
                                }
                                this.state.tableRef.current._selection.setAllSelected(false);
                                this.props.refreshData();
                                this.props.showDialog(false);
                            }).catch(() => {
                                this.props.showToastMessage(
                                    Constants.TOAST_MESSAGE_CODE.ERROR,
                                    Constants.MIGRATION.FAILED
                                );
                                this.props.refreshData();
                                this.props.showDialog(false);
                            });
                        }).catch(() => {
                            this.props.showToastMessage(
                                Constants.TOAST_MESSAGE_CODE.ERROR,
                                Constants.MIGRATION.FAILED
                            );
                            this.props.refreshData();
                            this.props.showDialog(false);
                        });
                    }).catch(() => {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.MIGRATION.CREATE_DEPARTMENT_LISTS_FAILED
                        );
                        this.props.refreshData();
                        this.props.showDialog(false);
                    });

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

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(ProceedData_Unsuccessful);