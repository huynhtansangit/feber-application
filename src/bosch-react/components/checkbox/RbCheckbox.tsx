import * as React from 'react';
import './RbCheckbox.scss';
import RbLabel from '../label/RbLabel';

interface RbCheckboxProps {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    onChange?: (newValue?: boolean) => void
}

class RbCheckbox extends React.Component<RbCheckboxProps, any> {

    constructor(props: RbCheckboxProps) {
        super(props);
        this.state = {
            isFocus: false
        };
    }

    render() {
        const checked = this.props.checked === true;
        const disabled = this.props.disabled === true;
        return (
            <div className="rb-checkbox-group"
                onClick={() => {
                    if (this.props.onChange !== undefined && disabled === false) {
                        this.props.onChange(!checked);
                    }
                }}
                onMouseDown={() => {
                    this.setState({ isFocus: true });
                }}
                onMouseUp={() => {
                    this.setState({ isFocus: false });
                }}
                onMouseLeave={() => {
                    this.setState({ isFocus: false });
                }}
            >
                <div
                    className={
                        "rb-checkbox"
                        + ((checked === true) ? " checked" : "") // checked
                        + ((this.state.isFocus === true) ? " focus" : "") // Focus
                        + ((disabled === true) ? " disabled" : "") // disabled
                    }
                >
                    <span
                        className={
                            "rb-ic "
                            + ((checked === true) ? ("rb-ic-checkmark" + ((disabled === true) ? "-disabled" : "")) : "")
                        } />
                </div>
                {(this.props.label !== "" && this.props.label !== undefined && this.props.label !== null) ?
                    <span className="rb-checkbox-label">
                        <RbLabel isInline={true}>{this.props.label}</RbLabel>
                    </span> : null}
            </div >
        );
    }

}

export default RbCheckbox;