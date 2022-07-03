import * as React from 'react';
import './RbButton.scss';

export const ButtonType = {
    Primary: "rb-primary-button",
    Secondary: "rb-secondary-button",
    Tertiary: "rb-tertiary-button",
};

export const ButtonSize = {
    Large: "rb-large-button",
    Standard: "rb-standard-button",
    Small: "rb-small-button",
    Tiny: "rb-tiny-button",
}

interface RbButtonProps {
    type?: string,
    label?: string,
    title?: string,
    size?: string,
    style?: React.CSSProperties,
    disabled?: boolean,
    spanClassName?: string,
    onClick?: () => void
}

class RbButton extends React.Component<RbButtonProps, any> {

    constructor(props: RbButtonProps) {
        super(props);
        this.state = {
            isFocus: false
        };
    }

    render() {
        return (
            <div
                title={(!!this.props.title) ? this.props.title : ""}
                style={(!!this.props.style) ? this.props.style : {}}
                className={
                    "rb-button"
                    + ((this.props.type !== undefined) ? (" " + this.props.type) : (" " + ButtonType.Primary)) // Color
                    + ((this.state.isFocus === true) ? " focus" : "") // Focus
                    + (((this.props.disabled === true) ? " disabled" : "")) // disabled
                    + (((this.props.size !== undefined) ? (" " + this.props.size) : (" " + ButtonSize.Standard))) // size
                    
                }
                onMouseDown={() => {
                    this.setState({ isFocus: true });
                }}
                onMouseUp={() => {
                    this.setState({ isFocus: false });
                }}
                onMouseLeave={() => {
                    this.setState({ isFocus: false });
                }}
                onClick={() => {
                    if (this.props.onClick !== undefined && this.props.disabled !== true) {
                        this.props.onClick();
                    }
                }}
            >
                <span className={"label" + ((!!this.props.spanClassName) ? (" " + this.props.spanClassName) : "")}>{this.props.label}</span>
            </div>
        );
    }

}

export default RbButton;