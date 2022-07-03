import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import Color from '../../../core/libraries/Color';
import Template from '../../../core/libraries/Template';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import IDMService from '../../../services/IDMService';
import PermissionsService from '../../../services/PermissionsService';
import SystemService from '../../../services/SystemService';
import Helper from '../../../core/libraries/Helper';
import Constants from '../../../core/libraries/Constants';
import Environment from '../../../Environment';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import _ from 'lodash';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';

interface MoveReport_MoveInformationProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    moveItem: any,
    updateUploadType: (option: any) => {},
    move: () => {}
}

class MoveReport_MoveInformation extends React.Component<MoveReport_MoveInformationProps, any> {

    systemListsSrv: SystemService = new SystemService();

    idmSrv: IDMService = new IDMService();

    permissionsSrv: PermissionsService = new PermissionsService();

    constructor(props: MoveReport_MoveInformationProps) {
        super(props);

        this.state = {
            targetDivisions: [],
            selectedTargetDivision: null,
            selectedTargetDepartment: null,
            isCheckingDepartment: false,
            rou: null,
            selectedUploadType: "",
            selectedSecurityClass: "",

            TargetDepartmentRef: React.createRef()
        };
        this.renderToDivision = this.renderToDivision.bind(this);
        this.renderToDepartment = this.renderToDepartment.bind(this);
        this.renderToUploadType = this.renderToUploadType.bind(this);
        this.renderToSecurityClass = this.renderToSecurityClass.bind(this);

        this.check = this.check.bind(this);
        this.move = this.move.bind(this);
    }

