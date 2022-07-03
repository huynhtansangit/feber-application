import * as React from 'react';
import { connect } from 'react-redux';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import '../../../core/scss/_customize.scss';
import Template from '../../../core/libraries/Template';
import Constants from '../../../core/libraries/Constants';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';
import { RootState } from '../../../store/configureStore';
import { updateField, updateStep } from '../../../store/upload/actions';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import { getROUListByPeoplePickerValues, loadLLDivisionAdmin, getROUListByDepartments, GetGroupManagerByPeoplePickerValues, GetGroupManagerByDepartments } from '../../../store/upload/thunks';
import { showDialog, confirmDialog } from '../../../store/util/actions';
import { IResponibleDepartment } from '../../../store/upload/types';
import { IUserProfile } from '../../../store/permission/types';
import Helper from '../../../core/libraries/Helper';
import { Lists } from '@pnp/sp/lists';

interface ReleaseProps {
    userProfile: IUserProfile
    commonReport: any,
    mode: string,
    rouList: IResponibleDepartment[],
    changedAuthor: boolean,
    showDialog: typeof showDialog,
    confirmDialog: typeof confirmDialog,
    updateField: typeof updateField,
    updateStep: typeof updateStep,
    getROUListByPeoplePickerValues: any,
    getROUListByDepartments: any,
    loadLLDivisionAdmin: any,
    validation: any,
    GetGroupManagerByPeoplePickerValues: any,
    GroupManagerList: IResponibleDepartment[],
    GetGroupManagerByDepartments: any
}

class Release extends React.Component<ReleaseProps, any>{
    replacedROURef: React.RefObject<any> = React.createRef();
    llDivisionAdminRef: React.RefObject<any> = React.createRef();
    feberDepartmentRef: React.RefObject<any> = React.createRef();
    additionalApproversRef: React.RefObject<any> = React.createRef();
    notificationUsersRef: React.RefObject<any> = React.createRef();
    feberGroupRef: React.RefObject<any> = React.createRef();
    constructor(props: ReleaseProps) {
        super(props);
        this.renderResponsibleDepartmentForBSH = this.renderResponsibleDepartmentForBSH.bind(this);
        this.renderResponsibleDepartment = this.renderResponsibleDepartment.bind(this);
        this.renderChangeDepartment = this.renderChangeDepartment.bind(this);
        this.renderAdditionalApprove = this.renderAdditionalApprove.bind(this);
        this.renderNotification = this.renderNotification.bind(this);
        this.renderDivisionalLLCoordinator = this.renderDivisionalLLCoordinator.bind(this);
        this.renderDivisionalLLCoordinatorNote = this.renderDivisionalLLCoordinatorNote.bind(this);
        this.alertNoResponsibleDepartment = this.alertNoResponsibleDepartment.bind(this);

        this.renderGroupManager = this.renderGroupManager.bind(this);
        this.renderChangeGroupManager = this.renderChangeGroupManager.bind(this);
        this.alertNoGroupManager = this.alertNoGroupManager.bind(this);
        this.alertNotInCRDivision = this.alertNotInCRDivision.bind(this);
        this.alertSameApprover = this.alertSameApprover.bind(this);
    }

