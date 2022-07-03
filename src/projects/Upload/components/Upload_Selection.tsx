import * as React from 'react';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import '../../../bosch-react/icon.scss';
import { connect } from 'react-redux';
import FilePicker from '../../../core/components/FilePicker';
import { Link } from '@fluentui/react/lib/Link';
import Template from '../../../core/libraries/Template';
import { RootState } from '../../../store/configureStore';
import { updateField, initSteps } from '../../../store/upload/actions';
import RbRadio, { IRbRadioItem } from '../../../bosch-react/components/radio/RbRadio';
import { IUserProfile } from '../../../store/permission/types';
import Constants from '../../../core/libraries/Constants';

interface Upload_SelectionProps {
    commonReport: any,
    mode: string,
    validation: any,
    updateField: typeof updateField,
    initSteps: typeof initSteps,
    userProfile: IUserProfile | undefined
}

class Upload_Selection extends React.Component<Upload_SelectionProps, any>{
    constructor(props: Upload_SelectionProps) {
        super(props);
        this.state = {
            isHover: false,
            currentIcon: "",
        };
        //Four info box:
        this.renderInfoForRD = this.renderInfoForRD.bind(this);
        this.renderInfoForLL = this.renderInfoForLL.bind(this);
        this.renderInfoForThesis = this.renderInfoForThesis.bind(this);
        this.renderInfoForPaper = this.renderInfoForPaper.bind(this);
        this.renderChoiceGroup = this.renderChoiceGroup.bind(this);
        this.renderUploadSection = this.renderUploadSection.bind(this);
        this.renderUrlSection = this.renderUrlSection.bind(this);
    }
    render() {
        let uploadSection = null;
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                this.props.commonReport.checkBoxChecked = false;
                this.props.commonReport.FeberAuthorDisplayName = '';
                this.props.commonReport.SecurityClass = "1 Internal";
                this.props.commonReport.AuthorizedAssociates = [];
                this.props.commonReport.OrganizationalUnits = [];
                //break;
            }
            case "LL": {
                this.props.commonReport.checkBoxChecked = false;
                this.props.commonReport.FeberAuthorDisplayName = '';
                this.props.commonReport.SecurityClass = "1 Internal";
                this.props.commonReport.AuthorizedAssociates = [];
                this.props.commonReport.OrganizationalUnits = [];
                //break;
            }
            case "Thesis": {
                this.props.commonReport.SecurityClass = "1 Internal";
                this.props.commonReport.AuthorizedAssociates = [];
                this.props.commonReport.OrganizationalUnits = [];
                uploadSection = this.renderUploadSection();
                break;
            }
            case "Paper": {
                this.props.commonReport.checkBoxChecked = false;
                this.props.commonReport.FeberAuthorDisplayName = '';
                this.props.commonReport.SecurityClass = "1 Internal";
                this.props.commonReport.AuthorizedAssociates = [];
                this.props.commonReport.OrganizationalUnits = [];
                uploadSection = this.renderUrlSection();
                break;
            }
            default: {
                this.props.commonReport.checkBoxChecked = false;
                this.props.commonReport.FeberAuthorDisplayName = '';
                this.props.commonReport.SecurityClass = "1 Internal";
                this.props.commonReport.AuthorizedAssociates = [];
                this.props.commonReport.OrganizationalUnits = [];
                break;
            }
        }
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <RbLabel size={LabelSize.Large} isInline={true} style={{ paddingRight: "1rem" }}>Choose content type</RbLabel>
                    <div className="upload-info-icon" style={{ display: "inline-block", marginTop: "0px" }} >
                        <span className="rb-ic rb-ic-info-i-frame" />
                    </div>
                    <div className="upload-info" style={{ marginTop: "0.25rem" }}>
                        <span className="ms-Label">Choose the type of knowledge you want to share </span>
                    </div>
                    <div>
                        <Link className = "url-link-ec" href="https://sites.inside-share.bosch.com/sites/048890/_layouts/15/WopiFrame.aspx?sourcedoc=/sites/048890/Documents/Export%20Control/ECO_List.xlsx&action=default" target="_blank" style={{ paddingRight: "1rem" }} >Reports with export controlled material may only be uploaded via the Research & Development selection</Link>                                 
                    </div>
                    <RbLabel className="error-txt" size={LabelSize.Small} isInline={false}>{this.props.validation.UploadType}</RbLabel>
                </div>
                {this.renderChoiceGroup()}
                {(!!this.props.commonReport.UploadType) ? <div className="ms-Grid-row">
                    <br />
                    <RbLabel size={LabelSize.Large} isInline={false}>Upload the document</RbLabel>
                    <RbLabel className="error-txt" size={LabelSize.Small} isInline={false}>{this.props.validation.AttachedUrl}</RbLabel>
                    <RbLabel className="error-txt" size={LabelSize.Small} isInline={false}>{this.props.validation.Attachment}</RbLabel>
                    <br />
                    {uploadSection}
                </div> : null}
            </div >
        );
    }
    mouseEnter = (event: any) => {

        this.setState(
            {
                isHover: true,
                currentIcon: event.currentTarget.id
            }
        );
    }
    closedInfo = () => {
        this.setState({ isHover: false });
    }
    renderUploadSection() {
        return (
            <React.Fragment>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <RbLabel> Please upload your file here. Please keep in mind that only PDF format is supported. </RbLabel>
                        <br></br>
                        <FilePicker text="Choose File" value={this.props.commonReport.Attachment} onFileChange={(file: any) => {
                            this.props.updateField("Attachment", file);
                        }} />
                    </div>
                </div>
            </React.Fragment>
        );
    }
    renderUrlSection() {
        return (
            <React.Fragment>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm10">
                            <RbLabel isInline={false} > Please copy the link to your Journal or Conference Paper here to attach it to FEBER. </RbLabel>
                            <br></br>
                            <RbLabel isInline={false} > URL: </RbLabel>
                            <RbTextField value={this.props.commonReport.AttachedUrl}
                                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("AttachedUrl", event.currentTarget.value); }} />
                            <br></br>
                            <RbLabel isInline={false}> Due to copyright reasons, we do no longer provide the option to store the paper directly in FEBER. </RbLabel>
                            <RbLabel isInline={false}> Please provide the external URL to the paper on the publishers website. The document will still be found in FEBER based on the stated properties. </RbLabel>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
    renderChoiceGroup() {
        const items: IRbRadioItem[] = [
            { value: "RnD", label: "Research and development", info: this.renderInfoForRD() },
            { value: "LL", label: "Lessons Learned ", info: this.renderInfoForLL() },
            { value: "Thesis", label: "Thesis", info: this.renderInfoForThesis() },
            { value: "Paper", label: "Conference / Journal Paper", info: this.renderInfoForPaper() }
        ];
        if (this.props.mode === "admin" || this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.RND_USER])) {
            items.find(i => i.value === Constants.DOCUMENT_TYPE.RnD).moreInfo = null;
            items.find(i => i.value === Constants.DOCUMENT_TYPE.RnD).disabled = false;
            if (this.props.mode === "admin" && !this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
                if (!this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
                    items.find(i => i.value === Constants.DOCUMENT_TYPE.RnD).disabled = true;
                }
                if (!this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN])
                    && !this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN])) {
                    items.find(i => i.value === Constants.DOCUMENT_TYPE.LL).disabled = true;
                }
                if (!this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
                    items.find(i => i.value === Constants.DOCUMENT_TYPE.Thesis).disabled = true;
                }
                if (!this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN])) {
                    items.find(i => i.value === Constants.DOCUMENT_TYPE.Paper).disabled = true;
                }
            }
        }
        else {
            items.find(i => i.value === Constants.DOCUMENT_TYPE.RnD).moreInfo = ((): any => {
                if (this.props.commonReport.mode === "admin" || this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.RND_USER])) {
                    return null;
                }
                return <RbLabel
                    className="rnd-msg"
                    title="Click here to send a request email to CI-Hotline"
                    size={LabelSize.Small}
                    onClick={() => {
                        window.open(
                            "mailto:ITServiceDesk@bosch.com?"
                            + "subject=Request for IDM Role %22" + this.props.userProfile?.permissions?.rndGroup + "%22"
                            + "&body="
                            + "Dear CI-Hotline, %0D%0A %0D%0A"
                            + "Please help grant the FEBER idm role %22" + this.props.userProfile?.permissions?.rndGroup + "%22 to my account. %0D%0A"
                            + "Reason: Access to FEBER research and development reports. %0D%0A %0D%0A"
                            + "My NTID is " + this.props.userProfile?.loginName + " %0D%0A %0D%0A"
                            + "Best Regards, %0D%0A"
                            + this.props.userProfile.name);
                    }}
                >
                    * You do not have the rights to upload R&D-Knowledge at the moment. Please contact your IdM-Administrator/CI-Hotline and ask for '{this.props.userProfile.permissions.rndGroup}'
                    </RbLabel>;
            })();
            items.find(i => i.value === Constants.DOCUMENT_TYPE.RnD).disabled = true;
        }
        return (
            <div className="ms-Grid-row">
                <div className="ms-Grid-row upload-type-options">
                    <RbRadio defaultValue={this.props.commonReport.UploadType} itemWidth={30} items={items}
                        onChange={(selectedValue) => {
                            if (selectedValue !== this.props.commonReport.UploadType) {
                                this.props.updateField("DocumentType", null);
                            }
                            this.props.updateField("UploadType", selectedValue);
                            this.props.initSteps(selectedValue);
                            this.forceUpdate();
                        }}
                    />
                </div>
            </div>

        );
    }
    renderInfoForRD() {
        let rdfield = <div>For more detailed information on R&D-Report at Bosch, please have a look at the <Link href="https://rb-normen.bosch.com/NormMaster/DirectLink.do?ACTION=VIEW_STANDARD&doknr=N100+KS003" target="_blank" style={{ textDecoration: "underline" }} >BES Standard Research & Development Reports*</Link></div>;
        return Template.renderUploadTypeInfoRowTemplate(this.state.isHover, this.state.currentIcon, this.mouseEnter, this.closedInfo, "icon-1", rdfield);
    }
    renderInfoForLL() {
        let llfield = <div>Lessons Learned Report according to  <Link href="https://rb-wam.bosch.com/socos-c/SOCOS/finder.cgi?CD-00517-XXX_XXX_X_EN" target="_blank" style={{ textDecoration: "underline" }} >CDQ 0517</Link> written as a result of a successfully solved problem along the 8D process </div>;
        return Template.renderUploadTypeInfoRowTemplate(this.state.isHover, this.state.currentIcon, this.mouseEnter, this.closedInfo, "icon-2", llfield);
    }
    renderInfoForThesis() {
        let thesisfield = <div>Bachelor/Master Thesis or Dissertations written at a Bosch department must be made available for the company according to the <Link href="https://inside-ws.bosch.com/hrs/wcms/wcms_hrs/media/2_media_myhr_de/dokumentenarten_uebergreifend_de/99_zentralanweisung_de/vergabe_von_wissenschaftlichen_arbeiten/Vergabe_von_wissenschaftlichen_Arbeiten_VA_EN_MA.pdf" target="_blank" style={{ textDecoration: "underline" }} > HR procedural instruction "Allocation of academic papers within the Bosch Group"</Link> </div>;
        return Template.renderUploadTypeInfoRowTemplate(this.state.isHover, this.state.currentIcon, this.mouseEnter, this.closedInfo, "icon-3", thesisfield);
    }
    renderInfoForPaper() {
        let paperfield = <div>Academic papers published in scientific journals or at conferences and written at a Bosch department must be made available for the company according to the <Link href="https://inside-ws.bosch.com/hrs/wcms/wcms_hrs/media/2_media_myhr_de/dokumentenarten_uebergreifend_de/99_zentralanweisung_de/vergabe_von_wissenschaftlichen_arbeiten/Vergabe_von_wissenschaftlichen_Arbeiten_VA_EN_MA.pdf" target="_blank" style={{ textDecoration: "underline" }} >HR procedural instruction "Allocation of academic papers within the Bosch Group"</Link> </div>;
        return Template.renderUploadTypeInfoRowTemplate(this.state.isHover, this.state.currentIcon, this.mouseEnter, this.closedInfo, "icon-4", paperfield);
    }
}

const mapStateToProps = (state: RootState) => ({
    commonReport: state.upload.commonReport,
    mode: state.upload.mode,
    validation: state.upload.validation,
    userProfile: state.permission.userProfile,
});
export default connect(mapStateToProps, { updateField, initSteps })(Upload_Selection);
