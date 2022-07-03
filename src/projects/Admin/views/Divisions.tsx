import * as React from 'react';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import NewDivision from '../components/NewDivision';
import Helper from '../../../core/libraries/Helper';
import DivisionsService from '../../../services/DivisionsService';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import ExcelService from '../../../services/ExcelService';
import AdminWrapper from './AdminWrapper';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { init } from '../../../store/system/actions';
import { getDivisions, getGroups } from '../../../store/system/thunks';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize, ButtonType } from '../../../bosch-react/components/button/RbButton';
import PermissionsService from '../../../services/PermissionsService';
import SystemService from '../../../services/SystemService';

interface DivisionsProps {
    userProfile: IUserProfile | undefined,
    items: any[],
    columns: IColumn[],
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    getDivisions: any
}

class Divisions extends React.Component<DivisionsProps, any> {

    divisionsSrv: DivisionsService = new DivisionsService();
    permissionSrv: PermissionsService = new PermissionsService();
    systemSrv: SystemService = new SystemService();
    constructor(props: DivisionsProps) {
        super(props);

        this.state = {
            isShownNewDivision: false,
            groups: [],
        };
        this.loadList = this.loadList.bind(this);
        this._renderItemColumn = this._renderItemColumn.bind(this);
        this._confirmDeletion = this._confirmDeletion.bind(this);
        this._exportMetadata = this._exportMetadata.bind(this);
        this.exportDivisionsAdministrators = this.exportDivisionsAdministrators.bind(this);
    }

    componentDidMount() {
        if (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            /* Access Dialog */
            this.props.confirmDialog(
                Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.CONTENT,
                true,
                () => {
                    window.location.href = Environment.rootWeb;
                }
            );
        }
        else {
            this.props.init();
            Helper.runNewTask(() => {
                this.loadList();
            }); 
        }
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.props.items,
            columns: this.props.columns,
            onRenderItemColumn: this._renderItemColumn
        };
        let element: any = "";
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            element = (
                <AdminWrapper>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm1" />
                            <div className="ms-Grid-col ms-sm10">

                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <RbLabel className="header-title" size={LabelSize.Large} >Divisions</RbLabel>
                                    </div>
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid">

                                            {/* Button "New division" */}
                                            <div className="ms-Grid-row common-padding-row">
                                                <RbButton label="New division" size={ButtonSize.Small} onClick={() => { this.setState({ isShownNewDivision: true }); }} />
                                                <RbButton label="Export all division administrators" size={ButtonSize.Small} onClick={this.exportDivisionsAdministrators} />
                                            </div>

                                            {/* List of Divisions */}
                                            <Table detailsListProps={detailsListProps} height={60}></Table>

                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                        {/* Add New Division */}
                        {(this.state.isShownNewDivision === true) ?
                            <NewDivision divisions={this.props.items} closeDialog={() => { this.setState({ isShownNewDivision: false }); }} refreshList={this.loadList} />
                            : ""}
                    </div>
                </AdminWrapper>
            );
        }
        return element;
    }

    _renderItemColumn(item: any, index: number | undefined, column: any) {
        let content: any = "";
        switch (column.key) {
            case "action": {
                content =
                    <span>
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Remove" onClick={() => { this._confirmDeletion(item); }} />
                        &nbsp;
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Export" onClick={() => { this._exportMetadata((item.Code !== "" && !_.isNil(item.Code)) ? item.Code : item.ShortName); }} />
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

    loadList() {
        this.props.getDivisions([]);
    }

    _confirmDeletion(division: any) {
        let obj = {
            Id: division.Id,
            Title: division.ShortName,
            DivisionName: division.LongName,
            DivisionCode: division.Code
        };
        /* Access Dialog */
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.CAUTION,
            Constants.CONFIRMATION_MESSAGE.REMOVE_DIVISION.replace("{0}", obj.DivisionName),
            false,
            () => {
                this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_DIVISION);
                this.divisionsSrv.removeDivision(obj).then((result: any) => {
                    if (result.status === "Success") {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.DIVISION_MESSAGE.REMOVE.SUCCESS.replace("{0}", obj.DivisionName)
                        );
                        this.loadList();
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            result.error
                        );
                    }
                    this.props.showDialog(false);
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.DIVISION_MESSAGE.REMOVE.FAILED.replace("{0}", obj.DivisionName)
                    );
                    this.props.showDialog(false);
                });
            }
        );
    }

    _exportMetadata(divisionCode: string) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT);
        let excelSrv = new ExcelService(Environment.rootWeb);
        excelSrv.exportMetadata(divisionCode).then(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                Constants.DIVISION_MESSAGE.EXPORT.SUCCESS
            );
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.DIVISION_MESSAGE.EXPORT.FAILED
            );
            this.props.showDialog(false);
        });
    }

    async exportDivisionsAdministrators(){
        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT);
        let groupsAdmins: any[] = [];
        await this.permissionSrv.getFEBERGroupsList().then((groups) => {
            this.setState({groups: groups})
        })
        let listDivisions: any[] = [];
        let divisions = await this.systemSrv.getDivisionsList();
        divisions.forEach(division => {
            listDivisions.push(division.Title)
        })
        for(let i = 0; i < this.state.groups.length; i++){
            await this.permissionSrv.getMembersByGroupId(this.state.groups[i].Id).then((members: any) => {
                if(members.length > 0){
                    groupsAdmins.push({
                        groupName: this.state.groups[i].Title,
                        members: members
                    })
                }
                else{
                    groupsAdmins.push({
                        groupName: this.state.groups[i].Title,
                        members: []
                    })
                }

            })
        }
        let excelSrv = new ExcelService(Environment.rootWeb);
        excelSrv.exportDivisionsAdmins(groupsAdmins, listDivisions).then(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                Constants.DIVISION_MESSAGE.EXPORT.SUCCESS
            );
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.DIVISION_MESSAGE.EXPORT.FAILED
            );
            this.props.showDialog(false);
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    items: state.system.filteredData,
    columns: state.system.columns
});

export default connect(mapStateToProps, {
    confirmDialog,
    showDialog,
    showToastMessage,
    init,
    getDivisions,
})(Divisions);