import * as React from 'react';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { IDetailsListProps } from '@fluentui/react/lib/DetailsList';
import SystemService from '../../../services/SystemService';
import Helper from '../../../core/libraries/Helper';
import DepartmentService from '../../../services/DepartmentService';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';

interface DeptMgm_AIMReportProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage
}

class DeptMgm_AIMReport extends React.Component<DeptMgm_AIMReportProps, any> {

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: DeptMgm_AIMReportProps) {
        super(props);

        this.state = {
            selectedDivision: null,
            divisions: [],

            columns: [
                {
                    key: 'check', iconName: 'Checkbox', fieldName: 'Checked', iconClassName: "customized-header-checkbox",
                    currentWidth: 20,
                    minWidth: 20,
                    isResizable: true,
                    onColumnClick: (event: any, column: any) => {
                        let columns = this.state.columns;
                        let departments = this.state.items;
                        departments.forEach((department: any) => {
                            if (!_.isNil(department.Checked)) {
                                department.Checked = column.iconName === "Checkbox";
                            }
                        });
                        columns[0].iconName = (column.iconName === "Checkbox") ? 'CheckboxCompositeReversed' : 'Checkbox';
                        this.setState({ columns: columns, items: [] }, () => {
                            this.setState({ items: departments }, () => {
                                this._getCheckedItems();
                            });
                        });
                    }
                },
                {
                    key: 'divisionName', name: 'Division', fieldName: 'DivisionName',
                    currentWidth: Helper.resizeColumnByScreenWidth(15),
                    minWidth: Helper.resizeColumnByScreenWidth(15),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.DivisionName}</RbLabel>);
                    }
                },
                {
                    key: 'departmentName', name: 'Department Name', fieldName: 'DepartmentName',
                    currentWidth: Helper.resizeColumnByScreenWidth(23),
                    minWidth: Helper.resizeColumnByScreenWidth(23),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.DepartmentName}</RbLabel>);
                    }
                },
                {
                    key: 'hod', name: 'Head of Department', fieldName: 'HoD',
                    currentWidth: Helper.resizeColumnByScreenWidth(40),
                    minWidth: Helper.resizeColumnByScreenWidth(40),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.HoD}</RbLabel>);
                    }
                },
                {
                    key: 'lastSent', name: 'Last Sent', fieldName: 'LastSent',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.LastSent}</RbLabel>);
                    }
                }
            ],
            checkedItems: [],
            items: []
        };
        this._renderItemColumn = this._renderItemColumn.bind(this);
        this.renderDivision = this.renderDivision.bind(this);
        this.loadAllDepartments = this.loadAllDepartments.bind(this);
        this.sendAIMEmails = this.sendAIMEmails.bind(this);
        this._getCheckedItems = this._getCheckedItems.bind(this);
    }

    componentDidMount() {
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            let rs: any[] = [];
            results.forEach(division => {
                rs.push({
                    key: (!_.isNil(division.DivisionCode) && division.DivisionCode !== "") ?
                        division.DivisionCode : division.Title,
                    text: division.DivisionName
                });
            });
            Helper.sortObjects(rs, "text");
            rs.unshift({ key: "all", text: "--- All ---" });
            rs.unshift({ key: null, text: "Choose a division ..." });
            this.setState({ divisions: rs });
        });
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.state.items,
            columns: this.state.columns,
            onRenderItemColumn: this._renderItemColumn
        };
        let element = (
            <div className="ms-Grid">

                <div className="ms-Grid-row common-padding-row">
                    {this.renderDivision()}
                    {/* Button "Send" */}
                    {(this.state.items.length > 0) ?
                        <div className="ms-Grid-col ms-sm7" style={{ paddingTop: "5px" }}>
                            <RbButton label="Send" size={ButtonSize.Small} onClick={this.sendAIMEmails} disabled={this.state.checkedItems.length === 0} />
                        </div> : ""}
                </div>

                {/* Validation list of departments */}
                {(!_.isNil(this.state.selectedDivision)) ? <Table detailsListProps={detailsListProps} height={50}></Table> : ""}

            </div>
        );
        return element;
    }

    _renderItemColumn(item: any, index: number | undefined, column: any) {
        let content: any = "";
        switch (column.key) {
            case "check": {
                content = (!_.isNil(item.Checked)) ? <Checkbox checked={item[column.fieldName]} onChange={(event, checked) => {
                    let isCheckedAll = true;
                    let departments = this.state.items;
                    departments.forEach((department: any) => {
                        if (department.DepartmentName === item.DepartmentName && department.DivisionName === item.DivisionName) {
                            department.Checked = checked;
                        }
                        if (department.Checked === false) {
                            isCheckedAll = false;
                        }
                    });
                    let columns = this.state.columns;
                    columns[0].iconName = (isCheckedAll === true) ? 'CheckboxCompositeReversed' : 'Checkbox';
                    this.setState({ columns: columns, items: [] }, () => {
                        this.setState({ items: departments }, () => {
                            this._getCheckedItems();
                        });
                    });
                }} /> : "";
                break;
            }
            case "hod": {
                content = <span style={(item[column.fieldName] === "None") ? { fontStyle: "italic" } : {}}>
                    {item[column.fieldName]}
                </span>;
                break;
            }
            default: {
                content = <span>{item[column.fieldName]}</span>;
                break;
            }
        }
        return content;
    }

    renderDivision() {
        return this.renderRetrieveTemplate("Division",
            <Dropdown
                selectedKey={this.state.selectedDivision}
                placeholder="Choose a division ..."
                options={this.state.divisions}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.setState({ selectedDivision: option.key }, () => {
                            if (!_.isNil(this.state.selectedDivision)) {
                                this.loadAllDepartments();
                            }
                            else {
                                this.setState({ items: [] });
                            }
                        });
                    }
                }}
            />);
    }

    renderRetrieveTemplate(label: string, field: any) {
        return (
            <div className="ms-Grid-col ms-sm5">
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm4"><RbLabel hasPadding={true}>{label}</RbLabel></div>
                        <div className="ms-Grid-col ms-sm8">
                            {field}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    loadAllDepartments() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_DEPARTMENTS);
        let getFunctions = [];
        if (this.state.selectedDivision === "all") { // Select all divisions
            this.state.divisions.forEach((division: any) => {
                getFunctions.push(this.departmentListsSrv.getAIMDepartmentValidation(this.props.userProfile.userToken, division.key));
            });
        }
        else { // Select single division
            getFunctions.push(this.departmentListsSrv.getAIMDepartmentValidation(this.props.userProfile.userToken, this.state.selectedDivision));
        }
        Promise.all(getFunctions).then((results) => {
            let items: any[] = [];
            results.forEach((rs: any) => {
                if (rs.status === "Success") {
                    rs.results.forEach((department: any) => {
                        department.Checked = (department.HoD !== "None") ? false : null;
                    });
                    items.push(...rs.results);
                }
            });
            // Reset all the selected column before bind items
            let columns = this.state.columns;
            columns[0].iconName = 'Checkbox';
            this.setState({ columns: columns, items: [] }, () => {
                this.setState({ items: items, checkedItems: [] });
            });
            this.props.showDialog(false);
        }).catch(() => {
            this.setState({ items: [] });
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.GENERAL_ERROR_MESSAGE.RETRIEVE_DEPARTMENTS
            );
            this.props.showDialog(false);
        });
    }

    sendAIMEmails() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.SEND_AIM_EMAILS);
        let now = new Date();
        let transactionId = now.getFullYear().toString() + now.getMonth().toString() + now.getDate().toString()
            + now.getHours().toString() + now.getMinutes().toString() + now.getMinutes().toString() + now.getMilliseconds().toString();
        let addFunctions: any[] = [];
        this.state.checkedItems.forEach((item: any) => {
            addFunctions.push(this.systemListsSrv.addAIMHistoryItem({
                Title: transactionId,
                Division: item.DivisionName,
                Department: item.DepartmentName,
                HoDId: (Environment.currentEnvironment === "P") ? item.HoDId : this.props.userProfile?.id,
                EventDate: now
            }));
        });
        Promise.all(addFunctions).then(() => {
            this.systemListsSrv.sendAIMEmails(this.props.userProfile.userToken ,transactionId).then(() => {
                let columns = this.state.columns;
                columns[0].iconName = 'Checkbox';
                this.setState({ columns: columns, isCheckedAll: false, items: [] }, () => {
                    this.loadAllDepartments();
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.SEND_AIM_REPORT_MESSAGE.SUCCESS
                    );
                });
            }).catch(() => {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.SEND_AIM_REPORT_MESSAGE.FAILED
                );
                this.props.showDialog(false);
            });
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.SEND_AIM_REPORT_MESSAGE.FAILED
            );
            this.props.showDialog(false);
        });
    }

    _getCheckedItems() {
        let checkedItems: any[] = [];
        this.state.items.forEach((department: any) => {
            if (department.Checked === true) {
                checkedItems.push(department);
            }
        });
        this.setState({ checkedItems: checkedItems });
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(DeptMgm_AIMReport);