import * as React from 'react';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import { connect } from 'react-redux';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import { PeoplePicker } from '../../../core/components/PeoplePicker';
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import '../../../core/scss/_customize.scss';
import Template from '../../../core/libraries/Template';
import Constants from '../../../core/libraries/Constants';
import { RootState } from '../../../store/configureStore';
import { updateField } from '../../../store/upload/actions';
import Helper from '../../../core/libraries/Helper';
import SystemService from '../../../services/SystemService';
import RbCheckbox from '../../../bosch-react/components/checkbox/RbCheckbox';
interface PropertiesProps {
    commonReport: any,
    updateField: typeof updateField,
    mode: any,
    validation: any,
    RnDReportTypes: any,
    ThesisReportTypes: any,
    PaperReportTypes: any,
    //checkBoxChecked: any,
}

class Properties extends React.Component<PropertiesProps, any>{
    authorsRef: React.RefObject<any> = React.createRef();
    keywordsRef: React.RefObject<any> = React.createRef();

    componentDidMount() {
        // No limit the number of authors for admin users
        if (this.props.mode === "admin") {
            this.setState({ maximumAuthor: undefined });
        }
        else {
            let systemSrv = new SystemService();
            systemSrv.getConfigurations().then((results: any[]) => {
                let configValue = results.filter(r => r.Title === "MaximumAuthor")[0].ConfigureValue;
                this.setState({ maximumAuthor: configValue });
            }).catch(() => {
                // Set default value
                this.setState({ maximumAuthor: 5 });
            });
        }
        if (!!this.keywordsRef.current) {
            this.keywordsRef.current.setValue((!!this.props.commonReport.FeberKeywords) ? this.props.commonReport.FeberKeywords : "");
        }
    }


