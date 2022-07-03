import * as React from 'react';
import RbButton, { ButtonSize, ButtonType } from '../../../bosch-react/components/button/RbButton';
import { connect } from 'react-redux';
import '../../../core/scss/_customize.scss';
import { RootState } from '../../../store/configureStore';
import { IStep } from '../../../store/upload/types';
import { init, updateStep, validateData } from '../../../store/upload/actions';
import { uploadReport, getReportTypes } from '../../../store/upload/thunks';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog } from '../../../store/util/actions';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import { isBoolean } from 'lodash';
import axios from 'axios';
//import '../../../services/PermissionsService';

interface CommandButtonsProps {
    userProfile: IUserProfile
    steps: IStep[],
    report: any,
    mode: string,
    updateStep: typeof updateStep,
    validateData: typeof validateData,
    uploadReport: any,
    showDialog: typeof showDialog,
    confirmDialog: typeof confirmDialog,
    init: typeof init,
    getReportTypes: any
}

class CommandButtons extends React.Component<CommandButtonsProps, any>{
    constructor(props: any) {
        super(props);
        this.goToStep = this.goToStep.bind(this);
        this.resetStep = this.resetStep.bind(this);
    }
    render() {
        let buttonsArr: any[] = [];
        const currentStepIndex: number = this.props.steps.findIndex(step => !!step.isSelected);
        if (currentStepIndex !== 0) {
            buttonsArr.push(<RbButton type={ButtonType.Secondary} label="Cancel" key="Cancel" onClick={() => { this.resetStep(); }} />);
            buttonsArr.push(<RbButton label="Previous" key="Previous" onClick={() => { this.goToStep(-1); }} />);
        }
        if (currentStepIndex >= 0 && currentStepIndex < this.props.steps.length - 1) {
            buttonsArr.push(<RbButton label="Next" key="Next" onClick={() => { this.goToStep(1); }} />);
        }
        if (currentStepIndex === this.props.steps.length - 1) {
            buttonsArr.push(<RbButton label="Finish" key="Finish" onClick={() => { this.goToStep(0); }} />);
        }
        return (
            <div className="upload-buttons">
                {buttonsArr}

            </div>

        );
    }
    goToStep(stepMove: number) {
        this.props.validateData(async (result: boolean) => {
            if (result === true) {
                if (stepMove !== 0) { // Previous or Next
                    const currentStep = this.props.steps.find(step => !!step.isSelected);
                    currentStep.valid = true;
                    if (!!currentStep.valid) {
                        currentStep.isSelected = false;
                        this.props.updateStep(currentStep);
                        this.props.steps.forEach((step: IStep, index: number) => {
                            if (step.label === currentStep.label) {
                                let expectedStep = this.props.steps[index + stepMove];
                                expectedStep.valid = true;
                                expectedStep.isSelected = true;
                                this.props.updateStep(expectedStep);
                            }
                        });
                    }
                }
                else { // Finish
                    this.props.showDialog(Constants.DIALOG_MESSAGE.UPLOAD);
                    let expires = new Date(this.props.userProfile.expires)
                    if(expires.valueOf() <= (new Date()).valueOf()){
                        let response = await this.getUserToken(this.props.userProfile.loginName.split("\\")[1])
                        this.props.userProfile.userToken = "Bearer " + response.data.access_token;
                        this.props.userProfile.expires = response.data.expires;
                    }

                    this.props.uploadReport(this.props.userProfile.userToken, this.props.report, this.props.mode, (result: any) => {
                        this.props.showDialog(false);
                        if (result === true || (isBoolean(result) === false && result.Status === "Success")) {
                            this.props.confirmDialog(Constants.REPORT_MESSAGE.UPLOAD.TITLE,
                                (this.props.mode === "admin") ? Constants.REPORT_MESSAGE.UPLOAD.SUCCESS_ADMIN : Constants.REPORT_MESSAGE.UPLOAD.SUCCESS_USER,
                                true, () => {
                                    window.location.href = Environment.spaRootPageUrl + "index.aspx#/Search";
                                });
                        }
                        else {
                            let errorMessage = '';
                            
                            if(result === false) {
                                errorMessage = 'Cannot create report';
                            }
                            else if(result === 401)
                            {
                                errorMessage = 'Your token has expired. Press F5 to reload the page';

                            }
                            else {
                                errorMessage = result.Message;
                            }
                            this.props.confirmDialog(Constants.REPORT_MESSAGE.UPLOAD.TITLE,
                                Constants.REPORT_MESSAGE.UPLOAD.FAILED.replace("{0}", errorMessage), true, () => {
                                    // Do nothing, allow the user stay at the same page
                                });
                        }
                    });
                }
            }
            else { //set step to red
                const currentStep = this.props.steps.find(step => !!step.isSelected);
                currentStep.valid = false;
                this.props.updateStep(currentStep);
            }
        })
    }

    getUserToken(ntid: string) {
        return axios.post(Environment.feberWebServiceUrl + "token", "Username=" + ntid + "&grant_type=password", {
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    resetStep() {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.CAUTION,
            Constants.CONFIRMATION_MESSAGE.CANCEL_UPLOAD_WARNING,
            false,
            () => {
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
            },
        );
    }
}
const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    steps: state.upload.steps,
    report: state.upload.commonReport,
    mode: state.upload.mode
});
export default connect(mapStateToProps, { 
    updateStep,
    validateData,
    uploadReport,
    showDialog,
    confirmDialog,
    init,
    getReportTypes
 })(CommandButtons);

