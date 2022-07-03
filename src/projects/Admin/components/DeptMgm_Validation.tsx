import * as React from 'react';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { IDetailsListProps } from '@fluentui/react/lib/DetailsList';
import SystemService from '../../../services/SystemService';
import Helper from '../../../core/libraries/Helper';
import DepartmentService from '../../../services/DepartmentService';
import { Icon } from '@fluentui/react/lib/Icon';
import Color from '../../../core/libraries/Color';
import ExcelService from '../../../services/ExcelService';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import { showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';
import { RootState } from '../../../store/configureStore';
import { IUserProfile } from '../../../store/permission/types';

interface DeptMgm_ValidationProps {
    userProfile: IUserProfile | undefined,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage
}

class DeptMgm_Validation extends React.Component<DeptMgm_ValidationProps, any> {

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    excelSrv: ExcelService = new ExcelService(Environment.rootWeb);

    constructor(props: DeptMgm_ValidationProps) {
        super(props);

        this.state = {
            selectedDivision: null,
            divisions: [],

            columns: [
                {
                    key: 'departmentName',
                    name: 'Department Name',
                    fieldName: 'DepartmentName',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.DepartmentName}</RbLabel>);
                    }
                },
                {
                    key: 'approver',
                    name: 'Approver',
                    fieldName: 'Approver',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.Approver}</RbLabel>);
                    }
                },
                {
                    key: 'rnd',
                    name: 'RnD',
                    fieldName: 'RnD',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true
                },
                {
                    key: 'll',
                    name: 'LL',
                    fieldName: 'LL',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true
                },
                {
                    key: 'thesis',
                    name: 'Thesis',
                    fieldName: 'Thesis',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true
                },
                {
                    key: 'paper',
                    name: 'Paper',
                    fieldName: 'Paper',
                    currentWidth: Helper.resizeColumnByScreenWidth(10),
                    minWidth: Helper.resizeColumnByScreenWidth(10),
                    isResizable: true
                },
                {
                    key: 'status',
                    name: 'Validation Status',
                    fieldName: 'Status',
                    currentWidth: Helper.resizeColumnByScreenWidth(20),
                    minWidth: Helper.resizeColumnByScreenWidth(20),
                    isResizable: true
                }
            ],
            items: []
        };
        this._renderItemColumn = this._renderItemColumn.bind(this);
        this.renderDivision = this.renderDivision.bind(this);
        this.loadAllDepartments = this.loadAllDepartments.bind(this);
        this.loadAllDivision = this.loadAllDivision.bind(this);
        this.exportToExcel = this.exportToExcel.bind(this);
        this.exportAllToExcel = this.exportAllToExcel.bind(this);
    }

    componentDidMount() {
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            let rs: any[] = [];
            results.forEach((division: any) => {
                rs.push({
                    key: (!_.isNil(division.DivisionCode) && division.DivisionCode !== "") ?
                        division.DivisionCode : division.Title,
                    text: division.DivisionName
                });
            });
            Helper.sortObjects(rs, "text");
            rs.unshift({ key: "All", text: "--- All ---" });
            rs.unshift({ key: null, text: "Choose a division ..." });
            this.setState({ divisions: rs});
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
                    {/* Button "Export to excel" */}
                    {(this.state.items.length > 0 && this.state.selectedDivision !== "All") ?
                        <div className="ms-Grid-col ms-sm7" style={{ paddingTop: "5px" }}>
                            <RbButton label="Export to Excel" size={ButtonSize.Small} onClick={this.exportToExcel} />
                        </div> : ""}
                    {(this.state.items.length > 0 && this.state.selectedDivision === "All") ?
                    <div className="ms-Grid-col ms-sm7" style={{ paddingTop: "5px" }}>
                        <RbButton label="Export All to Excel" size={ButtonSize.Small} onClick={this.exportAllToExcel}/>
                    </div> : ""}
                </div>

                {/* Validation list of departments */}
                {(!_.isNil(this.state.selectedDivision) && this.state.selectedDivision !== "All") ? <Table detailsListProps={detailsListProps} height={50}></Table> : ""}

            </div>
        );
        return element;
    }

    _renderItemColumn(item: any, index: number | undefined, column: any) {
        let content: any = "";
        switch (column.key) {
            case Constants.DOCUMENT_TYPE.RnD.toLowerCase():
            case Constants.DOCUMENT_TYPE.LL.toLowerCase():
            case Constants.DOCUMENT_TYPE.Thesis.toLowerCase():
            case Constants.DOCUMENT_TYPE.Paper.toLowerCase(): {
                content = <Checkbox defaultChecked={item[column.fieldName]} disabled={true} />;
                break;
            }
            case "approver": {
                content = <span style={(item[column.fieldName] === "None") ? { fontStyle: "italic" } : {}}>
                    {item[column.fieldName]}
                </span>;
                break;
            }
            case "status": {
                content = (item[column.fieldName] === "Valid") ?
                    <Icon iconName="Accept" style={{ color: Color.GREEN, fontWeight: "bold" }} />
                    : <Icon iconName="Clear" style={{ color: Color.RED, fontWeight: "bold" }} />;
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
                    if(option.key === "All"){
                        this.setState({ selectedDivision: option.key }, () => {
                            if (!_.isNil(this.state.selectedDivision)) {
                                this.loadAllDivision();
                            }
                        });
                    } 
                    else
                    {
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
        this.departmentListsSrv.getDepartmentValidation(this.props.userProfile.userToken, this.state.selectedDivision).then((rs: any) => {
            if (rs.status === "Success") {
                this.setState({ items: rs.results });
            }
            else {
                this.setState({ items: [] });
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    rs.error
                );
            }
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

    async loadAllDivision() {
        let index = 0
        let items: any = [];
        this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_ALL_DEPARTMENTS);
        for (const element of this.state.divisions) {
            await this.departmentListsSrv.getDepartmentValidation(this.props.userProfile.userToken, element.key).then((rs: any) => {
                if (rs.status === "Success") {
                    items.push(rs.results)
                }
            }).catch(() => {
                items.push([])
            });
            index++;
            if(index === this.state.divisions.length){
                this.props.showDialog(false);
            }
        }
        this.setState({ items: items });
    }

    exportToExcel() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT_RESULT);
        this.excelSrv.exportDepartmentValidationResults(this.state.selectedDivision, this.state.items).then((rs: any) => {
            if (rs === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.SUCCESS
                );
                this.props.showDialog(false);
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.FAILED
                );
                this.props.showDialog(false);
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.FAILED
            );
            this.props.showDialog(false);
        });
    }

    exportAllToExcel() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT_RESULT);
        this.excelSrv.exportAllDepartmentsValidationResults(this.state.divisions, this.state.items).then((rs: any) => {
            if (rs === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.SUCCESS
                );
                this.props.showDialog(false);
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.FAILED
                );
                this.props.showDialog(false);
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.EXPORT_DEPARTMENTS_VALIDATION_MESSAGE.FAILED
            );
            this.props.showDialog(false);
        });
    }
}
const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});
export default connect(mapStateToProps, { showDialog, showToastMessage })(DeptMgm_Validation);