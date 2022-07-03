import * as React from 'react';
import Helper from '../../../core/libraries/Helper';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { IUserProfile } from '../../../store/permission/types';
import Color from '../../../core/libraries/Color';
import Template from '../../../core/libraries/Template';
import _ from 'lodash';
import { init, updateProperty, validateData } from '../../../store/access-mediator/actions';
import { getData, getReportTypes } from '../../../store/access-mediator/thunks';
import { showDialog, showToastMessage, confirmDialog } from '../../../store/util/actions';
import Constants from '../../../core/libraries/Constants';
import AccessMediatorService from '../../../services/AccessMediatorService';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize, ButtonType } from '../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import Environment from '../../../Environment';

interface OrderProps {
    userProfile: IUserProfile,
    report: any,
    error: string,
    validation: any,
    init: typeof init,
    getData: any,
    getReportTypes: any,
    updateProperty: typeof updateProperty,
    validateData: typeof validateData,
    showDialog: typeof showDialog,
    confirmDialog: typeof confirmDialog,
    showToastMessage: typeof showToastMessage
}

class Order extends React.Component<OrderProps, any> {

    constructor(props: OrderProps) {
        super(props);
        this.state = {
            guid: "",
            orderInfo: null
        };
        this.renderTitle = this.renderTitle.bind(this);
        this.renderAuthors = this.renderAuthors.bind(this);
        this.renderDepartment = this.renderDepartment.bind(this);
        this.renderApprover = this.renderApprover.bind(this);
        this.renderPortfolioApprover = this.renderPortfolioApprover.bind(this);
        this.renderReportDate = this.renderReportDate.bind(this);
        this.renderKeywords = this.renderKeywords.bind(this);
        this.renderRelaventForeinTradeLegislation = this.renderRelaventForeinTradeLegislation.bind(this);
        this.renderAbstract = this.renderAbstract.bind(this);
        this.renderReportType = this.renderReportType.bind(this);
        this.renderReason = this.renderReason.bind(this);
        this.renderButtons = this.renderButtons.bind(this);
        this.renderError = this.renderError.bind(this);

        this.orderReport = this.orderReport.bind(this);
        this.cancelChanges = this.cancelChanges.bind(this);
    }

    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <RbLabel style={{ color: Color.BLUE }}><h2 style={{ margin: "0px" }}>Order Report</h2></RbLabel>
                </div>
                {(!_.isNil(this.props.report)) ? <div className="ms-Grid-row">
                    {this.renderTitle()}
                    {this.renderAuthors()}
                    {this.renderDepartment()}
                    {this.renderApprover()}
                    {this.renderPortfolioApprover()}
                    {this.renderReportDate()}
                    {this.renderKeywords()}
                    {this.props.report.UploadType === "RnD" ? this.renderRelaventForeinTradeLegislation() : null}
                    {this.renderAbstract()}
                    {this.renderReportType()}
                    {this.renderReason()}
                    {this.renderButtons()}

                    {this.renderError()}
                </div> : ""}
            </div>
        );
    }

    renderTitle() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Title</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {/* <TextareaAutosize style={{ overflowX: "hidden" }} minRows={1} maxRows={8} defaultValue={this.props.report.Title} disabled={true} /> */}
                            <RbLabel isMultipleLines={true} maxLines={8}>{this.props.report.Title}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderAuthors() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Author(s)</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        {Template.renderReadOnlyPeoplePickerTags(Helper.mergeAuthors(Helper.getPeoplePickerStringByObjectArray(this.props.report.ReportAuthor), this.props.report.FeberAuthorDisplayName))}
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderDepartment() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Department</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {/* <TextareaAutosize style={{ overflowX: "hidden" }} minRows={1} maxRows={8} defaultValue={this.props.report.FeberDepartment} disabled={true} /> */}
                            <RbLabel maxLines={8}>{this.props.report.FeberDepartment}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderApprover() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Approver</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {Template.renderReadOnlyPeoplePickerTags(Helper.getPeoplePickerStringByObjectArray([this.props.report.ROU]))}
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderPortfolioApprover() {
        if(this.props.report.UploadType === "RnD" && this.props.report.Division === "CR")
        {
            return (
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Strategic Portfolio Owner</RbLabel></div>
                        <div className="ms-Grid-col ms-sm6">
                            <span className="textarea-transparent">
                                {Template.renderReadOnlyPeoplePickerTags(Helper.getPeoplePickerStringByObjectArray([this.props.report.GroupManager]))}
                            </span>
                        </div>
                        <div className="ms-Grid-col ms-sm3"></div>
                    </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    renderReportDate() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Report date</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6"><RbLabel>{Helper.getDateTimeFormatForUI(this.props.report.DocumentDate)}</RbLabel></div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderKeywords() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Keywords</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {/* <TextareaAutosize style={{ overflowX: "hidden" }} minRows={1} maxRows={8} defaultValue={this.props.report.FeberKeywords} disabled={true} /> */}
                            <RbLabel isMultipleLines={true} maxLines={8}>{this.props.report.FeberKeywords}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderRelaventForeinTradeLegislation() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Report contains export controlled material</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            <RbLabel isMultipleLines={true} maxLines={8}>{this.props.report.RelForForeignTradeLegislation ? "Yes" : "No"}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderAbstract() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Abstract</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {/* <TextareaAutosize style={{ overflowX: "hidden" }} minRows={1} maxRows={8} defaultValue={this.props.report.Abstract} disabled={true} /> */}
                            <RbLabel isMultipleLines={true} maxLines={8}>{this.props.report.Abstract}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderReportType() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Report type</RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        <span className="textarea-transparent">
                            {/* <TextareaAutosize style={{ overflowX: "hidden" }} minRows={1} maxRows={8} defaultValue={this.props.report.DocumentType} disabled={true} /> */}
                            <RbLabel>{this.props.report.DocumentType}</RbLabel>
                        </span>
                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderReason() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel style={{ fontSize: "16px" }}>Tell the Approver why you need this report? <span style={{ color: "red" }}>*</span></RbLabel></div>
                    <div className="ms-Grid-col ms-sm6">
                        {/* <TextField multiline rows={4} defaultValue={this.props.report.Comment} onChange={(event, newValue) => { this.props.updateProperty("Comment", newValue); }}
                            errorMessage={Helper.setEmptyIfNull(this.props.validation.Comment)} /> */}

                        <RbTextField value={this.props.report.Comment} minRows={4} onChange={(event: React.ChangeEvent<any>) => { this.props.updateProperty("Comment", event.currentTarget.value); }} />
                        {!!this.props.validation.Comment ? <RbLabel className="error-txt" size={LabelSize.Small} isInline={false}> {Helper.setEmptyIfNull(this.props.validation.Comment)} </RbLabel> : null}

                    </div>
                    <div className="ms-Grid-col ms-sm3"></div>
                </div>
            </div>
        );
    }

    renderButtons() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    {/* <div className="ms-Grid-col ms-sm3">
                        <br />
                        <RbButton label="Request" size={ButtonSize.Small} onClick={this.orderReport} disabled={this.props.error !== ""} />
                    </div>
                    <div className="ms-Grid-col ms-sm5">
                        <br />
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} label="Cancel" onClick={this.cancelChanges} />
                    </div> */}
                    <RbButton label="Request" size={ButtonSize.Small} onClick={this.orderReport} disabled={this.props.error !== ""} />
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} label="Cancel" onClick={this.cancelChanges} />
                </div>
            </div>
        );
    }

    renderError() {
        return (this.props.error) ? (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    <RbLabel style={{ color: Color.RED }} size={LabelSize.Small}>{this.props.error}</RbLabel>
                </div>
            </div>
        ) : null;
    }

    orderReport() {
        this.props.validateData(() => {
            this.props.showDialog("Creating order");
            let amSrv = new AccessMediatorService();
            amSrv.orderReport(this.props.userProfile.userToken, this.props.report).then((rs) => {
                this.props.showDialog(false);
                this.props.confirmDialog(Constants.REPORT_MESSAGE.ORDER.TITLE,
                    ((rs === true) ? Constants.REPORT_MESSAGE.ORDER.SUCCESS : Constants.REPORT_MESSAGE.ORDER.FAILED).replace("{0}", this.props.report.Title)
                    , true, () => {
                        window.close();
                        this.cancelChanges();
                    });
            });
        });
    }

    cancelChanges() {
        // Close the dialog
        window.close();
        // Else, refresh the order
        window.location.href = Environment.spaRootPageUrl + "index.aspx#" + "/MyPendingOrders";
        // let guid: string = this.props.report.Guid;
        // this.props.init();
        // Helper.runNewTask(() => {
        //     this.props.getData(this.props.userProfile.userToken, guid, (result: any) => {
        //         this.props.getReportTypes(result.UploadType);
        //     });
        // });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    report: state.accessMediator.data,
    error: state.accessMediator.error,
    validation: state.accessMediator.validation
});

export default connect(mapStateToProps, {
    init,
    getData,
    getReportTypes,
    updateProperty,
    validateData,
    showDialog,
    confirmDialog,
    showToastMessage
})(Order);