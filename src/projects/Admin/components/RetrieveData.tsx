import * as React from 'react'
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import Color from '../../../core/libraries/Color';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import SystemService from '../../../services/SystemService';
import DepartmentService from '../../../services/DepartmentService';
import MigrationService from '../../../services/MigrationService';
import IDMService from '../../../services/IDMService';
import Helper from '../../../core/libraries/Helper';
import PermissionsService from '../../../services/PermissionsService';
import Constants from '../../../core/libraries/Constants';
import { IUserProfile } from '../../../store/permission/types';
import { showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import _ from 'lodash';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';

interface RetrieveDataProps {
    userProfile: IUserProfile | undefined,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    refreshData: () => {}
}

class RetrieveData extends React.Component<RetrieveDataProps, any> {

    permissionsSrv: PermissionsService = new PermissionsService();

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    migrationDataSrv: MigrationService = new MigrationService();

    idmSrv: IDMService = new IDMService();

    constructor(props: RetrieveDataProps) {
        super(props);

        this.state = {
            isCheckingDepartment: false,
            rou: null,

            selectedDocumentType: "",
            selectedSourceDivision: null,
            sourceDivisions: [],
            selectedTargetDivision: null,
            targetDivisions: [],
            selectedSourceDepartment: null,
            sourceDepartments: [],
            selectedTargetDepartment: null,
            TargetDepartmentRef: React.createRef(),
        };
        this.setDefaultValue = this.setDefaultValue.bind(this);

        this.renderDocumentType = this.renderDocumentType.bind(this);
        this.renderSourceDivision = this.renderSourceDivision.bind(this);
        this.renderTargetDivision = this.renderTargetDivision.bind(this);
        this.renderSourceDepartment = this.renderSourceDepartment.bind(this);
        this.renderTargetDepartment = this.renderTargetDepartment.bind(this);
        this.renderRetrieveTemplate = this.renderRetrieveTemplate.bind(this);

        this.resetSourceDepartments = this.resetSourceDepartments.bind(this);
        this.getSourceDepartments = this.getSourceDepartments.bind(this);
        this.check = this.check.bind(this);
        this.retrieve = this.retrieve.bind(this);
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
                sourceDivisions: list,
                targetDivisions: list
            }, () => {
                this.setDefaultValue();
            });
        });
    }

    render() {
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    {this.renderDocumentType()}
                </div>
                <div className="ms-Grid-row">
                    {this.renderSourceDivision()}
                    <div className="ms-Grid-col ms-sm2" />
                    {this.renderTargetDivision()}
                </div>
                <div className="ms-Grid-row">
                    {this.renderSourceDepartment()}
                    <div className="ms-Grid-col ms-sm2" />
                    {this.renderTargetDepartment()}
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm5" />
                    <div className="ms-Grid-col ms-sm2" />
                    {this.renderRetrieveTemplate("",
                        <div>
                            {/* Buttons */}
                            {(this.state.isCheckingDepartment === true) ?
                                <RbLoadingSpinner />
                                : ((_.isNil(this.state.selectedTargetDepartment)) ?
                                    <RbButton label="Check" size={ButtonSize.Small} onClick={this.check} />
                                    :
                                    <RbButton label="Clear" size={ButtonSize.Small} onClick={() => {
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
                        </div>
                    )}
                </div>
                <div className="ms-Grid-row">
                    <RbButton label="Retrieve" size={ButtonSize.Small} disabled={_.isNil(this.state.selectedTargetDivision)
                        || _.isNil(this.state.selectedTargetDepartment) || _.isNil(this.state.selectedSourceDepartment)} onClick={this.retrieve} />
                </div>
            </div>
        );
        return element;
    }

    setDefaultValue() {
        let userPermissions = this.props.userProfile?.permissions;
        if (!_.isUndefined(userPermissions)) {
            if (!userPermissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
                if (userPermissions.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN])) {
                    this.setState({ selectedDocumentType: Constants.DOCUMENT_TYPE.LL });
                }
                else if (userPermissions.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
                    this.setState({ selectedDocumentType: Constants.DOCUMENT_TYPE.Thesis });
                }
                else if (userPermissions.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN])) {
                    this.setState({ selectedDocumentType: Constants.DOCUMENT_TYPE.Paper });
                }
                else {
                    if (userPermissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
                        this.state.sourceDivisions.forEach((division: any) => {
                            if (userPermissions?.checkRnDDivisionAdmin?.divisionCode === division.key) {
                                this.setState({
                                    selectedDocumentType: Constants.DOCUMENT_TYPE.RnD,
                                    selectedSourceDivision: division.key
                                }, () => {
                                    this.resetSourceDepartments();
                                });
                            }
                        });
                    }
                    else if (userPermissions.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN])) {
                        this.state.targetDivisions.forEach((division: any) => {
                            if (userPermissions?.checkLLDivisionAdmin?.divisionCode === division.key) {
                                this.setState({
                                    selectedDocumentType: Constants.DOCUMENT_TYPE.LL,
                                    selectedSourceDivision: division.key
                                }, () => {
                                    this.resetSourceDepartments();
                                });
                            }
                        });
                    }
                }
            }
        }
    }

    renderDocumentType() {
        return this.renderRetrieveTemplate("Document type",
            <Dropdown
                selectedKey={this.state.selectedDocumentType}
                placeholder="Choose document type ..."
                options={Constants.DD_DOCUMENT_TYPES_ALL}
                disabled={!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.setState({ selectedDocumentType: option.key }, () => {
                            this.resetSourceDepartments();
                        });
                    }
                }}
            />);
    }

    renderSourceDivision() {
        return this.renderRetrieveTemplate("Source division",
            (this.props.userProfile?.permissions?.checkHasPermission(
                [Constants.PERMISSIONS.RND_DIVISION_ADMIN, Constants.PERMISSIONS.LL_DIVISION_ADMIN]
            )) ?
                <Dropdown
                    selectedKey={this.state.selectedSourceDivision}
                    placeholder="Choose source division ..."
                    options={this.state.sourceDivisions}
                    disabled={true}
                />
                : <Dropdown
                    selectedKey={this.state.selectedSourceDivision}
                    placeholder="Choose source division ..."
                    options={this.state.sourceDivisions}
                    onChange={(event, option) => {
                        if (!_.isUndefined(option)) {
                            this.setState({ selectedSourceDivision: option.key }, () => {
                                this.getSourceDepartments();
                            });
                        }
                    }}
                />);
    }

    renderTargetDivision() {
        return this.renderRetrieveTemplate("Target division",
            <Dropdown
                selectedKey={this.state.selectedTargetDivision}
                placeholder="Generate from target department"
                options={this.state.targetDivisions}
                disabled={true}
            />);
    }

    renderSourceDepartment() {
        return this.renderRetrieveTemplate("Source department",
            <Dropdown
                selectedKey={this.state.selectedSourceDepartment}
                placeholder="Choose source department ..."
                disabled={this.state.sourceDepartments.length === 0}
                options={this.state.sourceDepartments}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.setState({ selectedSourceDepartment: option.key });
                    }
                }}
            />);
    }

    renderTargetDepartment() {
        return this.renderRetrieveTemplate("Target department",
            (_.isNil(this.state.selectedTargetDepartment)) ?
                <PeoplePicker itemLimit="1" principalType="SecurityGroup" ref={this.state.TargetDepartmentRef} />
                : <RbLabel hasPadding={true}>{this.state.selectedTargetDepartment}</RbLabel>);
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

    resetSourceDepartments() {
        this.setState({
            selectedSourceDepartment: null,
            sourceDepartments: [],
        }, () => {
            this.getSourceDepartments();
        });
    }

    getSourceDepartments() {
        if (!_.isNil(this.state.selectedSourceDivision)) {
            this.setState({
                sourceDepartments: []
            }, () => {
                this.departmentListsSrv.getUniqueDepartments(this.state.selectedDocumentType, this.state.selectedSourceDivision).then((results: any[]) => {
                    let departments: any[] = [];
                    results.forEach(department => {
                        departments.push({ key: department.replace("/", "_"), text: department });
                    });
                    this.setState({
                        sourceDepartments: departments
                    });
                });
            });
        }
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
                                                selectedTargetDivision: ((userPermissions.checkRnDDivisionAdmin?.divisionCode !== "") ?
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

    async retrieve() {
        if (this.state.selectedSourceDepartment.replace("/", "_") !== this.state.selectedTargetDepartment.replace("/", "_")) {
            this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_DATA);
            let portfolioId = 0;
            if(this.state.selectedDocumentType === "RnD" && this.state.selectedTargetDivision === "CR"){
                await this.idmSrv.GetGroupManagerByDepartments([{"Id": "", "Title": this.state.selectedTargetDepartment.replace("_", "/")}]).then((department: any) => {
                    if(department.length !== 0){
                        if(department[0].ROU.Id !== this.state.rou){
                            portfolioId = department[0].ROU.Id;
                        }
                    }
                })
            }
            else if( this.state.selectedDocumentType === "" && this.state.selectedTargetDivision === "CR"){
                await this.idmSrv.GetGroupManagerByDepartments([{"Id": "", "Title": this.state.selectedTargetDepartment.replace("_", "/")}]).then((department: any) => {
                    if(department.length !== 0){
                        if(department[0].ROU.Id !== this.state.rou){
                            portfolioId = department[0].ROU.Id;
                        }
                    }
                })
            }
            let newObj = {
                documentType: this.state.selectedDocumentType,
                sourceDivision: this.state.selectedSourceDivision,
                sourceDepartment: this.state.selectedSourceDepartment,
                targetDivision: this.state.selectedTargetDivision,
                targetDepartment: this.state.selectedTargetDepartment,
                rouId: this.state.rou,
                checkOutUser: this.props.userProfile?.loginName,
                portfolioId: portfolioId
            };
            this.migrationDataSrv.retrieveData(newObj).then((result: any) => {
                if (!_.isUndefined(result)) {
                    if (result === true) {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.MIGRATION.RETRIEVE_SUCCESS
                        );
                        this.props.showDialog(false);
                        this.props.refreshData();
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.MIGRATION.RETRIEVE_FAILED
                        );
                        this.props.showDialog(false);
                    }
                } else {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.WARN,
                        Constants.MIGRATION.RETRIEVE_NO_DATA
                    );
                    this.props.showDialog(false);
                }
            });
        }
        else {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.WARN,
                Constants.MIGRATION.DIFFERENT_DEPARTMENTS
            );
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { showDialog, showToastMessage })(RetrieveData);