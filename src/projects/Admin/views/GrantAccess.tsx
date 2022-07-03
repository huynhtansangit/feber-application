import * as React from 'react';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import Template from '../../../core/libraries/Template';
import SystemService from '../../../services/SystemService';
import DepartmentService from '../../../services/DepartmentService';
import Helper from '../../../core/libraries/Helper';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import AdminWrapper from './AdminWrapper';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';

interface GrantAccessProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage
}

class GrantAccess extends React.Component<GrantAccessProps, any> {

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: GrantAccessProps) {
        super(props);

        this.state = {
            validData: false,
            selectedDocumentType: null,
            documentTypesList: [
                { key: Constants.DOCUMENT_TYPE.RnD, text: Constants.DOCUMENT_TYPE.RnD },
                { key: Constants.DOCUMENT_TYPE.Thesis, text: Constants.DOCUMENT_TYPE.Thesis }
            ],
            selectedDivision: null,
            divisionsList: [],
            selectedDepartment: null,
            departmentsList: [],

            AuthorizedAssociatesRef: React.createRef(),
            AuthorizedOriganizationalUnitsRef: React.createRef()
        };
        this.renderDocumentType = this.renderDocumentType.bind(this);
        this.renderDivision = this.renderDivision.bind(this);
        this.renderDepartmentList = this.renderDepartmentList.bind(this);
        this.renderAuthorizedAssociates = this.renderAuthorizedAssociates.bind(this);
        this.renderAuthorizedOriganizationalUnits = this.renderAuthorizedOriganizationalUnits.bind(this);

        this.getDivisions = this.getDivisions.bind(this);
        this.getDepartmentLists = this.getDepartmentLists.bind(this);

        this.checkValidation = this.checkValidation.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        if (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])
            && !this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])
            && !this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
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
                    divisionsList: list
                });
                // Set default value for RnD Division Admin
                let RnDPermission = this.props.userProfile?.permissions?.checkRnDDivisionAdmin;
                if (RnDPermission?.isAdmin === true) {
                    this.setState({ selectedDivision: (!_.isNil(RnDPermission.divisionCode)) ? RnDPermission.divisionCode : RnDPermission.divisionTitle }, () => {
                        this.getDepartmentLists(["-SC2", "-SC3"]);
                    });
                }
            });
        }
    }

    render() {
        let element: any = "";
        if (this.props.userProfile?.permissions?.checkHasPermission(
            [Constants.PERMISSIONS.SUPER_ADMIN, Constants.PERMISSIONS.THESIS_ADMIN,
            Constants.PERMISSIONS.RND_DIVISION_ADMIN]
        )) {
            this.checkValidation();
            element = (
                <AdminWrapper>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm1" />
                            <div className="ms-Grid-col ms-sm10">

                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <RbLabel className="header-title" size={LabelSize.Large} > Grant Access </RbLabel>
                                    </div>
                                    {this.renderDocumentType()}
                                    {this.renderDivision()}
                                    {this.renderDepartmentList()}
                                    {this.renderAuthorizedAssociates()}
                                    {this.renderAuthorizedOriganizationalUnits()}
                                    <div className="ms-Grid-row">
                                        <p><RbButton label="Update" size={ButtonSize.Small} disabled={this.state.validData === false} onClick={this.update} /></p>
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                    </div>
                </AdminWrapper>
            );
        }
        return element;
    }

    renderDocumentType() {
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            return Template.renderUploadTemplate("Document type", true, "",
                <Dropdown
                    selectedKey={this.state.selectedDocumentType}
                    placeholder="Choose document type ..."
                    options={this.state.documentTypesList}
                    onChange={(event, option) => {
                        if (!_.isUndefined(option)) {
                            this.setState({ selectedDocumentType: option.key }, () => {
                                this.getDivisions();
                            });
                        }
                    }}
                />);
        }
        else {
            let selectedKey = (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) ?
                Constants.DOCUMENT_TYPE.Thesis : Constants.DOCUMENT_TYPE.RnD;
            if (_.isNil(this.state.selectedDocumentType)) {
                this.setState({ selectedDocumentType: selectedKey });
            }
            return Template.renderUploadTemplate("Document type", true, "",
                <Dropdown
                    selectedKey={selectedKey}
                    placeholder="Choose document type ..."
                    options={this.state.documentTypesList}
                    disabled={true}
                    onChange={(event, option) => {
                        if (!_.isUndefined(option)) {
                            this.setState({ selectedDocumentType: option.key }, () => {
                                this.getDivisions();
                            });
                        }
                    }}
                />);
        }
    }

    renderDivision() {
        let RnDPermission = this.props.userProfile?.permissions?.checkRnDDivisionAdmin;
        let selectedKey = (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN, Constants.PERMISSIONS.THESIS_ADMIN])) ?
            this.state.selectedDivision
            : ((!_.isNil(RnDPermission?.divisionCode)) ? RnDPermission?.divisionCode : RnDPermission.divisionTitle);
        return Template.renderUploadTemplate("Division", true, "",
            <Dropdown
                selectedKey={selectedKey}
                placeholder="Choose division ..."
                disabled={RnDPermission?.isAdmin === true
                    || (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN]) && _.isNil(this.state.selectedDocumentType))}
                options={this.state.divisionsList}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.setState({ selectedDivision: option.key }, () => {
                            this.getDepartmentLists(["-SC2", "-SC3"]);
                        });
                    }
                }}
            />);
    }

    renderDepartmentList() {
        return Template.renderUploadTemplate("Department List", true, "",
            <Dropdown
                selectedKey={this.state.selectedDepartment}
                placeholder="Choose department list ..."
                disabled={this.state.departmentsList.length === 0}
                options={this.state.departmentsList}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.setState({ selectedDepartment: option.key });
                    }
                }}
            />);
    }

    renderAuthorizedAssociates() {
        return Template.renderUploadTemplate("Authorized associates", true, "",
            <PeoplePicker onChange={this.checkValidation} ref={this.state.AuthorizedAssociatesRef} principalType="User" />);
    }

    renderAuthorizedOriganizationalUnits() {
        if ((!_.isNil(this.state.selectedDepartment)) ? this.state.selectedDepartment.indexOf("-SC3") === -1 : true) {
            return Template.renderUploadTemplate("Authorized origanizational units", true, "",
                <PeoplePicker onChange={this.checkValidation} ref={this.state.AuthorizedOriganizationalUnitsRef} principalType="SecurityGroup" />);
        }
        else {
            return <span />;
        }
    }

    getDivisions() {
        this.setState({
            selectedDepartment: null,
            departmentsList: [],
        }, () => {
            this.getDepartmentLists(["-SC2", "-SC3"]);
        });
    }

    getDepartmentLists(scArr: any[]) {
        if (!_.isNil(this.state.selectedDocumentType)) {
            this.departmentListsSrv.goToSubsite({rootSite:"",documentType:this.state.selectedDocumentType,division:this.state.selectedDivision});
            this.departmentListsSrv.getListsBySecurityClasses(scArr).then((results: any[]) => {
                let rs: any[] = [];
                results.forEach(list => {
                    rs.push({ key: list.Title, text: list.Title });
                });
                this.setState({
                    selectedDepartment: null,
                    departmentsList: rs
                });
            }).catch(() => {
                this.setState({
                    selectedDepartment: null,
                    departmentsList: []
                });
            });
        }
    }

    checkValidation() {
        if (!_.isNil(this.state.AuthorizedAssociatesRef.current)) {
            let isSC3 = (!_.isNil(this.state.selectedDepartment)) ?
                this.state.selectedDepartment.indexOf("-SC3") > -1
                : false;
            let validate = (
                !_.isNil(this.state.selectedDocumentType)
                && this.state.selectedDivision != null
                && !_.isNil(this.state.selectedDepartment)
                && (
                    this.state.AuthorizedAssociatesRef.current.getSelectedItems().length > 0
                    || ((isSC3 === false) ?
                        ((!_.isNil(this.state.AuthorizedOriganizationalUnitsRef.current)) ?
                            this.state.AuthorizedOriganizationalUnitsRef.current.getSelectedItems().length > 0
                            : false)
                        : false)
                )
            );
            if (this.state.validData !== validate) {
                this.setState({
                    validData: validate
                });
            }
        }
    }

    update() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.GRANT_PERMISSIONS);
        let customACL: any[] = [];
        this.state.AuthorizedAssociatesRef.current.getSelectedItems().forEach((user: any) => {
            customACL.push(user.id);
        });
        if ((!_.isNil(this.state.selectedDepartment)) ? this.state.selectedDepartment.indexOf("-SC3") === -1 : true) {
            this.state.AuthorizedOriganizationalUnitsRef.current.getSelectedItems().forEach((department: any) => {
                customACL.push(department.id);
            });
        }
        let updatedObj = {
            documentType: this.state.selectedDocumentType,
            division: this.state.selectedDivision,
            listName: this.state.selectedDepartment,
            addedCustomACL: customACL,
        };
        let departmentListsSrv = new DepartmentService();
        departmentListsSrv.goToSubsite({rootSite:"",documentType:updatedObj.documentType,division: updatedObj.division});
        departmentListsSrv.updateCustomACL(updatedObj.listName, updatedObj.addedCustomACL).then((result) => {
            if (result === true) {
                this.props.confirmDialog(
                    Constants.CONFIRMATION_MESSAGE.GRANT_ACCESS.TITLE,
                    Constants.CONFIRMATION_MESSAGE.GRANT_ACCESS.CONTENT.replace("{0}", this.state.selectedDepartment),
                    true,
                    () => {
                        window.location.reload();
                    }
                );
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.GRANT_ACCESS.FAILED
                );
            }
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.GRANT_ACCESS.FAILED
            );
            this.props.showDialog(false);
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(GrantAccess);