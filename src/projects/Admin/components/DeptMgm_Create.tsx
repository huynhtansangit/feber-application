import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import Template from '../../../core/libraries/Template';
import Constants from '../../../core/libraries/Constants';
import Helper from '../../../core/libraries/Helper';
import SystemService from '../../../services/SystemService';
import DepartmentService from '../../../services/DepartmentService';
import { showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';

interface DeptMgm_CreateProps {
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage
}

class DeptMgm_Create extends React.Component<DeptMgm_CreateProps, any> {

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: DeptMgm_CreateProps) {
        super(props);

        this.state = {
            divisions: [],

            documenType: null,
            division: null,
            departmentRef: React.createRef(),
            securityClass: Constants.SECURITY_CLASS_LONG_NAME.SC1,

            isValidForm: false
        };

        this.renderDocumentType = this.renderDocumentType.bind(this);
        this.renderDivision = this.renderDivision.bind(this);
        this.renderDepartment = this.renderDepartment.bind(this);
        this.renderSecurityClass = this.renderSecurityClass.bind(this);

        this.checkFormValidation = this.checkFormValidation.bind(this);
        this.createDepartmentList = this.createDepartmentList.bind(this);
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
            this.setState({
                divisions: rs
            });
        });
    }

    render() {
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <br />
                    {this.renderDocumentType()}
                    {this.renderDivision()}
                    {this.renderDepartment()}
                    {this.renderSecurityClass()}
                </div>
                <div className="ms-Grid-row">
                    <br />
                    <RbButton label="Create" size={ButtonSize.Small} disabled={this.state.isValidForm === false} onClick={this.createDepartmentList} />
                </div>
            </div>
        );
        return element;
    }

    renderDocumentType() {
        return Template.renderCommonTemplate("Document type",
            <Dropdown
                selectedKey={this.state.documenType}
                placeholder="Choose document type ..."
                options={Constants.DD_DOCUMENT_TYPES}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.checkFormValidation({
                            documenType: option.key,
                            securityClass: Constants.SECURITY_CLASS_LONG_NAME.SC1
                        });
                    }
                }}
            />, false, 4, 8, 8);
    }

    renderDivision() {
        return Template.renderCommonTemplate("Division",
            <Dropdown
                selectedKey={this.state.division}
                placeholder="Choose division ..."
                options={this.state.divisions}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.checkFormValidation({ division: option.key });
                    }
                }}
            />, false, 4, 8, 8);
    }

    renderDepartment() {
        return Template.renderCommonTemplate("Department",
            <PeoplePicker
                ref={this.state.departmentRef}
                principalType="SecurityGroup"
                itemLimit={1}
                onChange={() => {
                    this.checkFormValidation({});
                }}
            />, false, 4, 8, 8);
    }

    renderSecurityClass() {
        let options = Helper.getSCOptionsByDocumentType(this.state.documenType);
        return Template.renderCommonTemplate("Security class",
            <Dropdown
                selectedKey={this.state.securityClass}
                placeholder="Choose security class ..."
                options={options}
                onChange={(event, option) => {
                    if (!_.isUndefined(option)) {
                        this.checkFormValidation({ securityClass: option.key });
                    }
                }}
                disabled={this.state.documenType === Constants.DOCUMENT_TYPE.LL
                    || this.state.documenType === Constants.DOCUMENT_TYPE.Paper}
            />, false, 4, 8, 8);
    }

    checkFormValidation(dataToUpdate: any) {
        let validate = (
            !_.isNil(this.state.documenType)
            && !_.isNil(this.state.division)
            && ((!_.isNil(this.state.departmentRef.current)) ?
                this.state.departmentRef.current.getSelectedItems().length > 0
                : false)
        );
        dataToUpdate.isValidForm = validate;
        this.setState(dataToUpdate);
    }

    createDepartmentList() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.CREATE_DEPARTMENT_LIST);
        let departmentName = this.state.departmentRef.current.getSelectedItems()[0].displayName;
        let listName = Helper.getListName(
            this.state.documenType,
            this.state.securityClass,
            departmentName);
        this.departmentListsSrv.goToSubsite({rootSite:"",documentType:this.state.documenType,division: this.state.division});
        // Check whether the department list is existing
        this.departmentListsSrv.checkExistingDepartmentList(listName).then((checkResult: boolean) => {
            if (checkResult === false) {
                // If not created, create new department list
                this.departmentListsSrv.createDepartmentLists([{
                    UploadType: this.state.documenType,
                    Division: this.state.division,
                    DepartmentLists: [listName]
                }]).then(() => {
                    // Success
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.CREATE_DEPARTMENT_MESSAGE.SUCCESS.replace("{0}", listName)
                    );
                    this.props.showDialog(false);
                }).catch(() => {
                    // Failed
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.CREATE_DEPARTMENT_MESSAGE.FAILED.replace("{0}", listName)
                    );
                    this.props.showDialog(false);
                });
            }
            else {
                // The list has already existing
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.WARN,
                    Constants.CREATE_DEPARTMENT_MESSAGE.EXISTED.replace("{0}", listName)
                );
                this.props.showDialog(false);
            }
        }).catch(() => {
            // Cannot check existing list
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.CREATE_DEPARTMENT_MESSAGE.EXISTED_FAILED
            );
            this.props.showDialog(false);
        });
    }

}

export default connect(null, { showDialog, showToastMessage })(DeptMgm_Create);