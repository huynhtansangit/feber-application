import * as React from "react";
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import Color from '../../../../core/libraries/Color';
import DepartmentService from '../../../../services/DepartmentService';
import MigrationService from '../../../../services/MigrationService';
import Constants from '../../../../core/libraries/Constants';
import Table from '../../../../core/components/Table';
import { showDialog, showToastMessage, confirmDialog } from "../../../../store/util/actions";
import { connect } from "react-redux";
import { RootState } from "../../../../store/configureStore";
import RbLabel from "../../../../bosch-react/components/label/RbLabel";
import RbButton, { ButtonSize } from "../../../../bosch-react/components/button/RbButton";

interface ProceedData_AllProps {
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    items: any[],
    columns: IColumn[],
    refreshData: (callback?: any) => {}
}

class ProceedData_All extends React.Component<ProceedData_AllProps, any> {

    departmentListsSrv: DepartmentService = new DepartmentService();

    migrationDataSrv: MigrationService = new MigrationService();

    constructor(props: ProceedData_AllProps) {
        super(props);

        this.state = {
            processMessage: "",
            tableRef: React.createRef()
        };
        this.getTotalNumber = this.getTotalNumber.bind(this);
        this.move = this.move.bind(this);
        this.stop = this.stop.bind(this);
        this._deleteMigrationItems = this._deleteMigrationItems.bind(this);
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            compact: false,
            items: this.props.items,
            columns: this.props.columns,
            componentRef: this.state.tableRef,
            selectionPreservedOnEmptyClick: true
        };
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <RbButton size={ButtonSize.Small} label="Move" onClick={this.move} />&nbsp;
                    <RbButton size={ButtonSize.Small} label="Stop" onClick={this.stop} />
                </div>
                <div className="ms-Grid-row common-padding-row">
                    <RbLabel style={{ color: Color.GREY }}><b>
                        <span>New: {this.getTotalNumber("New")}</span>
                        <span style={{ padding: "0px 30px" }} />
                        <span>Complete: {this.getTotalNumber("Complete")}</span>
                        <span style={{ padding: "0px 30px" }} />
                        <span>Unsuccessful: {this.getTotalNumber("Unsuccessful")}</span>
                        <span style={{ padding: "0px 30px" }} />
                        <span>Pending Attachment: {this.getTotalNumber("Pending Attachment")}</span>
                    </b></RbLabel>
                </div>
                <Table detailsListProps={detailsListProps} height={60} allowSelection={true}></Table>
            </div>
        );
        return element;
    }

    getTotalNumber(status: any) {
        return this.props.items.filter((x: any) => x.Status === status).length;
    }

    move() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            let selectedItems: any[] = [];
            let hasInvalidItem = false;
            selectedIndexes.forEach((index: number) => {
                selectedItems.push(this.props.items[index]);
                if (this.props.items[index].Status !== "New") {
                    hasInvalidItem = true;
                }
            });
            if (hasInvalidItem === false) {
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
                                Constants.MIGRATION.FAILED_AND_TRY_AGAIN
                            );
                            this.props.refreshData();
                            this.props.showDialog(false);
                        });
                    }).catch(() => {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.MIGRATION.FAILED_AND_TRY_AGAIN
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
            }
            else {
                this.props.confirmDialog(
                    Constants.CONFIRMATION_MESSAGE.INVALID_ACTION,
                    Constants.CONFIRMATION_MESSAGE.INVALID_MULTIPLE_MOVE.replace("{0}", "moved"),
                    true
                );
            }
        }
    }

    stop() {
        let selectedIndexes = this.state.tableRef.current._selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
            let selectedItems: any[] = [];
            let hasInvalidItem = false;
            selectedIndexes.forEach((index: number) => {
                selectedItems.push(this.props.items[index]);
                if (this.props.items[index].Status !== "New") {
                    hasInvalidItem = true;
                }
            });
            if (hasInvalidItem === false) {
                this.props.showDialog(Constants.DIALOG_MESSAGE.STOP);
                let promise = new Promise((resolve) => {
                    this._deleteMigrationItems(selectedItems, resolve)
                });
                promise.then(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.MIGRATION.STOPPED_SUCCESS
                    );
                    this.state.tableRef.current._selection.setAllSelected(false);
                    this.props.refreshData();
                    this.props.showDialog(false);
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.MIGRATION.STOPPED_FAILED
                    );
                    this.props.showDialog(false);
                });
            }
            else {
                this.props.confirmDialog(
                    Constants.CONFIRMATION_MESSAGE.INVALID_ACTION,
                    Constants.CONFIRMATION_MESSAGE.INVALID_MULTIPLE_MOVE.replace("{0}", "cancelled"),
                    true
                );
            }
        }
    }

    _deleteMigrationItems(items: any[], resolve: any) {
        if (items.length === 0) {
            resolve(true);
        }
        else {
            let item = items[0];
            this.migrationDataSrv.deleteItem(item.Id).then(() => {
                items.shift();
                this._deleteMigrationItems(items, resolve);
            }).catch(() => {
                resolve(false);
            });
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    columns: state.system.columns
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(ProceedData_All);