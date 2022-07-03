import * as React from 'react';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import { Link } from '@fluentui/react/lib/Link';
import { connect } from 'react-redux';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import '../../../core/scss/_customize.scss';
import Template from '../../../core/libraries/Template';
import Constants from '../../../core/libraries/Constants';
import { RootState } from '../../../store/configureStore';
import { updateField, updateStep } from '../../../store/upload/actions';
import RbRadio from '../../../bosch-react/components/radio/RbRadio';
import { IResponibleDepartment } from '../../../store/upload/types';
import { getROUListByPeoplePickerValues } from '../../../store/upload/thunks';
import { IUserProfile } from '../../../store/permission/types';
import { showDialog, confirmDialog } from '../../../store/util/actions';

interface AccessibilityProps {
    commonReport: any,
    updateField: typeof updateField,
    updateStep: typeof updateStep,
    validation: any,
    rouList: IResponibleDepartment[],
    getROUListByPeoplePickerValues: any,
    userProfile: IUserProfile,
    showDialog: typeof showDialog,
    confirmDialog: typeof confirmDialog
}

class Accessibility extends React.Component<AccessibilityProps, any>{
    authorizedAssiciatesRef: React.RefObject<any> = React.createRef();
    authorizedOrganizationalUnitRef: React.RefObject<any> = React.createRef();

    constructor(props: AccessibilityProps) {
        super(props);

        this.renderRelavantForRelForForeignTradeLegislation = this.renderRelavantForRelForForeignTradeLegislation.bind(this);
        this.renderSecurityClass = this.renderSecurityClass.bind(this);
        this.renderAdditionalText = this.renderAdditionalText.bind(this);
        this.renderAuthorizedAssociates = this.renderAuthorizedAssociates.bind(this);
        this.renderAuthorizedOrganizationalUnit = this.renderAuthorizedOrganizationalUnit.bind(this);
        this.renderLocalExportControlOfficerText = this.renderLocalExportControlOfficerText.bind(this);
        this.renderFurtherInformationForCR = this.renderFurtherInformationForCR.bind(this);

        //Render specific box regarding UploadType
        this.renderAdditionalBoxes = this.renderAdditionalBoxes.bind(this);
        this.renderPaper = this.renderPaper.bind(this);
        this.renderThesis = this.renderThesis.bind(this);
        this.renderRnD = this.renderRnD.bind(this);
    }
    componentDidMount() {
        if (this.props.commonReport.UploadType === "RnD") {
            this.props.showDialog(Constants.DIALOG_MESSAGE.LOAD_ROU);
            this.props.getROUListByPeoplePickerValues(this.props.commonReport.ReportAuthor, this.props.userProfile, (lists: IResponibleDepartment[]) => {
                if (lists.length > 0) {
                        this.props.showDialog(false);
                }
                else {
                    this.alertNoResponsibleDepartment();;
                }
            })   
        }
    }

