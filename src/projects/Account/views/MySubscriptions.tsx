import * as React from 'react';
import Subscriptions from '../../../core/common/Subscriptions';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';

class MySubscriptions extends React.Component<any, any> {

    componentDidMount() {
    }

    render() {
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm1" />
                    <div className="ms-Grid-col ms-sm10">
                        <RbLabel className="header-title" size={LabelSize.Large}>Search Subscriptions</RbLabel>
                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>

                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm1" />
                    <div className="ms-Grid-col ms-sm10">
                        <Subscriptions {...this.props} />
                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>
            </div>
        );
        return element;
    }

}

export default MySubscriptions;