    componentDidMount() {
        if (!!this.props.changedAuthor) {
            this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_ROU);
            if(this.props.commonReport.ReportAuthor === '')
            {
                let author = [{Id: this.props.userProfile.id, Title: this.props.userProfile.name}]
                this.props.getROUListByPeoplePickerValues(author, this.props.userProfile, (lists: IResponibleDepartment[]) => {
                    if (lists.length > 0) {
                        if (this.props.commonReport.UploadType !== Constants.DOCUMENT_TYPE.LL) {
                            this.props.showDialog(false);
                        }
                        else {
                            this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                                this.props.showDialog(false);
                                this.llDivisionAdminRef.current.setValue(
                                    (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                                );
                            });
                        }
                    }
                    else {
                        this.alertNoResponsibleDepartment();;
                    }
                });
            }
            else {
                //previus version
                this.props.getROUListByPeoplePickerValues(this.props.commonReport.ReportAuthor, this.props.userProfile, (lists: IResponibleDepartment[]) => {
                    if (lists.length > 0) {
                        if (this.props.commonReport.UploadType !== Constants.DOCUMENT_TYPE.LL) {
                            this.props.showDialog(false);
                        }
                        else {
                            this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                                this.props.showDialog(false);
                                this.llDivisionAdminRef.current.setValue(
                                    (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                                );
                            });
                        }
                        //get Group Manager
                        // if(this.props.commonReport.Division === "CR" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.RnD){
                        //     this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_GM);
                        //     this.props.GetGroupManagerByPeoplePickerValues(this.props.commonReport.ReportAuthor, this.props.userProfile, (lists: IResponibleDepartment[]) => {
                        //         if (lists.length > 0) {
                        //             this.props.showDialog(false);
                        //         }
                        //         else {
                        //             this.alertNoGroupManager();
                        //         }
                        //     });
                        // }
                        // if(this.props.commonReport.Division !== "RBEI" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.RnD){
                        //     this.props.GetGroupManagerByPeoplePickerValues(this.props.commonReport.ReportAuthor, this.props.userProfile, (lists: IResponibleDepartment[]) => {
                        //         if (lists.length > 0) {
                        //             this.props.showDialog(false);
                        //         }
                        //         else {
                        //             //
                        //         }
                        //     });
                        // }
                    }
                    else {
                        this.alertNoResponsibleDepartment();;
                    }
                });
            }
        }
    }

    render() {
        if (this.props.changedAuthor === true){
            this.props.commonReport.ROU = null;
            this.props.commonReport.GroupManager = {Id: "", Title: ""};
        }
        return (
            <React.Fragment>
                {((this.props.rouList.filter(r => r.Division === "BSH" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.LL)).length > 0) ?
                    <React.Fragment>
                        {this.renderResponsibleDepartmentForBSH()}
                        {Template.renderNote("Since this is a BSH report, please provide the approver directly rather than input organization name.")}
                    </React.Fragment>
                    : <React.Fragment>
                        {this.renderResponsibleDepartment()}
                        {this.renderChangeDepartment()}
                    </React.Fragment>}
                {this.renderGroupManager()}
                {this.renderChangeGroupManager()}
                {this.renderAdditionalApprove()}
                {this.renderNotification()}
                {this.renderDivisionalLLCoordinator()}
                {this.renderDivisionalLLCoordinatorNote()}
            </React.Fragment>
        );
    }

    renderResponsibleDepartmentForBSH() {
        if (this.props.changedAuthor === true){
            return Template.renderUploadRowTemplate("Responsible department",
            <React.Fragment>
                <PeoplePicker principalType="User" itemLimit={1}
                    //defaultValue={(!!this.props.commonReport.ROU ? [this.props.commonReport.ROU] : [])}
                    //defaultValue={([])}
                    defaultValue={([])}
                    componentRef={this.replacedROURef} onChange={() => {
                        let items = this.replacedROURef.current.getSelectedItems();
                        let results: any[] = [];
                        items.forEach((item: any) => {
                            results.push({
                                Id: item.id,
                                Title: item.displayName
                            });
                        });

                        this.props.updateField("ROU", ((!!results) ? results[0] : null));
                        if (!!results) {
                            Helper.runNewTask(() => {
                                this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_LL_DIVISIONAL_ADMIN);
                                this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                                    this.props.showDialog(false);
                                    this.llDivisionAdminRef.current.setValue(
                                        (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                                    );
                                });
                            });
                        }
                    }} />
            </React.Fragment>, Constants.UPLOAD_INFO_MESSAGE.RESPONSIBLE_DEPARTMENT, null, true, this.props.validation.ROU); 
        }
        else {
            return Template.renderUploadRowTemplate("Responsible department",
                <React.Fragment>
                    <PeoplePicker principalType="User" itemLimit={1}
                        //defaultValue={(!!this.props.commonReport.ROU ? [this.props.commonReport.ROU] : [])}
                        //defaultValue={([])}
                        defaultValue={(!!this.props.commonReport.ROU ? [this.props.commonReport.ROU] : [])}
                        componentRef={this.replacedROURef} onChange={() => {
                            let items = this.replacedROURef.current.getSelectedItems();
                            let results: any[] = [];
                            items.forEach((item: any) => {
                                results.push({
                                    Id: item.id,
                                    Title: item.displayName
                                });
                            });

                            this.props.updateField("ROU", ((!!results) ? results[0] : null));
                            if (!!results) {
                                Helper.runNewTask(() => {
                                    this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_LL_DIVISIONAL_ADMIN);
                                    this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                                        this.props.showDialog(false);
                                        this.llDivisionAdminRef.current.setValue(
                                            (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                                        );
                                    });
                                });
                            }
                        }} />
                </React.Fragment>, Constants.UPLOAD_INFO_MESSAGE.RESPONSIBLE_DEPARTMENT, null, true, this.props.validation.ROU); 
            }
    }

    renderResponsibleDepartment() {
        let infoMessage = "";
        if(this.props.commonReport.Division === "CR" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.RnD){
            infoMessage = "Since this is a CR report, The department head will be the last additional approver."
        }
        else {
            infoMessage =  Constants.UPLOAD_INFO_MESSAGE.RESPONSIBLE_DEPARTMENT
        }

        const options = this.props.rouList.map(rou => {
            return {
                key: rou.ROU.Id,
                text: ((this.props.mode === "admin") ? rou.Department.replace("_", "/") : rou.ROU.Title),
                data: rou
            } as IDropdownOption;
        });
        if (!!this.props.commonReport.ROU) {
            if (!!this.props.commonReport.ROU.Division) {
                this.props.commonReport.ROU = this.props.commonReport.ROU.ROU;
            }
        }
        return Template.renderUploadRowTemplate("Responsible department",
        <Dropdown
            selectedKey={(!!this.props.commonReport.ROU) ? this.props.commonReport.ROU.Id : null}
            options={options}
            onChange={(event, option) => { 
                this.props.updateField("ROU", option.data);
                if (this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.LL) {
                    Helper.runNewTask(() => {
                        this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_LL_DIVISIONAL_ADMIN);
                        this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                            this.props.showDialog(false);
                            this.llDivisionAdminRef.current.setValue(
                                (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                            );
                        });
                    });
                }
                this.forceUpdate();
            }}
        />, infoMessage, null, true, this.props.validation.ROU);
        
    }
    renderChangeDepartment() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm2">  </div>
                    <div className="ms-Grid-col ms-sm5">
                        <PeoplePicker principalType="SecurityGroup"
                            componentRef={this.feberDepartmentRef} />
                    </div>
                    <div className="ms-Grid-col ms-sm5">
                        <RbButton label="Change department" size={ButtonSize.Tiny}
                            onClick={() => {
                                this.props.updateField("GroupManagerList", []);  
                                let items: any[] = this.feberDepartmentRef.current.getSelectedItems();
                                if (!!items) {
                                    this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_ROU);
                                    this.props.getROUListByDepartments(items.map(i => {
                                        return {
                                            Id: i.id,
                                            Title: i.displayName
                                        }
                                    }), this.props.userProfile, (lists: IResponibleDepartment[]) => {
                                        if (lists.length > 0) {
                                            if (this.props.commonReport.UploadType !== Constants.DOCUMENT_TYPE.LL) {
                                                this.props.showDialog(false);
                                                //Group Manager
                                                this.props.updateField("GroupManager", {Division: "", Department: "", ROU: {Id: "", Title: ""}});
                                                //this.props.updateField("GroupManager", nu);
                                            }
                                            else {
                                                this.props.loadLLDivisionAdmin(this.props.commonReport.Division, () => {
                                                    this.props.showDialog(false);
                                                    this.llDivisionAdminRef.current.setValue(
                                                        (!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""
                                                    );
                                                });
                                            }
                                        }
                                        else {
                                            this.props.commonReport.ROU = null;
                                            this.alertNoResponsibleDepartment();
                                        }
                                    });
                                }
                            }
                            } />
                    </div>
                </div>
            </div>
        );
    }

    renderGroupManager() {
        const dropdownStyles: Partial<IDropdownStyles> = {
            caretDownWrapper: {display: "none"}
        }
        if(this.props.commonReport.Division === "CR" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.RnD){
            const filterGroupManager = this.props.GroupManagerList.filter(r => r.Division === "CR")
            const options = filterGroupManager.map(group => {
                return {
                    key: group.ROU.Id,
                    text: ((this.props.mode === "admin") ? group.Department.replace("_", "/") : group.ROU.Title),
                    data: group
                } as IDropdownOption;
            });
            return Template.renderUploadRowTemplate("Strategic Portfolio Owner",
            <Dropdown
                isDisabled = {true}
                styles={dropdownStyles}
                selectedKey={(!!this.props.commonReport.GroupManager) ? this.props.commonReport.GroupManager.Id : null}
                options={options}
                onChange={(event, option) => {
                    this.props.updateField("GroupManager", option.data);  
                    this.forceUpdate();
                }}
            />, Constants.UPLOAD_INFO_MESSAGE.GROUP_MANAGER, null, true, this.props.validation.GroupManager);
        }
        else {
            return null;
        }
    }
    renderChangeGroupManager() {
        if(this.props.commonReport.Division === "CR" && this.props.commonReport.UploadType === Constants.DOCUMENT_TYPE.RnD){
            return (
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm2">  </div>
                        <div className="ms-Grid-col ms-sm5">
                            <PeoplePicker principalType="SecurityGroup"
                                componentRef={this.feberGroupRef} />
                        </div>
                        <div className="ms-Grid-col ms-sm5">
                            <RbButton label="Change SPF Owner" size={ButtonSize.Tiny}
                                onClick={() => {
                                    this.props.updateField("GroupManager", {Division: "", Department: "", ROU: {Id: "", Title: ""}}); 
                                    let items: any[] = this.feberGroupRef.current.getSelectedItems();
                                    if (!!items) {
                                        this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_GM);
                                        this.props.GetGroupManagerByDepartments(items.map(i => {
                                            return {
                                                Id: i.id,
                                                Title: i.displayName
                                            }
                                        }), this.props.userProfile, (lists: IResponibleDepartment[]) => {
                                            if (lists.length > 0) {
                                                this.props.showDialog(false);
                                                let listFilterLength = lists.filter(list => list.Division !== "CR").length
                                                if(listFilterLength > 0){
                                                    this.alertNotInCRDivision();
                                                    //this.props.updateField("GroupManager", null); 
                                                    this.props.updateField("GroupManager", {Division: "", Department: "", ROU: {Id: "", Title: ""}}); 
                                                }
                                                else{
                                                    this.props.commonReport.FeberDepartment = this.props.commonReport.GroupDepartment;                                                   
                                                }
                                            }
                                            else {
                                                this.alertNoGroupManager();
                                            }
                                            
                                        });
                                    }
                                }
                                } />
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    renderAdditionalApprove() {
        return Template.renderUploadRowTemplate("Additional approvers",
            <PeoplePicker principalType="User" defaultValue={!!this.props.commonReport.AdditionalApprovers ? this.props.commonReport.AdditionalApprovers : []}
                componentRef={this.additionalApproversRef} onChange={() => {
                    let items = this.additionalApproversRef.current.getSelectedItems();
                    let results: any[] = [];
                    items.forEach((item: any) => {
                        if (!!item.displayName) {
                            results.push({
                                Id: item.id,
                                Title: item.displayName
                            });
                        }
                    });
                    this.props.updateField("AdditionalApprovers", results);
                }
                } />,
            Constants.UPLOAD_INFO_MESSAGE.ADDITIONAL_APRROVERS, "(Optional)");

    }
    renderNotification() {
        if (this.props.commonReport.UploadType !== "LL") {
            return Template.renderUploadRowTemplate("Notification",
                <PeoplePicker principalType="User" defaultValue={!!this.props.commonReport.NotificationUsers ? this.props.commonReport.NotificationUsers : []}
                    componentRef={this.notificationUsersRef} onChange={() => {
                        let items = this.notificationUsersRef.current.getSelectedItems();
                        let results: any[] = [];
                        items.forEach((item: any) => {
                            if (!!item.displayName) {
                                results.push({
                                    Id: item.id,
                                    Title: item.displayName
                                });
                            }
                        });
                        this.props.updateField("NotificationUsers", results);
                    }
                    } />,
                Constants.UPLOAD_INFO_MESSAGE.NOTIFICATION, "(Optional)", true, this.props.validation.NotificationUsers);
        }

    }

    renderDivisionalLLCoordinator() {
        if (this.props.commonReport.UploadType === "LL") {
            return Template.renderUploadRowTemplate("Divisional lessons learned coordinator",
                <RbTextField disabled={true} ref={this.llDivisionAdminRef}
                    value={(!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""}
                />, "", "", false);
        }
    }
    renderDivisionalLLCoordinatorNote() {
        if (this.props.commonReport.UploadType === "LL") {
            return Template.renderCoordinatorNote('Cannot be changed manually, selection based on responsible department.');
        }
    }
    alertNoResponsibleDepartment() {
        this.props.showDialog(false);
        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.NO_ROU.TITLE,
            Constants.CONFIRMATION_MESSAGE.NO_ROU.CONTENT
            , true, () => { });
    }

    alertNoGroupManager() {
        this.props.showDialog(false);
        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.NO_GM.TITLE,
            Constants.CONFIRMATION_MESSAGE.NO_GM.CONTENT
            , true, () => { });
    }

    alertNotInCRDivision() {
        this.props.showDialog(false);
        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.NOT_CR_GROUP.TITLE,
            Constants.CONFIRMATION_MESSAGE.NOT_CR_GROUP.CONTENT
            , true, () => { });
    }
    
    alertSameApprover() {
        this.props.showDialog(false);
        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.SAME_APPROVER.TITLE,
            Constants.CONFIRMATION_MESSAGE.SAME_APPROVER.CONTENT
            , true, () => { });
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    commonReport: state.upload.commonReport,
    mode: state.upload.mode,
    validation: state.upload.validation,
    rouList: state.upload.rouLists,
    changedAuthor: state.upload.changedAuthor,
    GroupManagerList: state.upload.GroupManagerList
});
export default connect(mapStateToProps, {
    showDialog,
    confirmDialog,
    updateField,
    updateStep,
    getROUListByPeoplePickerValues,
    getROUListByDepartments,
    loadLLDivisionAdmin,
    GetGroupManagerByPeoplePickerValues,
    GetGroupManagerByDepartments
})(Release);
