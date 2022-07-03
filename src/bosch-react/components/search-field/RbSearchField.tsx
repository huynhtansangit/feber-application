import * as React from 'react';
import './RbSearchField.scss';

interface RbSearchFieldProps {
    value?: string;
    placeholder?: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onSearch?: (event: React.KeyboardEvent<HTMLInputElement>, newValue: string) => void
}

class RbSearchField extends React.Component<RbSearchFieldProps, any> {

    private inputRef: React.RefObject<any> = React.createRef();

    constructor(props: RbSearchFieldProps) {
        super(props);
        this.state = {
            value: "",
            isFocus: false,
        };
    }

    componentDidMount() {
        if (!!this.props.value) {
            this.setState({ value: this.props.value });
        }
    }

    render() {
        return (
            <div className={
                "rb-search-field-group"
                + ((this.state.isFocus === true) ? " focus" : "")
            }>

                <span className="rb-ic rb-ic-search first"></span>

                <input type="text" ref={this.inputRef}
                    className="rb-search-field"
                    value={this.state.value}
                    placeholder={(!!this.props.placeholder) ? this.props.placeholder : ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({ value: event.target.value });
                        if (!!this.props.onChange) {
                            this.props.onChange(event);
                        }
                    }}
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        if ((event.key === 'Enter' || event.keyCode === 13) && !!this.props.onSearch) {
                            this.props.onSearch(event, this.state.value);
                        }
                    }}
                    onFocus={() => {
                        this.setState({ isFocus: true });
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            this.setState({ isFocus: false });
                        }, 100);
                    }}
                />

                <span className="rb-ic rb-ic-close" onClick={() => {
                    setTimeout(() => {
                        this.setState({ value: "", isFocus: true }, () => {
                            this.inputRef.current.focus();
                            if (!!this.props.onChange) {
                                this.props.onChange({ currentTarget: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                            }
                        });
                    }, 101);
                }}></span>

                <span className="rb-ic rb-ic-search second"></span>

            </div>
        );
    }

    setValue(value: string) {
        this.setState({ value: value });
    }

}

export default RbSearchField;
