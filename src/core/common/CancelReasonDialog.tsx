import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import RbButton, { ButtonType, ButtonSize } from '../../bosch-react/components/button/RbButton';
import RbTextField from '../../bosch-react/components/text-field/RbTextField';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';

class CancelReasonDialog extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            reasonRef: React.createRef(),
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
                    title: "Reason to cancel",
                }}
            >
                <RbLabel size={LabelSize.Small}>Reason</RbLabel>
                <RbTextField ref={this.state.reasonRef} isMultiple={true} minRows={5} />
                {!!this.state.errorMessage ? <RbLabel className="error-txt" size={LabelSize.Small} isInline={false} > {this.state.errorMessage}</RbLabel> : null}
                <DialogFooter>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(true)} label="OK" />
                    {(this.props.hideCancel === true) ? "" : <RbButton disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />}
                </DialogFooter>
            </Dialog>
        );
    }

    closeDialog(confirmed: any) {
        if (confirmed === true) {
            let text = this.state.reasonRef.current.getValue().trim();
            if (text !== "") {
                this.setState({
                    clicked: true
                });
                this.props.closeDialog(text);
            }
            else {
                this.setState({
                    errorMessage: "Please fill in the reason."
                });
            }
        }
        else {
            this.props.closeDialog("");
        }
    }

}

export default CancelReasonDialog;