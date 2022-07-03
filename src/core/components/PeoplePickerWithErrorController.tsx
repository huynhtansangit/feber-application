import * as React from 'react';
import { PeoplePicker as DefaultPeoplePicker } from './PeoplePicker';
import _ from 'lodash';

class PeoplePicker extends React.Component<any, any> {

    render() {
        return (
            <div className={(!_.isUndefined(this.props.errorMessage)) ? "customized-error-message" : ""}>
                <DefaultPeoplePicker
                    itemLimit={this.props.itemLimit}
                    principalType={this.props.principalType}
                    defaultValue={this.props.defaultValue}
                    onChange={this.props.onChange}
                    componentRef={this.props.componentRef}
                    path={this.props.path}
                    uploadType={this.props.uploadType}
                />
                {
                    (!_.isUndefined(this.props.errorMessage)) ?
                        <div role="alert">
                            <p className="ms-TextField-errorMessage">
                                <span data-automation-id="error-message">{this.props.errorMessage}</span>
                            </p>
                        </div> : ""
                }
            </div >
        );
    }

}

export default PeoplePicker;