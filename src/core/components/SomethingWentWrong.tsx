import * as React from 'react';
import RbLabel from '../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../bosch-react/components/button/RbButton';

class SomethingWentWrong extends React.Component<any, any> {

    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm8" style={{ paddingRight: "5vw", textAlign: "left" }}>
                        <RbLabel><h2 style={{ margin: "5px 0px" }}>Something went wrong, please try to:</h2></RbLabel>
                        <RbLabel><h4 style={{ margin: "5px 0px" }}>1 - Refresh your browser</h4></RbLabel>
                        <RbButton label="Refesh Browser" size={ButtonSize.Small} title="Click here to refresh your browser" onClick={() => window.location.reload(true)} />
                        <RbLabel><h4 style={{ margin: "5px 0px" }}>2 - Clear your browser caches</h4></RbLabel>
                        <RbLabel><h4 style={{ margin: "5px 0px" }}>3 - Check your internet connection</h4></RbLabel>
                        <RbLabel><h3 style={{ margin: "5px 0px" }}>If the problem persists, please drop an email to Mailbox.FEBER@de.bosch.com</h3></RbLabel>
                    </div>
                </div>
            </div>
        );
    }

}

export default SomethingWentWrong;