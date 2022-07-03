import * as React from 'react';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import { connect } from 'react-redux';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import '../../../core/scss/_customize.scss';
import { Link } from '@fluentui/react/lib/Link';
import Template from '../../../core/libraries/Template';
import { RootState } from '../../../store/configureStore';
import Helper from '../../../core/libraries/Helper';
import RbTag from '../../../bosch-react/components/tag/RbTag';
import { IResponibleDepartment } from '../../../store/upload/types';
import { updateField } from '../../../store/upload/actions';

interface SummaryProps {
    commonReport: any,
    mode: string,
    rouList: IResponibleDepartment[],
    updateField: typeof updateField
}
class Summary extends React.Component<SummaryProps, any>{

    commentRef: React.RefObject<any> = React.createRef();

    constructor(props: SummaryProps) {
        super(props);
        this.renderUploadFile = this.renderUploadFile.bind(this);
        this.renderAuthors = this.renderAuthors.bind(this);
        this.renderDocumentDate = this.renderDocumentDate.bind(this);
        this.renderResponsibleDepartment = this.renderResponsibleDepartment.bind(this);
        this.renderAbstract = this.renderAbstract.bind(this);
        this.renderFeberKeywords = this.renderFeberKeywords.bind(this);
        this.renderURL = this.renderURL.bind(this);
        this.renderDivisionalLLCoordinator = this.renderDivisionalLLCoordinator.bind(this);
        this.renderProcess = this.renderProcess.bind(this);
        this.renderProduct = this.renderProduct.bind(this);
        this.renderPlantBu = this.renderPlantBu.bind(this);
        this.renderIQISNumber = this.renderIQISNumber.bind(this);

        this.renderSecurityClass = this.renderSecurityClass.bind(this);
        this.renderDocumentType = this.renderDocumentType.bind(this);
        this.renderRelaventForeinTradeLegislation = this.renderRelaventForeinTradeLegislation.bind(this);
        this.renderReportNumber = this.renderReportNumber.bind(this);
        this.renderProjectNumber = this.renderProjectNumber.bind(this);
        this.renderAuthorizations = this.renderAuthorizations.bind(this);
        this.renderOrganziationUnit = this.renderOrganziationUnit.bind(this);
        this.renderNameOfConference = this.renderNameOfConference.bind(this);
        this.renderLocationOfConference = this.renderLocationOfConference.bind(this);
        this.renderDateOfConference = this.renderDateOfConference.bind(this);
        this.renderNameOfJournal = this.renderNameOfJournal.bind(this);
        this.renderDateOfPublication = this.renderDateOfPublication.bind(this);
        this.renderAdditionApprovers = this.renderAdditionApprovers.bind(this);
        this.renderNotifications = this.renderNotifications.bind(this);

        this.renderAuthorizationAndOrganiation = this.renderAuthorizationAndOrganiation.bind(this);
        //Render specific box regarding UploadType
        this.renderLL = this.renderLL.bind(this);
        this.renderPaper = this.renderPaper.bind(this);

        this.renderGroupManager = this.renderGroupManager.bind(this);
    }

    componentDidMount() {
        if (!!this.commentRef.current) {
            this.commentRef.current.setValue((!!this.props.commonReport.Comment) ? this.props.commonReport.Comment : "");
        }
    }

