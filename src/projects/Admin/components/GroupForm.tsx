import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import Constants from '../../../core/libraries/Constants';
import Template from '../../../core/libraries/Template';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import PermissionsService from '../../../services/PermissionsService';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbButton, { ButtonType, ButtonSize } from '../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';

interface GroupFormProps {
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    groupId: any,
    groups: any[],
    refreshList: () => {},
    closeDialog: () => {}
}

class GroupForm extends React.Component<GroupFormProps, any> {

    permissionsSrv: PermissionsService = new PermissionsService();

    oldMembers: any[] = [];

    constructor(props: GroupFormProps) {
        super(props);

        this.state = {
            clicked: false,
            isValid: false,

            groupNameRef: React.createRef(),
            descriptionRef: React.createRef(),
            membersRef: React.createRef()
        };
        this.renderGroupName = this.renderGroupName.bind(this);
        this.renderDescription = this.renderDescription.bind(this);
        this.renderMembers = this.renderMembers.bind(this);
        this.closeDialog = this.closeDialog.bind(this);

        this.createGroup = this.createGroup.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.checkExistingGroup = this.checkExistingGroup.bind(this);
        this.checkTextChanged = this.checkTextChanged.bind(this);
    }

    componentDidMount() {
        if (!_.isNil(this.props.groupId)) {
            Promise.all([
                this.permissionsSrv.getGroupById(this.props.groupId),
                this.permissionsSrv.getMembersByGroupId(this.props.groupId)
            ]).then((results: any[]) => {
                let group: any = results[0];
                let members: any = results[1];
                (this.state.groupNameRef as React.RefObject<any>).current.setValue(group.Title);
                (this.state.descriptionRef as React.RefObject<any>).current.setValue(group.Description);
                (this.state.membersRef as React.RefObject<any>).current.setItems(members);
                this.oldMembers = members;
                this.checkTextChanged();
            });
        }
    }

    render() {
        let element = (
            <Dialog minWidth="50vw" maxWidth="50vw"
                hidden={false}
                isDarkOverlay={true}
                onDismiss={(event: any) => {
                    if (event.currentTarget.type === "button") {
                        this.closeDialog(false);
                    }
                }}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: (_.isNil(this.props.groupId)) ? "New Group" : "Edit Group"
                }}
            >
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        {this.renderGroupName()}
                        {this.renderDescription()}
                        {this.renderMembers()}
                    </div>
                </div>

                <DialogFooter>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked || this.state.isValid === false} onClick={() => this.closeDialog(true)} label={(_.isNil(this.props.groupId)) ? "Create" : "Update"} />
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />
                </DialogFooter>
            </Dialog>
        );
        return element;
    }

    renderGroupName() {
        return Template.renderCommonTemplate("Group name",
            <RbTextField placeholder="Type group name ..." ref={this.state.groupNameRef} onChange={this.checkTextChanged} />,
            false, 4, 8, 12);
    }

    renderDescription() {
        return Template.renderCommonTemplate("Description",
            <RbTextField placeholder="Type description ..." isMultiple={true} minRows={5} ref={this.state.descriptionRef} />,
            true, 4, 8, 12);
    }

    renderMembers() {
        return Template.renderCommonTemplate("Members",
            <PeoplePicker principalType="All" ref={this.state.membersRef} />,
            true, 4, 8, 12);
    }

    closeDialog(isSaved = false) {
        if (isSaved === true) {
            let groupName = this.state.groupNameRef.current.getValue().trim();
            let description = this.state.descriptionRef.current.getValue().trim();
            let members = this.state.membersRef.current.getSelectedItems();

            let check = this.checkExistingGroup(groupName);
            if (check === true && _.isNil(this.props.groupId)) { // Only check if new created
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.INFO,
                    Constants.GROUP_MESSAGE.CREATE.EXISTED.replace("{0}", groupName)
                );
            }
            else {
                if (groupName.toLowerCase().indexOf("feber") > -1) {
                    if (_.isNil(this.props.groupId)) {
                        this.createGroup(groupName, description, members);
                    }
                    else {
                        this.editGroup(groupName, description, members);
                    }
                }
                else {
                    this.props.confirmDialog(
                        Constants.CONFIRMATION_MESSAGE.CAUTION,
                        Constants.CONFIRMATION_MESSAGE.INVALID_NAME_GROUP,
                        false,
                        () => {
                            if (_.isNil(this.props.groupId)) {
                                this.createGroup(groupName, description, members);
                            }
                            else {
                                this.editGroup(groupName, description, members);
                            }
                        }
                    );
                }
            }
        }
        else {
            this.props.closeDialog();
        }
    }

    createGroup(groupName: string, description: string, members: any[]) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.CREATE_NEW_GROUP);
        this.permissionsSrv.createNewSPGroup(groupName, description, { new: members, delete: [] }).then((result: any) => {
            if (result === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.GROUP_MESSAGE.CREATE.SUCCESS.replace("{0}", groupName)
                );
                this.props.showDialog(false);
                this.props.refreshList();
                this.closeDialog();
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.GROUP_MESSAGE.CREATE.FAILED.replace("{0}", groupName)
                );
                this.props.showDialog(false);
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.GROUP_MESSAGE.CREATE.FAILED.replace("{0}", groupName)
            );
            this.props.showDialog(false);
        });
    }

    editGroup(groupName: string, description: string, members: any[]) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.UPDATE_GROUP);
        this.permissionsSrv.editSPGroup(this.props.groupId, groupName, description, this.generateUpdateItem(members)).then((result: any) => {
            if (result === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.GROUP_MESSAGE.UPDATE.SUCCESS.replace("{0}", groupName)
                );
                this.props.showDialog(false);
                this.props.refreshList();
                this.closeDialog();
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.GROUP_MESSAGE.UPDATE.FAILED.replace("{0}", groupName)
                );
                this.props.showDialog(false);
            }
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.GROUP_MESSAGE.UPDATE.FAILED.replace("{0}", groupName)
            );
            this.props.showDialog(false);
        });

    }

    generateUpdateItem(members: any[]) {
        let result: any = { new: [], delete: [] };
        // Get new items
        members.forEach((member: any) => {
            let foundItems = this.oldMembers.filter(m => m.Id === member.id);
            if (foundItems.length === 0) {
                result.new.push(member);
            }
        });
        // Get deleted items
        this.oldMembers.forEach((oldMember: any) => {
            let foundItems = members.filter(m => m.id === oldMember.Id);
            if (foundItems.length === 0) {
                result.delete.push({ id: oldMember.Id });
            }
        });
        return result;
    }

    checkExistingGroup(groupName: string) {
        let isExisted = false;
        this.props.groups.forEach((group: any) => {
            if (group.GroupName.toLowerCase() === groupName.toLowerCase()) {
                isExisted = true;
            }
        });
        return isExisted;
    }

    checkTextChanged() {
        let groupName = this.state.groupNameRef.current.getValue().trim();
        this.setState({
            isValid: groupName !== ""
        });
    }

}

export default connect(null, { confirmDialog, showDialog, showToastMessage })(GroupForm);