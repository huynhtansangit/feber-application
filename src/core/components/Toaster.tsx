import * as React from 'react';
import { Layer } from '@fluentui/react/lib/Layer';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import Constants from '../libraries/Constants';
import { IToastMessage } from '../../store/util/types';
import { connect } from 'react-redux';
import { RootState } from '../../store/configureStore';
import { showToastMessage } from '../../store/util/actions';
import _ from 'lodash';

class Toaster extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.hide = this.hide.bind(this);
    }

    componentDidUpdate() {
        let toast: IToastMessage = this.props.toast;
        if (toast.type !== "") {
            setTimeout(() => {
                this.hide();
            }, 10000);
        }
    }

    render() {
        let toast: IToastMessage = this.props.toast;
        let messsageType: any = null;
        switch (toast.type) {
            case Constants.TOAST_MESSAGE_CODE.SUCCESS: {
                messsageType = MessageBarType.success;
                break;
            }
            case Constants.TOAST_MESSAGE_CODE.ERROR: {
                messsageType = MessageBarType.error;
                break;
            }
            case Constants.TOAST_MESSAGE_CODE.WARN: {
                messsageType = MessageBarType.warning;
                break;
            }
            case Constants.TOAST_MESSAGE_CODE.INFO: {
                messsageType = MessageBarType.info;
                break;
            }
            case "": {
                break;
            }
        }
        if (!_.isNil(messsageType)) {
            return (
                <Layer>
                    <div style={{ background: "#ffffff" }}>
                        <MessageBar messageBarType={messsageType} isMultiline={true} onDismiss={() => { this.hide(); }} dismissButtonAriaLabel="Close">
                            {toast.message}
                        </MessageBar>
                    </div>
                </Layer>
            );
        }
        else {
            return null;
        }
    }

    hide() {
        this.props.showToastMessage();
    }

}

const mapStateToProps = (state: RootState) => ({
    toast: state.util.toast
});

export default connect(mapStateToProps, { showToastMessage })(Toaster);