import * as React from 'react';
import Helper from '../../../core/libraries/Helper';
import Constants from '../../../core/libraries/Constants';
import Environment from '../../../Environment';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import AdminWrapper from './AdminWrapper';
import Table from '../../../core/components/Table';
import GroupForm from '../components/GroupForm';
import PermissionsService from '../../../services/PermissionsService';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { init, searchText } from '../../../store/system/actions';
import { getGroups } from '../../../store/system/thunks';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize, ButtonType } from '../../../bosch-react/components/button/RbButton';
import RbSearchField from '../../../bosch-react/components/search-field/RbSearchField';

interface GroupsProps {
    userProfile: IUserProfile | undefined,
    items: any[],
    columns: IColumn[],
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    searchText: typeof searchText,
    getGroups: any
}

class Groups extends React.Component<GroupsProps, any>{

    searchBoxRef: React.RefObject<any> = React.createRef();

    permissionSrv: PermissionsService = new PermissionsService();

    constructor(props: GroupsProps) {
        super(props);

        this.state = {
            groupId: null,
            isShownNewGroup: false,
        };
        this.loadList = this.loadList.bind(this);
        this._renderItemColumn = this._renderItemColumn.bind(this);
        this.confirmDeletion = this.confirmDeletion.bind(this);
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
            this.loadList();
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
                                        <RbLabel className="header-title" size={LabelSize.Large}>Groups</RbLabel>
                                    </div>
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid">

                                            {/* Button "New group" */}
                                            <div className="ms-Grid-row common-padding-row">
                                                <div className="ms-Grid-col ms-sm9">
                                                    <RbButton label="New group" size={ButtonSize.Small} onClick={() => { this.setState({ groupId: null, isShownNewGroupn: true }); }} />
                                                </div>
                                                <div className="ms-Grid-col ms-sm3" style={{ textAlign: "right", padding: "0px" }}>
                                                    <RbSearchField ref={this.searchBoxRef} placeholder="Search..."
                                                        onChange={(event) => this.props.searchText(event.currentTarget.value)} />
                                                </div>
                                            </div>

                                            {/* List of Groups */}
                                            <Table detailsListProps={detailsListProps} height={60}></Table>

                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                        {/* Add New Group */}
                        {(this.state.isShownNewGroupn === true) ?
                            <GroupForm
                                groupId={this.state.groupId}
                                groups={this.props.items}
                                closeDialog={() => { this.setState({ isShownNewGroupn: false }); }}
                                refreshList={this.loadList} />
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
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Edit" onClick={() => { this.setState({ groupId: item.Id, isShownNewGroupn: true }); }} />
                        &nbsp;
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Remove" onClick={() => { this.confirmDeletion(item.GroupName); }} />
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
        this.props.init();
        Helper.runNewTask(() => {
            this.searchBoxRef.current.setValue("");
            this.props.getGroups([]);
        });
    }

    confirmDeletion(groupName: string) {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.CAUTION,
            Constants.CONFIRMATION_MESSAGE.REMOVE_GROUP.replace("{0}", groupName),
            false,
            () => {
                this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_GROUP);
                this.permissionSrv.removeSPGroup(groupName).then((result: any) => {
                    if (result === true) {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.GROUP_MESSAGE.REMOVE.SUCCESS.replace("{0}", groupName)
                        );
                        this.loadList();
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.GROUP_MESSAGE.REMOVE.FAILED.replace("{0}", groupName)
                        );
                    }
                    this.props.showDialog(false);
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.GROUP_MESSAGE.REMOVE.FAILED.replace("{0}", groupName)
                    );
                });
            }
        );
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
    searchText,
    getGroups
})(Groups);