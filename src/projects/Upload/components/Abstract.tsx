import * as React from 'react';
import { connect } from 'react-redux';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import '../../../core/scss/_customize.scss';
import Template from '../../../core/libraries/Template';
import Constants from '../../../core/libraries/Constants';
import { RootState } from '../../../store/configureStore';
import { updateField, updateStep } from '../../../store/upload/actions';

interface AbstractProps {
    commonReport: any,
    updateField: typeof updateField,
    updateStep: typeof updateStep,
    validation: any
}

class Abstract extends React.Component<AbstractProps, any> {

    keywordsRef: React.RefObject<any> = React.createRef();
    abstractRef: React.RefObject<any> = React.createRef();

    constructor(props: AbstractProps) {
        super(props);
        this.renderKeywords = this.renderKeywords.bind(this);
        this.renderAbstract = this.renderAbstract.bind(this);
        this.renderKeywordsNote = this.renderKeywordsNote.bind(this);
        this.renderAbstractNote = this.renderAbstractNote.bind(this);
    }

    componentDidMount() {
        this.keywordsRef.current.setValue((!!this.props.commonReport.FeberKeywords)?this.props.commonReport.FeberKeywords:"");
        this.abstractRef.current.setValue((!!this.props.commonReport.Abstract)?this.props.commonReport.Abstract:"");
    }

    render() {
        return (
            <React.Fragment>
                {this.renderKeywords()}
                {this.renderKeywordsNote()}
                {this.renderAbstract()}
                {this.renderAbstractNote()}
            </React.Fragment>
        );
    }
    renderKeywords() {
        let errortxt: string = "";
        if (!!this.props.validation.FeberKeywords) {
            errortxt = this.props.validation.FeberKeywords;
        }
        return Template.renderUploadRowTemplate("Keywords", <RbTextField ref={this.keywordsRef} isMultiple={true} minRows={5} value={this.props.commonReport.FeberKeywords}
            onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("FeberKeywords", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.KEYWORDS, null, true, errortxt);
    }
    renderAbstract() {
        let errortxt: string = "";
        if (!!this.props.validation.Abstract) {
            errortxt = this.props.validation.Abstract;
        }
        return Template.renderUploadRowTemplate("Abstract", <RbTextField ref={this.abstractRef} isMultiple={true} minRows={7} value={this.props.commonReport.Abstract}
            onChange={(event: React.ChangeEvent<any>) => { this.props.updateField("Abstract", event.currentTarget.value); }} />,
            Constants.UPLOAD_INFO_MESSAGE.ABSTRACT, null, true, errortxt);
    }
    renderKeywordsNote() {
        return Template.renderNote('Please fill in keywords in English. Please separate your keywords via semicolon ";" to make it easier for your colleagues to distinguish the keywords.');
    }
    renderAbstractNote() {
        return Template.renderNote("Visible for all FEBER Users. Please Do Not include sensitive data.");
    }
}
const mapStateToProps = (state: RootState) => ({
    commonReport: state.upload.commonReport,
    validation: state.upload.validation
});
export default connect(mapStateToProps, { updateField, updateStep })(Abstract);

