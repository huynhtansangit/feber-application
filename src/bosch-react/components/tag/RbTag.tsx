import * as React from 'react';
import RbLabel, { LabelSize } from '../label/RbLabel';
import './RbTag.scss';

class RbTag extends React.Component<any, any> {

    render() {
        return (
            <div className="rb-tag-wrapper">
                <RbLabel size={LabelSize.Small}>{this.props.children}</RbLabel>
            </div>
        );
    }

}

export default RbTag;