    render() {
        let leftelement: any;
        let rightelement: any;
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                rightelement = this.renderRnD();
                break;
            }
            case "LL": {
                leftelement = this.renderLL();
                break;
            }
            case "Paper": {
                rightelement = this.renderPaper();
                break;
            }

        }
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className={"ms-Grid-col ms-sm" + (this.props.commonReport.UploadType === "LL" ? "10" : "5")} >
                        {this.renderUploadFile()}
                        {this.renderTitle()}
                        {this.renderAuthors()}
                        {this.renderDocumentDate()}
                        {this.renderResponsibleDepartment()}
                        {this.renderGroupManager()}
                        {this.props.commonReport.UploadType === "LL" ? null : this.renderAbstract()}
                        {this.renderFeberKeywords()}
                        {leftelement}
                    </div>
                    {
                        this.props.commonReport.UploadType === "LL" ? null : <React.Fragment>
                            <div className="ms-Grid-col ms-sm1"></div>

                            <div className="ms-Grid-col ms-sm5">
                                {this.renderSecurityClass()}
                                {this.props.commonReport.UploadType === "RnD" ? this.renderRelaventForeinTradeLegislation() : null}
                                {this.renderDocumentType()}
                                {rightelement}
                                {this.renderAdditionApprovers()}
                                {this.renderNotifications()}
                                {this.renderAuthorizationAndOrganiation()}
                            </div>
                            <div className="ms-Grid-col ms-sm1"></div>
                        </React.Fragment>
                    }
                </div>
                <div className="ms-Grid-row">
                    {this.props.mode === "admin" ? null : this.renderComment()}
                </div>

            </div>
        );
    }
    //Left col:
    renderUploadFile() {
        if (this.props.commonReport.UploadType !== "Paper") {
            return Template.renderUploadSummaryTemplate("Upload file", <RbLabel>{this.props.commonReport.Attachment.name}</RbLabel>);
        }
        else {
            return this.renderURL();
        }
    }
    renderTitle() {
        return Template.renderUploadSummaryTemplate("Title", <RbLabel isMultipleLines={true} maxLines={10}>{this.props.commonReport.Title}</RbLabel>);
    }
    renderAuthors() {
        let users: string[] = [];
        if (!!this.props.commonReport.ReportAuthor) {
            this.props.commonReport.ReportAuthor.forEach((user: any) => {
                users.push(user.Title);
            });
        }
        else {
            users.push(this.props.commonReport.FeberAuthorDisplayName)
        }
        return Template.renderUploadSummaryTemplate("Authors", users.map(user => <RbTag>{user}</RbTag>));
    }
    renderDocumentDate() {
        return Template.renderUploadSummaryTemplate("Report date", <RbLabel>{Helper.getDateTimeFormatForUI(this.props.commonReport.DocumentDate)} </RbLabel>);
    }
    renderResponsibleDepartment() {
        let rou = this.props.commonReport.ROU.Title;
        // rou = (this.props.mode === "admin") ? this.props.rouList.find(r => r.ROU.Id === this.props.commonReport.ROU.Id).Department.replace("_", "/") : rou;
        if (this.props.mode === "admin") {
            if (this.props.commonReport.Division === "BSH")
            {
                rou = this.props.commonReport.ROU.Title; 
            }
            else
            {
                if (!!this.props.commonReport.ROU.Division) {
                    rou = this.props.rouList.find(r => r.ROU.Id === this.props.commonReport.ROU.ROU.Id).Department.replace("_", "/");
                }
                else {
                    rou = this.props.rouList.find(r => r.ROU.Id === this.props.commonReport.ROU.Id).Department.replace("_", "/");
                }
            }

            // if (!!this.props.commonReport.ROU.Division) {
            //     rou = this.props.rouList.find(r => r.ROU.Id === this.props.commonReport.ROU.ROU.Id).Department.replace("_", "/");
            // }
            // else {
            //     rou = this.props.rouList.find(r => r.ROU.Id === this.props.commonReport.ROU.Id).Department.replace("_", "/");
            // }
        }
        return Template.renderUploadSummaryTemplate("Responsible department",
            <RbLabel isMultipleLines={true} maxLines={10}>{rou}</RbLabel>);
    }

    renderGroupManager() {
        if(this.props.commonReport.Division === "CR" && this.props.commonReport.UploadType === "RnD"){
            let rou = this.props.commonReport.GroupManager.Title;

                return Template.renderUploadSummaryTemplate("Strategic Portfolio Owner",
                <RbLabel isMultipleLines={true} maxLines={10}>{rou}</RbLabel>);
            }
        else {
            return null;
        }
    }


    renderAbstract() {
        return Template.renderUploadSummaryTemplate("Abstract", <RbLabel isMultipleLines={true} maxLines={10}>{this.props.commonReport.Abstract}</RbLabel>);
    }
    renderFeberKeywords() {
        return Template.renderUploadSummaryTemplate("Keywords", <RbLabel isMultipleLines={true} maxLines={10}>{this.props.commonReport.FeberKeywords}</RbLabel>);
    }
    renderURL() {
        return Template.renderUploadSummaryTemplate("Url",
            <Link className="url-link" href={this.props.commonReport.AttachedUrl} target="_blank" >{this.props.commonReport.AttachedUrl}</Link>);
    }
    //For LL
    renderDivisionalLLCoordinator() {
        return Template.renderUploadSummaryTemplate("Divisional lessons learned coordinator",
            <RbLabel>{(!!this.props.commonReport.LLDivisionAdmin) ? this.props.commonReport.LLDivisionAdmin.Title : ""}</RbLabel>);
    }
    renderProcess() {
        return Template.renderUploadSummaryTemplate("Process", <RbLabel>{this.props.commonReport.Process}</RbLabel>);
    }
    renderProduct() {
        return Template.renderUploadSummaryTemplate("Product", <RbLabel>{this.props.commonReport.Product}</RbLabel>);
    }
    renderPlantBu() {
        return Template.renderUploadSummaryTemplate("Plant/BU", <RbLabel>{this.props.commonReport.PlantorBU}</RbLabel>);
    }
    renderIQISNumber() {
        return Template.renderUploadSummaryTemplate("IQIS number", <RbLabel>{this.props.commonReport.IQISNumber}</RbLabel>, "(Optional)");
    }
    renderLL() {
        return (
            <React.Fragment>
                {this.renderDivisionalLLCoordinator()}
                {this.renderProcess()}
                {this.renderProduct()}
                {this.renderPlantBu()}
                {this.renderIQISNumber()}
                {this.renderAdditionApprovers()}
            </React.Fragment>
        );
    }
    //Right col
    renderSecurityClass() {
        return Template.renderUploadSummaryTemplate("Security class", <RbLabel>{this.props.commonReport.SecurityClass} </RbLabel>);
    }
    renderDocumentType() {
        return Template.renderUploadSummaryTemplate("Report type", <RbLabel>{this.props.commonReport.DocumentType}</RbLabel>);
    }
    renderRelaventForeinTradeLegislation() {
        return Template.renderUploadSummaryTemplate("Report contains export controlled material", <RbLabel>{this.props.commonReport.RelForForeignTradeLegislation ? "Yes" : "No"}</RbLabel>);
    }
    renderReportNumber() {
        return Template.renderUploadSummaryTemplate("Report number", <RbLabel>{this.props.commonReport.DocumentNumber}</RbLabel>, "(Optional)");
    }
    renderProjectNumber() {
        return Template.renderUploadSummaryTemplate("Project number", <RbLabel>{this.props.commonReport.ProjectNumber}</RbLabel>, "(Optional)");
    }
    renderRnD() {
        return (
            <React.Fragment>
                {/* {this.renderRelaventForeinTradeLegislation()} */}
                {this.renderReportNumber()}
                {this.renderProjectNumber()}
            </React.Fragment>
        );
    }
    renderNameOfConference() {
        return Template.renderUploadSummaryTemplate("Name of conference", <RbLabel>{this.props.commonReport.NameOfConference}</RbLabel>)
    }
    renderLocationOfConference() {
        return Template.renderUploadSummaryTemplate("Location of conference", <RbLabel>{this.props.commonReport.LocationOfConference}</RbLabel>);
    }
    renderDateOfConference() {
        return Template.renderUploadSummaryTemplate("Date of conference", <RbLabel>{Helper.getDateTimeFormatForUI(this.props.commonReport.DateOfConference)} </RbLabel>);
    }
    renderNameOfJournal() {
        return Template.renderUploadSummaryTemplate("Name of journal", <RbLabel>{this.props.commonReport.NameOfJournal}</RbLabel>);
    }
    renderDateOfPublication() {
        return Template.renderUploadSummaryTemplate("Date of publication", <RbLabel>{Helper.getDateTimeFormatForUI(this.props.commonReport.DateOfPublication)} </RbLabel>);
    }
    renderPaper() {
        if (this.props.commonReport.DocumentType === "Conference Paper") {
            return (
                <React.Fragment>
                    {this.renderNameOfConference()}
                    {this.renderLocationOfConference()}
                    {this.renderDateOfConference()}
                </React.Fragment>
            )
        }
        if (this.props.commonReport.DocumentType === "Journal Paper") {
            return (
                <React.Fragment>
                    {this.renderNameOfJournal()}
                    {this.renderDateOfPublication()}
                </React.Fragment>
            )
        }

    }
    renderAdditionApprovers() {
        let users: string[] = [];
        if (!!this.props.commonReport.AdditionalApprovers) {
            this.props.commonReport.AdditionalApprovers.forEach((user: any) => {
                users.push(user.Title);
            });
        }

        return Template.renderUploadSummaryTemplate("Additional approvers", !!users ? users.map(user => <RbTag>{user}</RbTag>) : null);
    }
    renderNotifications() {
        let users: string[] = [];
        if (!!this.props.commonReport.NotificationUsers) {
            this.props.commonReport.NotificationUsers.forEach((user: any) => {
                users.push(user.Title);
            });
        }

        return Template.renderUploadSummaryTemplate("Notifications",
            !!users ? users.map(user => <RbTag>{user}</RbTag>) : null,
            "(Optional)");
    }
    renderAuthorizations() {
        let users: string[] = [];
        if (!!this.props.commonReport.AuthorizedAssociates) {
            this.props.commonReport.AuthorizedAssociates.forEach((user: any) => {
                users.push(user.Title);
            });
        }
        return Template.renderUploadSummaryTemplate("Authorizations",
            !!users ? users.map(user => <RbTag>{user}</RbTag>) : null,
            "(Optional)");
    }
    renderOrganziationUnit() {
        let users: string[] = [];
        if (!!this.props.commonReport.OrganizationalUnits) {
            this.props.commonReport.OrganizationalUnits.forEach((user: any) => {
                users.push(user.Title);
            });
        }
        if (this.props.commonReport.SecurityClass === "2 Confidential") {
            return Template.renderUploadSummaryTemplate("Organizational unit",
                !!users ? users.map(user => <RbTag>{user}</RbTag>) : null,
                "(Optional)");
        }
    }
    renderAuthorizationAndOrganiation() {
        if (this.props.commonReport.UploadType !== "LL") {
            return (
                <React.Fragment>
                    {this.renderAuthorizations()}
                    {this.renderOrganziationUnit()}

                </React.Fragment>
            )

        }
    }
    renderComment() {
        return (
            <div style={{ paddingTop: "2rem", paddingRight: "7vw" }}>
                <RbLabel isInline={true} style={{ fontWeight: "bold" }}>Comment</RbLabel> <RbLabel isInline={true} size={LabelSize.Small}> (Optional – will only be seen by the approvers) </RbLabel>
                <RbTextField
                    ref={this.commentRef}
                    isMultiple={true}
                    minRows={5}
                    maxRows={8}
                    placeholder="If there is any further information you want to tell the approvers before reviewing your document, you can let them know here."
                    value={this.props.commonReport.Comment}
                    onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("Comment", event.currentTarget.value); }}
                />
            </div>
        );
    }


}
const mapStateToProps = (state: RootState) => ({
    commonReport: state.upload.commonReport,
    mode: state.upload.mode,
    rouList: state.upload.rouLists
});
export default connect(mapStateToProps, { updateField })(Summary);




