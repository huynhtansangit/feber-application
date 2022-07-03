import * as React from 'react';
import './RbTextField.scss';
import TextareaAutosize from 'react-textarea-autosize';

interface RbTextFieldProps {
    type?: string
    label?: string,
    value?: string,
    valid?: boolean,
    message?: string,
    disabled?: boolean,
    isMultiple?: boolean,
    minRows?: number,
    maxRows?: number,
    placeholder?: string,
    className?: string,
    onChange?: (event: React.ChangeEvent<any>) => void,
    onKeyDown?: (event: React.KeyboardEvent<any>) => void,
    onPaste?: (event: React.ClipboardEvent<any>) => void
}

class RbTextField extends React.Component<RbTextFieldProps, any> {

    private inputRef: React.RefObject<any> = React.createRef();

    constructor(props: RbTextFieldProps) {
        super(props);
        this.state = {
            value: ""
        };
        this.getValue = this.getValue.bind(this);
    }

    componentDidMount() {
        if (!!this.props.value) {
            this.setState({ value: this.props.value });
        }
    }

    render() {
        const type = (this.props.type !== undefined) ? this.props.type : "text";
        const disabled = this.props.disabled === true;
        let validationClass: string = "";
        switch (this.props.valid) {
            case null: {
                validationClass = " warning";
                break;
            }
            case true: {
                validationClass = " ok";
                break;
            }
            case false: {
                validationClass = " error";
                break;
            }
            default: {
                break;
            }
        }
        const singleLineTemplate = (
            <input type={type} ref={this.inputRef}
                placeholder={(!!this.props.placeholder) ? this.props.placeholder : ""}
                className={
                    "rb-text-field"
                    + validationClass
                    + ((!!this.props.className) ? (" " + this.props.className) : "")
                    + ((this.props.label !== undefined) ? " has-label" : "")
                }
                disabled={disabled}
                value={this.state.value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const currentEvent = Object.assign({}, event);
                    this.setState({ value: event.currentTarget.value }, () => {
                        if (this.props.onChange !== undefined && disabled === false) {
                            this.props.onChange(currentEvent);
                        }
                    });
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (this.props.onKeyDown !== undefined && disabled === false) {
                        this.props.onKeyDown(event);
                    }
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
                    if (this.props.onPaste !== undefined && disabled === false) {
                        this.props.onPaste(event);
                    }
                }}
            />
        );
        const multipleLinesTemplate = (
            <TextareaAutosize ref={this.inputRef}
                placeholder={(!!this.props.placeholder) ? this.props.placeholder : ""}
                className={
                    "rb-text-field"
                    + validationClass
                    + ((!!this.props.className) ? (" " + this.props.className) : "")
                    + ((this.props.label !== undefined) ? " has-label" : "")
                }
                disabled={disabled}
                minRows={(!!this.props.minRows) ? this.props.minRows : 1}
                maxRows={(!!this.props.maxRows) ? this.props.maxRows : 10}
                value={this.state.value}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const currentEvent = Object.assign({}, event);
                    this.setState({ value: event.currentTarget.value }, () => {
                        if (this.props.onChange !== undefined && disabled === false) {
                            this.props.onChange(currentEvent);
                        }
                    });
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (this.props.onKeyDown !== undefined && disabled === false) {
                        this.props.onKeyDown(event);
                    }
                }}
                onPaste={(event: React.ClipboardEvent<HTMLTextAreaElement>) => {
                    if (this.props.onPaste !== undefined && disabled === false) {
                        this.props.onPaste(event);
                    }
                }}
            />
        );
        return (
            <div className="rb-text-field-group">

                {(this.props.label !== undefined) ?
                    <span className={
                        "rb-text-field-label"
                        + ((disabled === true) ? " disabled" : "")
                    }>
                        {this.props.label}
                    </span> : null
                }

                {(!!this.props.isMultiple) ? multipleLinesTemplate : singleLineTemplate}


                {(this.props.message !== undefined) ?
                    <span className={
                        "rb-text-field-validation"
                        + validationClass
                    }>
                        {this.props.message}
                    </span> : null
                }

            </div>
        );
    }

    setValue(value: string) {
        this.setState({ value: value });
    }

    getValue() {
        return this.state.value;
    }

}

export default RbTextField;
