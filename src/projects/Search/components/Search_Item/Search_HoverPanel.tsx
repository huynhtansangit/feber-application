import * as React from 'react';
import Helper from '../../../../core/libraries/Helper';
import Constants from '../../../../core/libraries/Constants';
import RbLabel from '../../../../bosch-react/components/label/RbLabel';

class Search_HoverPanel extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.renderHeader = this.renderHeader.bind(this);
        this.renderReportType = this.renderReportType.bind(this);
        this.renderKeywords = this.renderKeywords.bind(this);
        this.renderAbstract = this.renderAbstract.bind(this);
        // RnD
        this.renderReportNumber = this.renderReportNumber.bind(this);
        // LL
        this.renderPlantorBU = this.renderPlantorBU.bind(this);
        this.renderProcessorProduct = this.renderProcessorProduct.bind(this);
        //Thesis - None
        // Paper
        this.renderConferenceName = this.renderConferenceName.bind(this);
        this.renderConferenceLocation = this.renderConferenceLocation.bind(this);
        this.renderConferenceDate = this.renderConferenceDate.bind(this);
        this.renderJournalName = this.renderJournalName.bind(this);
        this.renderPublicationDate = this.renderPublicationDate.bind(this);
    }

    render() {
        let displayBlock = <span />
        switch (this.props.data.UploadType) {
            case Constants.DOCUMENT_TYPE.RnD: {
                displayBlock = <div className="ms-Grid" style={{ padding: "0px 20px" }}>
                    {this.renderHeader()}
                    {this.renderKeywords()}
                    {this.renderAbstract()}
                    {this.renderReportType()}
                    {this.renderReportNumber()}
                    <br />
                </div>;
                break;
            }
            case Constants.DOCUMENT_TYPE.LL: {
                displayBlock = <div className="ms-Grid" style={{ padding: "0px 20px" }}>
                    {this.renderHeader()}
                    {this.renderKeywords()}
                    {this.renderReportType()}
                    {this.renderProcessorProduct()}
                    {this.renderPlantorBU()}
                    <br />
                </div>;
                break;
            }
            case Constants.DOCUMENT_TYPE.Thesis: {
                displayBlock = <div className="ms-Grid" style={{ padding: "0px 20px" }}>
                    {this.renderHeader()}
                    {this.renderKeywords()}
                    {this.renderAbstract()}
                    {this.renderReportType()}
                    <br />
                </div>;
                break;
            }
            case Constants.DOCUMENT_TYPE.Paper: {
                let choiceBlock = <span />
                switch (this.props.data.DocumentType) {
                    case "Conference Paper": {
                        choiceBlock = <div>
                            {this.renderConferenceName()}
                            {this.renderConferenceLocation()}
                            {this.renderConferenceDate()}
                        </div>;
                        break;
                    }
                    case "Journal Paper": {
                        choiceBlock = <div>
                            {this.renderJournalName()}
                            {this.renderPublicationDate()}
                        </div>;
                        break;
                    }
                }
                displayBlock = <div className="ms-Grid" style={{ padding: "0px 20px" }}>
                    {this.renderHeader()}
                    {this.renderKeywords()}
                    {this.renderAbstract()}
                    {this.renderReportType()}
                    {choiceBlock}
                    <br />
                </div>;
                break;
            }
        }
        return displayBlock;
    }

    renderHeader() {
        return (
            <div className="ms-Grid-row search-hover-row truncate">
                <RbLabel isInline={false}><b>{this.props.data.Title}</b></RbLabel>
                <RbLabel isInline={false}>{this.props.data.Department}</RbLabel>
            </div >
        );
    }

    renderReportType() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Report type :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.DocumentType}</RbLabel>
            </div>
        );
    }

    renderKeywords() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Keywords :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={8}>{this.props.data.Keywords}</RbLabel>
            </div>
        );
    }

    renderAbstract() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Abstract :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={8}>{this.props.data.Abstract}</RbLabel>
            </div>
        );
    }

    // RnD
    renderReportNumber() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Report number :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.ReportNumber}</RbLabel>
            </div>
        );
    }

    // LL
    renderPlantorBU() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Plant/BU :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.PlantorBU}</RbLabel>
            </div>
        );
    }
    renderProcessorProduct() {
        let value = this.props.data.Product;
        if (value === "") {
            value = this.props.data.Process;
        }
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Process/Product :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{value}</RbLabel>
            </div>
        );
    }

    // Thesis - None

    // Paper
    renderConferenceName() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Name of conference :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.ConferenceName}</RbLabel>
            </div>
        );
    }

    renderConferenceLocation() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Location of conference :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.ConferenceLocation}</RbLabel>
            </div>
        );
    }

    renderConferenceDate() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Date of conference :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{Helper.getDateTimeFormatForUI(new Date(this.props.data.ConferenceDate))}</RbLabel>
            </div>
        );
    }

    renderJournalName() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Name of journal :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{this.props.data.JournalName}</RbLabel>
            </div>
        );
    }

    renderPublicationDate() {
        return (
            <div className="ms-Grid-row search-hover-row">
                <RbLabel>Date of publication :</RbLabel>
                <RbLabel isMultipleLines={true} maxLines={5}>{Helper.getDateTimeFormatForUI(new Date(this.props.data.PublicationDate))}</RbLabel>
            </div>
        );
    }

}

export default Search_HoverPanel;