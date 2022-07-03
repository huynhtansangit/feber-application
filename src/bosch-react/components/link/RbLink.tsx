import * as React from 'react';
import './RbLink.scss';
import RbLabel from '../label/RbLabel';

interface RbLinkProps {
    label: string;
    hasIcon?: boolean;
    size?: string;
    url?: string;
    shouldOpenNewTab?: boolean;
    onClick?: () => void;
}

class RbLink extends React.Component<RbLinkProps, any> {

    render() {
        return (
            <span className="rb-link-wrapper pointer" onClick={() => {
                if (!!this.props.url) {
                    if (!!this.props.shouldOpenNewTab) {
                        window.open(this.props.url, "_blank");
                    }
                    else {
                        window.location.href = this.props.url;
                    }
                }
                else if (!!this.props.onClick) {
                    this.props.onClick();
                }
            }}>
                <RbLabel className="rb-link-text" size={this.props.size}>{this.props.label}</RbLabel>
                <span className="rb-link-icon rb-ic rb-ic-forward-right-dark-blue" />
            </span>
        );
    }

}

export default RbLink;