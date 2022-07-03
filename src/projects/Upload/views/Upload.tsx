/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import Upload_Selection from "../components/Upload_Selection";
import UploadSteps from "../components/Upload_Steps";
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { IStep } from '../../../store/upload/types';
import Accessibility from '../components/Accessibility';
import Abstract from '../components/Abstract';
import Release from '../components/Release';
import Summary from '../components/Summary';
import Properties from '../components/Properties';
import CommandButtons from '../components/CommandButtons';
import { init, updateField } from '../../../store/upload/actions';
import { getReportTypes } from '../../../store/upload/thunks';
import { IUserProfile } from '../../../store/permission/types';
import Constants from '../../../core/libraries/Constants';
import Environment from '../../../Environment';
import { confirmDialog } from '../../../store/util/actions';

interface UploadProps {
    mode?: string,
    userProfile: IUserProfile
    steps: IStep[],
    init: typeof init,
    updateField: typeof updateField,
    confirmDialog: typeof confirmDialog,
    getReportTypes: any,

}

class Upload extends React.Component<UploadProps, any> {
    componentDidMount() {
        this.props.init((this.props.mode === "admin") ? "admin" : "user");
        this.props.getReportTypes("RnD");
        this.props.getReportTypes("Thesis");
        this.props.getReportTypes("Paper");
        if (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN]) && this.props.mode === "admin") {
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

    }
    render() {
        let element = null;
        if (this.props.steps.length !== 0) {
            const selectedStep: IStep = this.props.steps.find(step => !!step.isSelected);
            if (!!selectedStep) {
                switch (selectedStep.label) {
                    case "Upload": {
                        element = <Upload_Selection />;
                        break;
                    }
                    case "Properties": {
                        element = <Properties />;
                        break;
                    }
                    case "Accessibility": {
                        element = <Accessibility />;
                        break;
                    }
                    case "Abstract": {
                        element = <Abstract />;
                        break;
                    }
                    case "Release": {
                        element = <Release />;
                        break;
                    }
                    case "Summary": {
                        element = <Summary />;
                        break;
                    }
                }
            }
        }
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <UploadSteps />
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm2" />
                            <div className="ms-Grid-col ms-sm10">
                                {element}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <CommandButtons />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    steps: state.upload.steps,
});

export default connect(mapStateToProps, { init, updateField, getReportTypes, confirmDialog })(Upload);