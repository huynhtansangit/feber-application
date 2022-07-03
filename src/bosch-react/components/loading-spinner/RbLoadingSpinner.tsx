import * as React from 'react';
import './RbLoadingSpinner.scss';
import _ from 'lodash';

class RbLoadingSpinner extends React.Component<any, any>{

    constructor(props: any) {
        super(props);
        this.getSize = this.getSize.bind(this);
    }

    render() {
        return (
            <div className="rb-loader" style={{ width: this.getSize(), height: this.getSize() }}>
                <div className="block1"></div>
                <div className="block2"></div>
            </div >
        );
    }

    getSize(defaultVal: number = 60) {
        let size = (_.isNil(this.props.size)) ? 1 : this.props.size;
        return (defaultVal * size) + 'px';
    }

}

export default RbLoadingSpinner;