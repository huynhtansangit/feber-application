import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { connect } from 'react-redux';
import { RootState } from '../../store/configureStore';
import { confirmDialog } from '../../store/util/actions';
import { IConfirmation } from '../../store/util/types';
import RbButton, { ButtonType, ButtonSize } from '../../bosch-react/components/button/RbButton';

class ConfirmationDialog extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            clicked: false
        };
        this.closeDialog = this.closeDialog.bind(this);
    }

    render() {
        let confirm: IConfirmation = this.props.confirm;
        if (confirm.title === "") {
            return null;
        }
        else {
            let confirmModel: IConfirmation = confirm as IConfirmation;
            return (
                <Dialog minWidth="50vw" maxWidth="50vw"
                    hidden={false}
                    isDarkOverlay={true}
                    onDismiss={() => this.closeDialog(false)}
                    modalProps={{
                        isBlocking: true
                    }}
                    dialogContentProps={{
                        type: DialogType.normal,
                        title: confirmModel.title,
                        subText: confirmModel.content,

                    }}
                >
                    <DialogFooter>
                        <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(true)} label="OK" />
                        {(confirmModel.hideCancelButton === true) ? "" : <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />}
                    </DialogFooter>
                </Dialog>
            );
        }
    }

    closeDialog(confirmed: any) {
        let confirm: IConfirmation = this.props.confirm;
        this.setState({ clicked: true }, () => {
            if (confirmed === true) {
                confirm.closeCallback();
            }
            else if (confirmed === false && !!confirm.cancelCallback) {
                confirm.cancelCallback();
            }
            this.props.confirmDialog(false);
            this.setState({ clicked: false });
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    confirm: state.util.confirm
});

export default connect(mapStateToProps, { confirmDialog })(ConfirmationDialog);