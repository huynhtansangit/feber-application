import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import RbButton, { ButtonType, ButtonSize } from '../../bosch-react/components/button/RbButton';
import RbTextField from '../../bosch-react/components/text-field/RbTextField';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';

class ChangeWorkflowIdDialog extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            workflowIdRef: React.createRef(),
            errorMessage: "",
            clicked: false
        };
        this.closeDialog = this.closeDialog.bind(this);
    }

    render() {
        return (
            <Dialog minWidth="30vw" maxWidth="30vw"
                hidden={false}
                isDarkOverlay={true}
                onDismiss={() => this.closeDialog(false)}
                modalProps={{
                    isBlocking: true
                }}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Edit Workflow ID",
                }}
            >
                <RbLabel size={LabelSize.Small}>Workflow ID</RbLabel>
                <RbTextField ref={this.state.workflowIdRef} />
                {!!this.state.errorMessage ? <RbLabel className="error-txt" size={LabelSize.Small} isInline={false} > {this.state.errorMessage}</RbLabel> : null}
                <DialogFooter>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(true)} label="OK" />
                    {(this.props.hideCancel === true) ? "" : <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />}
                </DialogFooter>
            </Dialog>
        );
    }

    closeDialog(confirmed: any) {
        if (confirmed === true) {
            let text = this.state.workflowIdRef.current.getValue().trim();
            if (text !== "") {
                this.setState({
                    clicked: true
                });
                this.props.closeDialog(text);
            }
            else {
                this.setState({
                    errorMessage: "Please fill in the Workflow ID."
                });
            }
        }
        else {
            this.props.closeDialog("");
        }
    }

}

export default ChangeWorkflowIdDialog;