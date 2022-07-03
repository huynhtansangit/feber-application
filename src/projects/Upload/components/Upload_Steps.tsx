import * as React from 'react';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import { connect } from 'react-redux';
import '../../../core/scss/_customize.scss';
import { RootState } from '../../../store/configureStore';
import { IStep } from '../../../store/upload/types';
import { initSteps, updateStep, validateData } from '../../../store/upload/actions';

interface UploadStepsProps {
    steps: IStep[],
    commonReport: any,
    uploadType?: string,
    initSteps: typeof initSteps,
    updateStep: typeof updateStep,
    validateData: typeof validateData
}

class UploadSteps extends React.Component<UploadStepsProps, any>{
    componentDidMount() {
        this.props.initSteps(this.props.commonReport.UploadType);
    }
    render() {
        let stepsArr: any[] = [];
        this.props.steps.forEach((step, index) => {
            const lineClass = "step-line";
            let circleClass = "step-circle" + ((!!step.isSelected) ? " selected" : "");
            circleClass += (step.valid === null) ? " not-opened" : "";
            circleClass += (step.valid !== null) ? ((!!step.valid) ? " valid" : " invalid") : "";
            const iconClass = "step-icon rb-ic rb-ic-" + step.icon + ((step.valid === null) ? "-light-gray" : "-white");
            stepsArr.push(
                <React.Fragment>
                    {/* Line */}
                    {(index !== 0) ? <div className={lineClass}><div className="line" /></div> : null}
                    {/* Step */}
                    <div className="upload-step" onClick={() => this.navigateToStep(step)}>
                        <div className="step-group">
                            <div className={circleClass}>
                                <span className={iconClass} />
                            </div>
                            <RbLabel className={"step-label" + circleClass.replace("step-circle", "")}>{step.label}</RbLabel>
                        </div>
                    </div>
                </React.Fragment>
            );
        });
        return (
            <div style={{ textAlign: "center" }}>
                <div className="upload-steps">
                    {stepsArr.map((step, index) => <React.Fragment key={index}>{step}</React.Fragment>)}
                </div>
            </div>

        );
    }
    navigateToStep = (step: IStep) => {
        const currentStep = this.props.steps.find(step => !!step.isSelected);
        if (step.valid !== null && currentStep.label !== step.label) {
            this.props.validateData((result: boolean) => {
                if (result === true) {
                    currentStep.valid = true;
                    this.props.updateStep(currentStep);
                    if (step.valid === true) {
                        step.isSelected = true;
                        this.props.updateStep(step);
                    }
                }
                else { //set step to red
                    currentStep.valid = false;
                    this.props.updateStep(currentStep);
                }

            })
        }

    }
}
const mapStateToProps = (state: RootState) => ({
    steps: state.upload.steps,
    commonReport: state.upload.commonReport
});
export default connect(mapStateToProps, { initSteps, updateStep, validateData })(UploadSteps);