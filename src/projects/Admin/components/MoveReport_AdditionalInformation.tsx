import * as React from 'react';
import Color from '../../../core/libraries/Color';
import Template from '../../../core/libraries/Template';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import Constants from '../../../core/libraries/Constants';
import Environment from '../../../Environment';
import { confirmDialog } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import RbRadio from '../../../bosch-react/components/radio/RbRadio';
import { RefObject } from '@fluentui/react';

interface MoveReport_AdditionalInformationProps {
    confirmDialog: typeof confirmDialog,
    moveItem: any,
    reportTypes: any[]
    toUploadType: string,
}

class MoveReport_AdditionalInformation extends React.Component<MoveReport_AdditionalInformationProps, any> {

    rFTLRef: React.RefObject<any> = React.createRef();

    constructor(props: MoveReport_AdditionalInformationProps) {
        super(props);

        this.state = {
            // RnD
            abstract: "",
            reportType: null,
            rFTL: false,
            securityClass: "",
            reportNumber: "",
            projectNumber: "",
            // LL
            product: "",
            process: "",
            plantBU: "",
            iqisNumber: "",
            validationMessage: {},
            customACLRef: React.createRef(),
        };
        // RnD Properties
        this.renderAbstract = this.renderAbstract.bind(this);
        this.renderReportType = this.renderReportType.bind(this);
        this.renderRFTL = this.renderRFTL.bind(this);
        this.renderSecurityClass = this.renderSecurityClass.bind(this);
        this.renderReportNumber = this.renderReportNumber.bind(this);
        this.renderProjectNumber = this.renderProjectNumber.bind(this);
        this.renderCustomACL = this.renderCustomACL.bind(this);
        // LL Properties
        this.renderProduct = this.renderProduct.bind(this);
        this.renderProcess = this.renderProcess.bind(this);
        this.renderPlantBU = this.renderPlantBU.bind(this);
        this.renderIQISNumber = this.renderIQISNumber.bind(this);
    }

    render() {
        let element: any = "";
        if ((this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.LL) ? // If from and to upload type are LL, hide additional iformation
            false : this.props.toUploadType !== "") { // Else the upload type must not be empty to be shown
            element = (
                <div className="ms-Grid">

                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12">
                            <RbLabel style={{ color: Color.BLUE }}><h4 style={{ marginBottom: "0px" }}>Additional Information</h4></RbLabel>
                        </div>
                    </div>
                    {/* RnD Properties */}
                    {this.renderAbstract()}
                    {this.renderReportType()}
                    {this.renderRFTL()}
                    {this.renderSecurityClass()}
                    {this.renderReportNumber()}
                    {this.renderProjectNumber()}
                    {this.renderCustomACL()}
                    {/* LL Properties */}
                    {this.renderProduct()}
                    {this.renderProcess()}
                    {this.renderPlantBU()}
                    {this.renderIQISNumber()}
                </div>
            );
        }
        else {
            element = "";
        }
        return element;
    }

