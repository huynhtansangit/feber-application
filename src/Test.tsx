import * as React from 'react';
import RbLoadingSpinner from './bosch-react/components/loading-spinner/RbLoadingSpinner';
import RbButton, { ButtonType, ButtonSize } from './bosch-react/components/button/RbButton';
import RbLabel from './bosch-react/components/label/RbLabel';
import RbCheckbox from './bosch-react/components/checkbox/RbCheckbox';
import RbTextField from './bosch-react/components/text-field/RbTextField';

class TestApp extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            checked: false
        };
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <RbLabel isInline={false}>Loading Spinner</RbLabel>
                    <RbLoadingSpinner />
                </div>
                <div>
                    <RbLabel isInline={false}>Button Type</RbLabel>
                    <RbButton label="Primary button" type={ButtonType.Primary} />
                    <RbButton label="Secondary button" type={ButtonType.Secondary} />
                    <RbButton label="Tertiary button" type={ButtonType.Tertiary} />
                    <RbButton label="Disabled button" disabled={true} />
                </div>
                <div>
                    <RbLabel isInline={false}>Button Size</RbLabel>
                    <RbButton label="Large button" size={ButtonSize.Large} />
                    <RbButton label="Standard button" size={ButtonSize.Standard} />
                    <RbButton label="Small button" size={ButtonSize.Small} />
                    <RbButton label="Tiny button" size={ButtonSize.Tiny} />
                </div>
                <div>
                    <RbLabel isInline={false}>Checkbox</RbLabel>
                    <RbCheckbox checked={this.state.checked} label="With Label" onChange={(newValue) => { this.setState({ checked: newValue }); }} />
                    <RbCheckbox checked={this.state.checked} onChange={(newValue) => { this.setState({ checked: newValue }); }} />
                    <RbCheckbox checked={this.state.checked} label="Disabled" disabled={true} />
                </div>

                <div style={{width:"30vw"}}>
                    <RbLabel isInline={false}>Text field</RbLabel>
                    <RbTextField label="With Label" />
                    <RbTextField label="Disabled" disabled={true} value="Disabled field - you cannot edit it" />
                    <RbTextField message="Normal" />
                    <RbTextField valid={true} message="Success" />
                    <RbTextField valid={false} message="Error" />
                    <RbTextField valid={null} message="Warning" />
                </div>
            </React.Fragment>
        );
    }

}

export default TestApp;