    constructor(props: PropertiesProps) {
        super(props);
        this.state = {
            paperType: "",
            maximumAuthor: 5, //default
        };

        this.renderTitle = this.renderTitle.bind(this);
        this.renderAuthors = this.renderAuthors.bind(this);
        this.renderDocumentDate = this.renderDocumentDate.bind(this);
        this.renderDocumentNumber = this.renderDocumentNumber.bind(this);
        this.renderProjectNumber = this.renderProjectNumber.bind(this);
        this.renderFeberKeywords = this.renderFeberKeywords.bind(this);
        this.renderProcess = this.renderProcess.bind(this);
        this.renderProduct = this.renderProduct.bind(this);
        this.renderPlant = this.renderPlant.bind(this);
        this.renderIQIS = this.renderIQIS.bind(this);
        this.renderAuthorDisplayName =  this.renderAuthorDisplayName.bind(this);
        this.renderAuthorDisplayNameNote = this.renderAuthorDisplayNameNote.bind(this);
        // this.renderAuthorsMaunalNote =  this.renderAuthorsMaunalNote.bind(this);
        this.renderNameConference = this.renderNameConference.bind(this);
        this.renderLocationConference = this.renderLocationConference.bind(this);
        this.renderDateConference = this.renderDateConference.bind(this);
        
        this.renderNameJournal = this.renderNameJournal.bind(this);
        this.renderDatePublic = this.renderDatePublic.bind(this);
        this.renderKeywordsNote = this.renderKeywordsNote.bind(this);

        //Render specific box regarding UploadType
        this.renderLL = this.renderLL.bind(this);
        this.renderPaper = this.renderPaper.bind(this);
        this.renderRnD = this.renderRnD.bind(this);
    }
    render() {
        let element: any;
        let element_checkbox: any;
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                element = this.renderRnD();
                break;
            }
            case "LL": {
                element = this.renderLL();
                break;
            }
            case "Paper": {
                element = this.renderPaper();
                break;
            }
            case "Thesis": {
                element_checkbox = this.renderAuthorsLeftCheckbox();
                break;
            }
        }

        return (
            <React.Fragment>
                {this.renderTitle()}
                {this.renderAuthors()}
                {element_checkbox}
                {this.renderAuthorDisplayName()}
                {this.renderAuthorDisplayNameNote()}
                {this.renderDocumentDate()}
                {this.renderDocumentType()}
                {element}
            </React.Fragment>

        );
    }
    renderTitle() {
        return Template.renderUploadRowTemplate("Title",
            <RbTextField value={this.props.commonReport.Title}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("Title", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.TITLE, null, true, this.props.validation.Title);
    }
    renderAuthors() {
        if (this.props.commonReport.checkBoxChecked === true)
        { 
        return Template.renderUploadRowTemplate("Authors",
        <div className="authorDisabled">
        <PeoplePicker principalType="User" defaultValue={!!this.props.commonReport.ReportAuthor ? this.props.commonReport.ReportAuthor : []}
                componentRef={this.authorsRef}
                itemLimit={this.state.maximumAuthor}
                onChange={() => {
                    let items = this.authorsRef.current.getSelectedItems();
                    let results: any[] = [];
                    items.forEach((item: any) => {
                        if (!!item.displayName) {
                            results.push({
                                Id: item.id,
                                Title: item.displayName
                            });
                        }
                    });
                    this.props.updateField("ReportAuthor", results);
                }}/>
                </div>, Constants.UPLOAD_INFO_MESSAGE.AUTHORS, null, true, '');
        }
        else
        {
            return Template.renderUploadRowTemplate("Authors",
            <PeoplePicker principalType="User" defaultValue={!!this.props.commonReport.ReportAuthor ? this.props.commonReport.ReportAuthor : []}
                    componentRef={this.authorsRef}
                    itemLimit={this.state.maximumAuthor}
                    onChange={() => {
                        let items = this.authorsRef.current.getSelectedItems();
                        let results: any[] = [];
                        items.forEach((item: any) => {
                            if (!!item.displayName) {
                                results.push({
                                    Id: item.id,
                                    Title: item.displayName
                                });
                            }
                        });
                        this.props.updateField("ReportAuthor", results);
                    }}/>, Constants.UPLOAD_INFO_MESSAGE.AUTHORS, null, true, this.props.validation.ReportAuthor);
        }
        
    }

    //Duy.NgoNhat 12/01/2021
    renderAuthorsLeftCheckbox() {
        return Template.renderUploadRowTemplate("",
                <div style={{marginTop: "-30px"}} >
                    <RbCheckbox  checked={this.props.commonReport.checkBoxChecked} label="The author has already left Bosch?" onChange={() => {
                        this.props.updateField("checkBoxChecked", !this.props.commonReport.checkBoxChecked);
                        this.props.updateField("ReportAuthor", '');
                        this.props.updateField("FeberAuthorDisplayName", '');
                        
                    }}/>
                </div>,
                '', null, false, '');   
    }

    renderAuthorDisplayName() {
        if (this.props.commonReport.checkBoxChecked === true)
        {
            return Template.renderUploadRowTemplate("",
            <div style={{marginTop: "-40px"}}>
            <RbTextField value={this.props.commonReport.FeberAuthorDisplayName} placeholder="Author Name"
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("FeberAuthorDisplayName", event.currentTarget.value); }} />
            </div>,
            '', null, false, this.props.validation.FeberAuthorDisplayName);
        }
        else
        {
            return null;
        }
    }

    renderAuthorDisplayNameNote() {
        if (this.props.commonReport.checkBoxChecked === true)
        {
            return Template.renderNoteCustom('Please fill in the author name as text.');
        }
        else
        {
            return null;
        }
        
    }

    //---
    renderDocumentDate() {
        return Template.renderUploadRowTemplate("Report date",
            <DatePicker value={this.props.commonReport.DocumentDate}
                showGoToToday={false} placeholder="Select a date..." formatDate={(data) => Helper.getDateTimeFormatForUI(data)}
                onSelectDate={(date: Date) => { this.props.updateField("DocumentDate", date); }} />,
            Constants.UPLOAD_INFO_MESSAGE.REPORT_DATE, null, true, this.props.validation.DocumentDate);
    }
    renderDocumentNumber() {
        return Template.renderUploadRowTemplate("Report number",
            <RbTextField value={this.props.commonReport.DocumentNumber}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("DocumentNumber", event.currentTarget.value); }} />
            , Constants.UPLOAD_INFO_MESSAGE.REPORT_NUMBER, "(Optional)");
    }
    renderProjectNumber() {
        return Template.renderUploadRowTemplate("Project number",
            <RbTextField value={this.props.commonReport.ProjectNumber}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("ProjectNumber", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.PROJECT_NUMBER, "(Optional)");
    }
    renderRnD() {
        return (
            <React.Fragment>
                {this.renderDocumentNumber()}
                {this.renderProjectNumber()}
            </React.Fragment>
        )
    }
    renderDocumentType() {
        let DocumentTypeOptionArr: any[] = [];
        let UploadInfoMsg: string = "";
        switch (this.props.commonReport.UploadType) {
            case "RnD": {
                DocumentTypeOptionArr = this.props.RnDReportTypes;
                UploadInfoMsg = Constants.UPLOAD_INFO_MESSAGE.RND_REPORT_TYPE;
                break;
            }
            case "Thesis": {
                DocumentTypeOptionArr = this.props.ThesisReportTypes;
                UploadInfoMsg = Constants.UPLOAD_INFO_MESSAGE.THESIS_REPORT_TYPE;
                break;
            }
            case "Paper": {
                DocumentTypeOptionArr = this.props.PaperReportTypes;
                UploadInfoMsg = Constants.UPLOAD_INFO_MESSAGE.PAPER_REPORT_TYPE;
                break;
            }
            case "LL": {
                return null;
            }
        }
        return Template.renderUploadRowTemplate("Report Type",
            <Dropdown placeholder="Choose report type" options={DocumentTypeOptionArr}
                selectedKey={this.props.commonReport.DocumentType}
                onChange={(e, selectedOption) => {
                    this.props.updateField("DocumentType", selectedOption.key);
                    this.setState({ paperType: selectedOption.key })
                }} />,
            UploadInfoMsg, null, true, this.props.validation.DocumentType);
    }
    renderFeberKeywords() {
        return Template.renderUploadRowTemplate("Keywords",
            <RbTextField ref={this.keywordsRef} isMultiple={true} minRows={5} value={this.props.commonReport.FeberKeywords}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("FeberKeywords", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.KEYWORDS, null, true, this.props.validation.FeberKeywords);
    }
    renderProcess() {
        return Template.renderUploadRowTemplate("Process",
            <RbTextField disabled={!!this.props.commonReport.Product ? true : false} value={this.props.commonReport.Process}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("Process", event.currentTarget.value); }} />,
            null, null, false, this.props.validation.Process);
    }
    renderProduct() {
        return Template.renderUploadRowTemplate("Product",
            <RbTextField disabled={!!this.props.commonReport.Process ? true : false} value={this.props.commonReport.Product}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("Product", event.currentTarget.value); }} />,
            null, null, false, this.props.validation.Product);
    }
    renderPlant() {
        return Template.renderUploadRowTemplate("Plant/BU",
            <RbTextField value={this.props.commonReport.PlantorBU}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("PlantorBU", event.currentTarget.value); }} />
            , null, null, false, this.props.validation.PlantorBU);
    }
    renderIQIS() {
        return Template.renderUploadRowTemplate("IQIS number",
            <RbTextField value={this.props.commonReport.IQISNumber}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("IQISNumber", event.currentTarget.value); }} />, null, "(Optional)", false);
    }
    renderLL() {
        return (
            <React.Fragment>
                {this.renderFeberKeywords()}
                {this.renderKeywordsNote()}
                {this.renderProcess()}
                {
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">

                            <div className="ms-Grid-col ms-sm1"></div>
                            <div className="ms-Grid-col ms-sm1"><RbLabel>Or</RbLabel> </div>
                            <div className="ms-Grid-col ms-sm10">

                            </div>
                        </div>
                    </div>
                }
                {this.renderProduct()}
                {this.renderPlant()}
                {this.renderIQIS()}
            </React.Fragment>
        )
    }
    renderKeywordsNote() {
        return Template.renderNote('Please fill in keywords in English. Please separate your keywords via semicolon ";" to make it easier for your colleagues to distinguish the keywords.');
    }
    renderNameConference() {
        return Template.renderUploadRowTemplate("Name of conference",
            <RbTextField value={this.props.commonReport.NameOfConference} key={"c"}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("NameOfConference", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.NAME_CONFERENCE, null, true, this.props.validation.NameOfConference);

    }
    renderLocationConference() {
        return Template.renderUploadRowTemplate("Location of conference",
            <RbTextField value={this.props.commonReport.LocationOfConference}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("LocationOfConference", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.LOCATION_CONFERENCE, null, true, this.props.validation.LocationOfConference);
    }
    renderDateConference() {
        return Template.renderUploadRowTemplate("Date of conference",
            <DatePicker value={this.props.commonReport.DateOfConference}
                onSelectDate={(date: Date) => { this.props.updateField("DateOfConference", date); }}
                showGoToToday={false} placeholder="Select a date..." formatDate={(data) => Helper.getDateTimeFormatForUI(data)} />,
            Constants.UPLOAD_INFO_MESSAGE.DATE_CONFERENCE, null, true, this.props.validation.DateOfConference);
    }
    renderNameJournal() {
        return Template.renderUploadRowTemplate("Name of journal",
            <RbTextField value={this.props.commonReport.NameOfJournal} key={"j"}
                onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("NameOfJournal", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.NAME_JOURNAL, null, true, this.props.validation.NameOfJournal);
    }
    renderDatePublic() {
        return Template.renderUploadRowTemplate("Date of publication",
            <DatePicker value={this.props.commonReport.DateOfPublication}
                onSelectDate={(date: Date) => { this.props.updateField("DateOfPublication", date); }}
                showGoToToday={false} placeholder="Select a date..." formatDate={(data) => Helper.getDateTimeFormatForUI(data)} />,
            Constants.UPLOAD_INFO_MESSAGE.DATE_PUBLICATION, null, true, this.props.validation.DateOfPublication);
    }
    renderPaper() {
        switch (this.props.commonReport.DocumentType) {
            case "Conference Paper": {
                return (
                    <React.Fragment>
                        {this.renderNameConference()}
                        {this.renderLocationConference()}
                        {this.renderDateConference()}
                    </React.Fragment>

                )
            }
            case "Journal Paper": {
                return (
                    <React.Fragment>
                        {this.renderNameJournal()}
                        {this.renderDatePublic()}
                    </React.Fragment>
                )
            }

        }
        return null;
    }
}
const mapStateToProps = (state: RootState) => ({
    commonReport: state.upload.commonReport,
    validation: state.upload.validation,
    mode: state.upload.mode,
    RnDReportTypes: state.upload.RnDReportTypes,
    ThesisReportTypes: state.upload.ThesisReportTypes,
    PaperReportTypes: state.upload.PaperReportTypes,
    //checkBoxChecked: state.upload.checkBoxChecked
});

export default connect(mapStateToProps, { updateField })(Properties);



