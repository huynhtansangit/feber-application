import * as React from 'react';
import { Label } from '@fluentui/react';
import Color from '../../../core/libraries/Color';

class NotFound extends React.Component<any, any> {

    render() {
        const colorBlueStyle = { color: Color.BLUE };
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <Label><h2 style={{ margin: "0px" }}>We're processing report</h2></Label>
                </div>
                <div className="ms-Grid-row">
                    <p>
                        <Label style={colorBlueStyle}>Report guid: {this.props.guid}</Label>
                        <Label style={colorBlueStyle}>It will be accessible in FEBER in approximately one hour</Label>
                    </p>
                    <p>
                        <Label>After one hour, if you still cannot access to the report, please contact us via <a href="mailto:Mailbox.FEBER@de.bosch.com">Feber Support</a> with your report information</Label>
                        <Label>Thank you for your cooperation.</Label>
                    </p>
                </div>
            </div>
        );
    }

}

export default NotFound;