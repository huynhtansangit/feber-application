import * as React from 'react';
import './RbTextExpandable.scss';
import '../../icon.scss';
import RbLabel from '../label/RbLabel';

interface RbTextExpandableProps {
    title: string,
    isExpanded?: boolean,
    size?: string,
    children?: any;
    className?: string,
    onClick?: () => void,
    isClosable?: boolean,
    onClose?: () => void
}

class RbTextExpandable extends React.Component<RbTextExpandableProps, any> {

    constructor(props: RbTextExpandableProps) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }

    componentDidMount() {
        this.setState({ isExpanded: !!this.props.isExpanded });
    }

    render() {
        return (
            <div className="rb-text-expandable-wrapper">

                {/* Title */}
                <div className="rb-text-expandable-title">
                    <span className={
                        "icon rb-ic rb-ic-"
                        + ((!!this.state.isExpanded) ? "down-dark-blue" : "forward-right-dark-blue")
                    } onClick={() => { this.setState({ isExpanded: !this.state.isExpanded }); }} />
                    <RbLabel
                        className={
                            "title"
                        }
                        isInline={true}
                        size={this.props.size}
                        onClick={() => { this.setState({ isExpanded: !this.state.isExpanded }); }}
                    >
                        {this.props.title}
                    </RbLabel>
                    {(!!this.props.isClosable) ? <span className="icon rb-ic rb-ic-close-dark-blue" onClick={() => { this.props.onClose(); }} /> : null}
                </div>

                {/* Content */}
                <div className="rb-text-expandable-content" style={{ display: (!!this.state.isExpanded) ? "inherit" : "none" }}>
                    {this.props.children}
                </div>

            </div>
        );
    }

}

export default RbTextExpandable;