    renderAbstract() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Abstract",
                        <React.Fragment>
                            <RbTextField
                                isMultiple={true} minRows={5} maxRows={8}
                                value={this.state.abstract} onChange={(event) => {
                                    this.setState({ abstract: event.currentTarget.value });
                                }}
                            />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.abstract}
                            </RbLabel>
                        </React.Fragment>, false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderReportType() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Report type",
                        <React.Fragment>
                            <Dropdown
                                selectedKey={this.state.reportType}
                                placeholder="Choose report type ..."
                                options={this.props.reportTypes}
                                onChange={(event, option) => {
                                    if (!_.isUndefined(option)) {
                                        this.setState({ reportType: option.key });
                                    }
                                }}
                            />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.reportType}
                            </RbLabel>
                        </React.Fragment>, false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderRFTL() {
        if (this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Report contains export controlled material",
                        <RbRadio ref={this.rFTLRef} defaultValue={this.state.rFTL} itemWidth={5} isHorizontal={true} items={[
                            { value: true, label: "Yes" },
                            { value: false, label: "No" }
                        ]}
                            onChange={(selectedValue) => {
                                if (!!selectedValue && this.props.moveItem.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC3) {
                                    this.props.confirmDialog(
                                        Constants.CONFIRMATION_MESSAGE.CAUTION,
                                        Constants.CONFIRMATION_MESSAGE.MOVE_SC3
                                            .replace("{0}", this.props.moveItem.Title)
                                            .replace("{1}", this.props.moveItem.SecurityClass)
                                            .replace("{2}", Constants.SECURITY_CLASS_LONG_NAME.SC3),
                                        false,
                                        () => {
                                            window.location.href = Environment.phaPageUrl + "AccessMediator.aspx?Guid=" + this.props.moveItem.GUID1 + "&Mode=Move";
                                        },
                                        () => {
                                            this.rFTLRef.current.setState({ selectedValue: false });
                                            this.setState({ rFTL: false });
                                        }
                                    );
                                }
                                else {
                                    this.setState({
                                        rFTL: !!selectedValue,
                                        securityClass: (!!selectedValue) ? Constants.SECURITY_CLASS_LONG_NAME.SC3 : this.state.securityClass
                                    });
                                }
                            }}
                        />, false, 7, 5, 12)}
                </div>
            );
        }
        return "";
    }

    renderSecurityClass() {
        if (this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Security class",
                        <React.Fragment>
                            <Dropdown
                                selectedKey={this.state.securityClass}
                                placeholder="Choose security class ..."
                                options={Constants.DD_SECURITY_CLASSES_ALL}
                                onChange={(event, option) => {
                                    if (!_.isUndefined(option)) {
                                        if ((option.key === Constants.SECURITY_CLASS_LONG_NAME.SC3 || this.props.moveItem.SecurityClass === Constants.SECURITY_CLASS_LONG_NAME.SC3)
                                            && this.props.moveItem.SecurityClass !== option.key && option.key !== "") {
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
                                        }
                                        else {
                                            this.setState({
                                                securityClass: option.key,
                                                rFTL: (this.state.rFTL === true && option.key !== Constants.SECURITY_CLASS_LONG_NAME.SC3) ?
                                                    false : this.state.rFTL
                                            });
                                        }
                                    }
                                }}
                            />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.securityClass}
                            </RbLabel>
                        </React.Fragment>, false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderReportNumber() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Report number",
                        <React.Fragment>
                            <RbTextField value={this.state.reportNumber} onChange={(event) => {
                                this.setState({ reportNumber: event.currentTarget.value });
                            }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.reportNumber}
                            </RbLabel>
                        </React.Fragment>, true, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderProjectNumber() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Project number",
                        <React.Fragment>
                            <RbTextField value={this.state.projectNumber} onChange={(event) => {
                                this.setState({ projectNumber: event.currentTarget.value });
                            }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.projectNumber}
                            </RbLabel>
                        </React.Fragment>, true, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderCustomACL() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.LL && this.props.toUploadType === Constants.DOCUMENT_TYPE.RnD
            && this.state.securityClass !== "" && this.state.securityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Custom ACL",
                        <PeoplePicker principalType="All" ref={this.state.customACLRef} />
                        , false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderProduct() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD && this.props.toUploadType === Constants.DOCUMENT_TYPE.LL) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Product",
                        <React.Fragment>
                            <RbTextField disabled={this.state.process.trim() !== ""}
                                value={this.state.product} onChange={(event) => {
                                    this.setState({ product: event.currentTarget.value });
                                }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.product}
                            </RbLabel>
                        </React.Fragment>
                        , false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderProcess() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD && this.props.toUploadType === Constants.DOCUMENT_TYPE.LL) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Process",
                        <React.Fragment>
                            <RbTextField
                                disabled={this.state.product.trim() !== ""}
                                value={this.state.process} onChange={(event) => {
                                    this.setState({ process: event.currentTarget.value });
                                }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.process}
                            </RbLabel>
                        </React.Fragment>
                        , false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderPlantBU() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD && this.props.toUploadType === Constants.DOCUMENT_TYPE.LL) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "Plant/Business unit",
                        <React.Fragment>
                            <RbTextField value={this.state.plantBU} onChange={(event) => {
                                this.setState({ plantBU: event.currentTarget.value });
                            }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.plantBU}
                            </RbLabel>
                        </React.Fragment>
                        , false, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

    renderIQISNumber() {
        if (this.props.moveItem.UploadType === Constants.DOCUMENT_TYPE.RnD && this.props.toUploadType === Constants.DOCUMENT_TYPE.LL) {
            return (
                <div className="ms-Grid-row">
                    {Template.renderCommonTemplate(
                        "IQIS number",
                        <React.Fragment>
                            <RbTextField value={this.state.iqisNumber} onChange={(event) => {
                                this.setState({ iqisNumber: event.currentTarget.value });
                            }} />
                            <RbLabel className="error-txt" size={LabelSize.Small}>
                                {this.state.validationMessage.iqisNumber}
                            </RbLabel>
                        </React.Fragment>
                        , true, 4, 8, 12)}
                </div>
            );
        }
        return "";
    }

}

export default connect(null, { confirmDialog }, null, { forwardRef: true })(MoveReport_AdditionalInformation);