    render() {
        let element: any;
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                element = this.renderRnD();
                break;
            }
            case "Thesis": {
                element = this.renderThesis();
                break;
            }
            case "Paper": {
                element = this.renderPaper();
                break;
            }
        }
        return (
            <React.Fragment>
                {element}
            </React.Fragment>
        );

    }
    renderRelavantForRelForForeignTradeLegislation() {
        return Template.renderUploadRowTemplate("Report contains export controlled material",
            <RbRadio defaultValue={this.props.commonReport.RelForForeignTradeLegislation} itemWidth={10} isHorizontal={true} items={[
                { value: true, label: "Yes" },
                { value: false, label: "No" }
            ]}

                onChange={(selectedValue) => {
                    this.props.updateField("RelForForeignTradeLegislation", selectedValue);
                }}

            />
            , Constants.UPLOAD_INFO_MESSAGE.RELEVANT_FOREIGN_TRADE, null, true, null, false);
    }
    renderSecurityClass() {
        let securityClassOptions: any[] = [];
        let disabledDropdown = false;
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                if (this.props.commonReport.RelForForeignTradeLegislation === true) { //click yes then auto select class 3
                    securityClassOptions = Constants.DD_SECURITY_CLASSES_ONLY_2_AND_3;
                }
                else {
                    securityClassOptions = Constants.DD_SECURITY_CLASSES;
                }
                break;
            }
            case "Thesis": {
                securityClassOptions = Constants.DD_SECURITY_CLASSES_ONLY_2;
                break;
            }
            case "Paper": {
                securityClassOptions = Constants.DD_SECURITY_CLASSES_ONLY_1;
                disabledDropdown = true;
                break;
            }
        }

        return Template.renderUploadRowTemplate("Security class", <Dropdown options={securityClassOptions} selectedKey={this.props.commonReport.SecurityClass}
            onChange={(e, selectedOption) => {
                this.props.updateField("SecurityClass", selectedOption.key);
            }} disabled={disabledDropdown} />,
            Constants.UPLOAD_INFO_MESSAGE.SECURITY_CLASS, null, true, this.props.validation.SecurityClass);
    }
    renderAuthorizedAssociates() {
        return Template.renderUploadRowTemplate("Authorized associates",
            <PeoplePicker principalType="User"
                defaultValue={!!this.props.commonReport.AuthorizedAssociates ? this.props.commonReport.AuthorizedAssociates : []}
                componentRef={this.authorizedAssiciatesRef} onChange={() => {
                    let items = this.authorizedAssiciatesRef.current.getSelectedItems();
                    let results: any[] = [];
                    items.forEach((item: any) => {
                        if (!!item.displayName) {
                            results.push({
                                Id: item.id,
                                Title: item.displayName
                            });
                        }
                    });
                    this.props.updateField("AuthorizedAssociates", results);
                }
                }
            />,
            Constants.UPLOAD_INFO_MESSAGE.AUTHORIZED_ASSO, "(Optional)");
    }
    renderAuthorizedOrganizationalUnit() {
        return Template.renderUploadRowTemplate("Authorized organizational unit",
            <PeoplePicker principalType="SecurityGroup"
                defaultValue={!!this.props.commonReport.OrganizationalUnits ? this.props.commonReport.OrganizationalUnits : []}
                componentRef={this.authorizedOrganizationalUnitRef} onChange={() => {
                    let items = this.authorizedOrganizationalUnitRef.current.getSelectedItems();
                    let results: any[] = [];
                    items.forEach((item: any) => {
                        if (!!item.displayName) {
                            results.push({
                                Id: item.id,
                                Title: item.displayName
                            });
                        }
                    });
                    this.props.updateField("OrganizationalUnits", results);
                }
                }
            />,
            Constants.UPLOAD_INFO_MESSAGE.AUTHORIZED_ORGA, "(Optional) - includes all units in hierarchy below");

    }
    renderAdditionalText() {
        return (<div>
            <br></br>
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <RbLabel isInline={true} size={LabelSize.Large} style={{ fontWeight: "bold" }}>For Security class 2 and 3</RbLabel>

                </div>

            </div>
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <RbLabel style={{ paddingTop: "1rem"}}>Not all FEBER users will have access to this document. You can set Authorizations here</RbLabel>
                </div>
            </div>
            {
                this.props.commonReport.UploadType == "RnD" && this.props.commonReport.RelForForeignTradeLegislation == true ? 
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <Link className="url-link-ec" href="https://sites.inside-share.bosch.com/sites/048890/_layouts/15/WopiFrame.aspx?sourcedoc=/sites/048890/Documents/Export%20Control/ECO_List.xlsx&action=default" target="_blank">
                            Reports may only be accessed by persons or groups who meet requirements of EC classification. Contact your local ECO if you are unsure of requirements
                        </Link>
                    </div>
                </div> :
                null
            }
            <br></br>
        </div>
        );
    }
    renderAdditionalBoxes() { //depends on security class option 2 or 3
        let element: any;
        switch (this.props.commonReport.SecurityClass) {
            case "2 Confidential": {
                element = <React.Fragment>
                    {this.renderAdditionalText()}
                    {this.renderAuthorizedAssociates()}
                    {this.renderAuthorizedOrganizationalUnit()}
                </React.Fragment>;
                break;
            }
            case "3 Strictly Confidential": {
                element = <React.Fragment>
                    {this.renderAdditionalText()}
                    {this.renderAuthorizedAssociates()}
                </React.Fragment>;
                break;
            }
            default: {
                element = null;
                break;
            }
        }
        return element;

    }
    renderLocalExportControlOfficerText() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12" style={{ marginTop: "1rem" }}>
                        <RbLabel>
                            If it is unclear whether the content is under export control or not, please contact your local Export Control Officer (
                            <Link className="url-link-ec" href="https://sites.inside-share.bosch.com/sites/048890/_layouts/15/WopiFrame2.aspx?sourcedoc=/sites/048890/Documents/Export%20Control/ECO_List.xlsx&action=default​" target="_blank" style={{ textDecoration: "underline" }}>
                                Link
                            </Link>
                            )
                        ​</RbLabel>
                    </div>
                </div>
            </div>
        )
    }
    renderFurtherInformationForCR() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12">
                        <RbLabel>
                            Further informations for CR employees on export controls in CR Compass (
                            <Link className="url-link-ec" href="https://inside-docupedia.bosch.com/confluence/display/CRC/Exportkontrolle" target="_blank" style={{ textDecoration: "underline" }}>
                                Link
                            </Link>)​
                        </RbLabel>
                    </div>
                </div>
            </div>
        )
    }
    renderPaper() {
        return (
            <React.Fragment>
                {this.renderSecurityClass()}
            </React.Fragment>
        );
    }
    renderThesis() {
        return (
            <React.Fragment>
                {this.renderSecurityClass()}
                {this.renderAdditionalBoxes()}
            </React.Fragment>
        );
    }
    renderRnD() {
        this.props.commonReport.GroupManager = {Id: "", Title: ""};
        return (
            <React.Fragment>
                {this.renderRelavantForRelForForeignTradeLegislation()}
                {this.renderLocalExportControlOfficerText()}
                {(this.props.rouList.filter(r => r.Division === "CR")).length > 0 ? this.renderFurtherInformationForCR() : null}
                {this.renderSecurityClass()}
                {this.renderAdditionalBoxes()}
            </React.Fragment>
        );
    }
    alertNoResponsibleDepartment() {
        this.props.showDialog(false);
        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.NO_ROU.TITLE,
            Constants.CONFIRMATION_MESSAGE.NO_ROU.CONTENT
            , true, () => { });
    }
}
const mapStateToProps = (state: RootState) => ({
    commonReport: state.upload.commonReport,
    validation: state.upload.validation,
    rouList: state.upload.rouLists,
    userProfile: state.permission.userProfile
});
export default connect(mapStateToProps, { 
    updateField, 
    updateStep,
    getROUListByPeoplePickerValues,
    showDialog,
    confirmDialog
})(Accessibility);




