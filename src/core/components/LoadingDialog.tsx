import * as React from 'react';
import { Dialog } from '@fluentui/react/lib/Dialog';
import { connect } from 'react-redux';
import { RootState } from '../../store/configureStore';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';
import RbLoadingSpinner from '../../bosch-react/components/loading-spinner/RbLoadingSpinner';

class LoadingDialog extends React.Component<any, any> {

    render() {
        let dialogMessage: string | boolean = this.props.dialogMessage;
        if (dialogMessage === "") {
            return null;
        }
        else {
            return (
                <Dialog minWidth="30vw" maxWidth="30vw"
                    modalProps={{
                        isBlocking: true,
                        containerClassName: 'ms-dialogMainOverride',
                    }}
                    dialogContentProps={{
                        showCloseButton: false
                    }}
                    hidden={false}
                    isDarkOverlay={true}
                    onDismiss={() => { }}
                >
                    <div className="ms-Grid">
                        <div className="ms-Grid-row" style={{ textAlign: "center" }}>
                            <div style={{ display: "block", width: "100%", height: "5rem", textAlign: "center" }}>
                                <RbLoadingSpinner />
                            </div>
                            <RbLabel size={LabelSize.Large} isInline={false}>{dialogMessage}</RbLabel>
                        </div>
                    </div>
                </Dialog>
            );
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    dialogMessage: state.util.dialogMessage
});

export default connect(mapStateToProps)(LoadingDialog);