    componentDidMount() {
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            let list: any[] = [];
            results.forEach(division => {
                list.push({
                    key: (!_.isNil(division.DivisionCode)) ? division.DivisionCode : division.Title,
                    text: division.DivisionName
                });
            });
            list = Helper.sortObjects(list, "text");
            this.setState({
                targetDivisions: list
            }, () => {
                // Do nothing
            });
        });
    }

    render() {
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12">
                        <RbLabel style={{ color: Color.BLUE }}><h4 style={{ marginBottom: "0px" }}>Move Information</h4></RbLabel>
                    </div>
                </div>
                {this.renderToDivision()}
                {this.renderToDepartment()}
                {this.renderToUploadType()}
                {this.renderToSecurityClass()}
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12">
                        <br />
                        <RbButton label="Move" size={ButtonSize.Small} disabled={_.isNil(this.state.selectedTargetDivision) || _.isNil(this.state.selectedTargetDepartment)
                            // Super admin: Upload Type is required
                            || (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])
                                && (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD || this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL) ? this.state.selectedUploadType === "" : false)
                            // RnD Division Admin or Thesis Admin: Security Class is required
                            || (((this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN]) && this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.Thesis)
                                || this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])
                                || this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) ? this.state.selectedSecurityClass === "" : false)}
                            onClick={this.move} />
                    </div>
                </div>
            </div>
        );
        return element;
    }

    renderToDivision() {
        return (
            <div className="ms-Grid-row">
                {Template.renderCommonTemplate(
                    "To division",
                    <Dropdown
                        selectedKey={this.state.selectedTargetDivision}
                        placeholder="Generated from department"
                        disabled={true}
                        options={this.state.targetDivisions}
                    />, false, 4, 8, 11)}
            </div>
        );
    }

    renderToDepartment() {
        return (
            <div className="ms-Grid-row">
                {Template.renderCommonTemplate(
                    "To department",
                    (_.isNil(this.state.selectedTargetDepartment)) ?
                        <PeoplePicker itemLimit="1" principalType="SecurityGroup" ref={this.state.TargetDepartmentRef} />
                        : <RbLabel hasPadding={true}>{this.state.selectedTargetDepartment}</RbLabel>
                    , false, 4, 8, 11)}
                {Template.renderCommonTemplate("",
                    <div>
                        {/* Buttons */}
                        {(this.state.isCheckingDepartment === true) ?
                            <RbLoadingSpinner />
                            : ((_.isNil(this.state.selectedTargetDepartment)) ?
                                <RbButton label="Check" size={ButtonSize.Small} onClick={this.check} />
                                : <RbButton label="Clear" size={ButtonSize.Small} onClick={() => {
                                    this.setState({
                                        selectedTargetDivision: null,
                                        selectedTargetDepartment: null,
                                        rou: null
                                    });
                                }} />)}
                        {/* Messages */}
                        <span style={{ display: "inline-block" }}>
                            {((!_.isNil(this.state.rou) && this.state.isCheckingDepartment === false) ?
                                <RbLabel style={{ color: (this.state.rou !== 0) ? Color.GREEN : Color.RED }}>
                                    {
                                        <b>&nbsp;&nbsp;&nbsp;{(this.state.rou !== 0) ? "Valid" : "Invalid"}</b>
                                    }
                                </RbLabel>
                                : "")}
                        </span>
                    </div>, false, 4, 8, 11)}
            </div>
        );
    }

    renderToUploadType() {
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])
            && (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD || this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL)) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "To upload type",
                        <Dropdown
                            selectedKey={this.state.selectedUploadType}
                            placeholder="Choose upload type ..."
                            options={Constants.DD_DOCUMENT_TYPES_FOR_ADMIN_MOVE}
                            onChange={(event, option) => {
                                if (!_.isUndefined(option)) {
                                    if (this.props.moveItem.SecurityClass === Constants.SECURITY_CLASS_LONG_NAME.SC3 && option.key === Constants.DOCUMENT_TYPE.LL) {
                                        this.props.confirmDialog(
                                            Constants.CONFIRMATION_MESSAGE.CAUTION,
                                            Constants.CONFIRMATION_MESSAGE.MOVE_SC3
                                                .replace("{0}", this.props.moveItem.Title)
                                                .replace("{1}", Constants.SECURITY_CLASS_LONG_NAME.SC3)
                                                .replace("{2}", Constants.SECURITY_CLASS_LONG_NAME.SC1),
                                            false,
                                            () => {
                                                window.location.href = Environment.phaPageUrl + "AccessMediator.aspx?Guid=" + this.props.moveItem.GUID1 + "&Mode=Move";
                                            }
                                        );
                                    }
                                    else {
                                        this.setState({ selectedUploadType: option.key });
                                        this.props.updateUploadType(option.key);
                                    }
                                }
                            }}
                        />, false, 4, 8, 11)}
                </div>
            );
        }
        return "";
    }

    renderToSecurityClass() {
        let options: any[] = [];
        switch (this.props.moveItem.UploadType) {
            case Constants.DOCUMENT_TYPE.RnD: {
                options = Constants.DD_SECURITY_CLASSES_ALL;
                break;
            }
            case Constants.DOCUMENT_TYPE.Thesis: {
                options = Constants.DD_SECURITY_CLASSES_ONLY_2_ALL;
                break;
            }
            default: {
                break;
            }
        }
        if ((this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN]) && this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.Thesis)
            || this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])
            || this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "To security class",
                        <Dropdown
                            selectedKey={this.state.selectedSecurityClass}
                            placeholder="Choose security class ..."
                            options={options}
                            onChange={(event, option) => {
                                if (!_.isUndefined(option)) {
                                    if (this.props.moveItem.RelevantforFDLegislation) {
                                        if ((option.key !== Constants.SECURITY_CLASS_LONG_NAME.SC1 || this.props.moveItem.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1) && this.props.moveItem.SecurityClass !== option.key && option.key !== "") {
                                            this.setState({ selectedSecurityClass: "" }, () => {
                                                this.props.confirmDialog(
                                                    Constants.CONFIRMATION_MESSAGE.CAUTION,
                                                    Constants.CONFIRMATION_MESSAGE.MOVE_SC3
                                                        .replace("{0}", this.props.moveItem.Title)
                                                        .replace("{1}", this.props.moveItem.SecurityClass)
                                                        .replace("{2}", option.text),
                                                    false,
                                                    () => {
                                                        window.location.href = Environment.phaPageUrl + "AccessMediator.aspx?Guid=" + this.props.moveItem.GUID1 + "&Mode=Move";
                                                    }
                                                );
                                            });
                                        }
                                        else {
                                            this.setState({
                                                selectedSecurityClass: option.key
                                            });
                                        }
                                    }
                                    else {
                                        if ((option.key === Constants.SECURITY_CLASS_LONG_NAME.SC3 || this.props.moveItem.SecurityClass === Constants.SECURITY_CLASS_LONG_NAME.SC3) && this.props.moveItem.SecurityClass !== option.key && option.key !== "") {
                                            this.setState({ selectedSecurityClass: "" }, () => {
                                                this.props.confirmDialog(
                                                    Constants.CONFIRMATION_MESSAGE.CAUTION,
                                                    Constants.CONFIRMATION_MESSAGE.MOVE_SC3
                                                        .replace("{0}", this.props.moveItem.Title)
                                                        .replace("{1}", this.props.moveItem.SecurityClass)
                                                        .replace("{2}", option.text),
                                                    false,
                                                    () => {
                                                        window.location.href = Environment.phaPageUrl + "AccessMediator.aspx?Guid=" + this.props.moveItem.GUID1 + "&Mode=Move";
                                                    }
                                                );
                                            });
                                        }
                                        else {
                                            this.setState({
                                                selectedSecurityClass: option.key
                                            });
                                        }
                                    }
                                    // if ((option.key !== Constants.SECURITY_CLASS_LONG_NAME.SC1 || this.props.moveItem.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1) && this.props.moveItem.SecurityClass !== option.key && option.key !== "") {
                                    //     this.setState({ selectedSecurityClass: "" }, () => {
                                    //         this.props.confirmDialog(
                                    //             Constants.CONFIRMATION_MESSAGE.CAUTION,
                                    //             Constants.CONFIRMATION_MESSAGE.MOVE_SC3
                                    //                 .replace("{0}", this.props.moveItem.Title)
                                    //                 .replace("{1}", this.props.moveItem.SecurityClass)
                                    //                 .replace("{2}", option.text),
                                    //             false,
                                    //             () => {
                                    //                 window.location.href = Environment.phaPageUrl + "AccessMediator.aspx?Guid=" + this.props.moveItem.GUID1 + "&Mode=Move";
                                    //             }
                                    //         );
                                    //     });
                                    // }
                                    // else {
                                    //     this.setState({
                                    //         selectedSecurityClass: option.key
                                    //     });
                                    // }
                                }
                            }}
                        />, false, 4, 8, 11)}
                </div>
            );
        }
        return "";
    }

    check() {
        this.setState({ isCheckingDepartment: true }, () => {
            let departments = this.state.TargetDepartmentRef.current.getSelectedItems();
            if (departments.length > 0) {
                // Get ROU Id
                this.idmSrv.getROUId(this.props.userProfile.userToken, departments[0].displayName).then((rouId: number) => {
                    // Get ensured SP user for NTID
                    this.permissionsSrv.getUserById(rouId).then((rouUser: any) => {
                        // Get user's division
                        let loginName = (rouUser.LoginName.indexOf("\\") > -1) ? rouUser.LoginName.split("\\")[1] : rouUser.LoginName;
                        this.idmSrv.getResponsibleDepartments(this.props.userProfile.userToken, loginName).then((rous: any[]) => {               
                            if (rous.length > 0) {
                                let rouDivision = rous[0].Division;
                                let userPermissions = this.props.userProfile?.permissions;
                                if (!_.isNil(userPermissions)) {
                                    if (userPermissions.checkHasPermission(
                                        [Constants.PERMISSIONS.RND_DIVISION_ADMIN, Constants.PERMISSIONS.LL_DIVISION_ADMIN]
                                    )) {
                                        if (userPermissions.checkHasDivisionAdminPermission(Constants.DOCUMENT_TYPE.RnD, "", rouDivision)
                                            || userPermissions.checkHasDivisionAdminPermission(Constants.DOCUMENT_TYPE.LL, "", rouDivision)) {
                                            this.setState({
                                                isCheckingDepartment: false,
                                                selectedTargetDepartment: (rouId !== 0) ? departments[0].displayName : null,
                                                rou: rouId,
                                                selectedTargetDivision: ((userPermissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) ?
                                                    userPermissions.checkRnDDivisionAdmin?.divisionCode
                                                    : userPermissions.checkLLDivisionAdmin?.divisionCode)
                                            });
                                        }
                                        else {
                                            this.props.showToastMessage(
                                                Constants.TOAST_MESSAGE_CODE.WARN,
                                                Constants.GENERAL_ERROR_MESSAGE.DEPARTMENT_NOT_BELONG_TO_DIVISON
                                            );
                                            this.setState({
                                                isCheckingDepartment: false,
                                                selectedTargetDepartment: null,
                                                rou: 0,
                                                selectedTargetDivision: null
                                            });
                                        }
                                    }
                                    else {
                                        this.setState({
                                            isCheckingDepartment: false,
                                            selectedTargetDepartment: (rouId !== 0) ? departments[0].displayName : null,
                                            rou: rouId,
                                            selectedTargetDivision: rouDivision
                                        });
                                    }
                                }
                            }
                        }).catch(() => {
                            this.setState({
                                isCheckingDepartment: false,
                                selectedTargetDepartment: null,
                                rou: 0,
                                selectedTargetDivision: null
                            });
                        });
                    }).catch(() => {
                        this.setState({
                            isCheckingDepartment: false,
                            selectedTargetDepartment: null,
                            rou: 0,
                            selectedTargetDivision: null
                        });
                    });
                }).catch(() => {
                    this.setState({
                        isCheckingDepartment: false,
                        selectedTargetDepartment: null,
                        rou: 0,
                        selectedTargetDivision: null
                    });
                });
            }
            else {
                this.setState({
                    isCheckingDepartment: false,
                    selectedTargetDepartment: null,
                    rou: null,
                    selectedTargetDivision: null
                });
            }
        });
    }

    move() {
        this.props.move();
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage }, null, { forwardRef: true })(MoveReport_MoveInformation);