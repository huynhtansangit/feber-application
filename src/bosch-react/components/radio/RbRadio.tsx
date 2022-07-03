import * as React from 'react';
import RbLabel from '../label/RbLabel';
import './RbRadio.scss';

interface RbRadioProps {
    defaultValue?: any;
    items: IRbRadioItem[];
    itemWidth?: number;
    isHorizontal?: boolean;
    onChange?: (value: any) => void;
}

export interface IRbRadioItem {
    value: any;
    label: string;
    moreInfo?: any;
    disabled?: boolean;
    info?: any;
}

class RbRadio extends React.Component<RbRadioProps, any> {

    constructor(props: RbRadioProps) {
        super(props);
        this.state = {
            selectedValue: null
        };
        this.changeValue = this.changeValue.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            if (!!this.props.defaultValue || this.props.defaultValue === false) {
                this.setState({ selectedValue: this.props.defaultValue });
            }
        }, 50)
    }

    render() {
        return (
            <div className={"rb-radio-wrapper" + ((this.props.isHorizontal === true) ? " horizontal" : " vertical")}>
                {this.props.items.map((item) => (
                    <React.Fragment key={item.value}>
                        <div key={item.value}
                            className={
                                "rb-radio-item"
                                + ((item.value === this.state.selectedValue) ? " selected" : "")
                                + ((item.disabled === true) ? " disabled" : "")
                            }>
                            <div className="rb-radio-circle"
                                onClick={() => { this.changeValue(item); }}>
                                {(item.value === this.state.selectedValue) ? <div className="rb-radio-point" /> : null}
                            </div>
                            <div className="rb-radio-text"
                                style={{ width: ((!!this.props.itemWidth) ? (this.props.itemWidth + "vw") : "inherit") }}
                                onClick={() => { this.changeValue(item); }}>
                                <RbLabel isInline={true}>{item.label}</RbLabel>
                            </div>
                            <div className="rb-radio-info">
                                {item.info}
                            </div>
                        </div>
                        {(!!item.moreInfo) ? <div className="rb-radio-more-info">{item.moreInfo}</div> : null}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    changeValue(item: IRbRadioItem) {
        if (item.value !== this.state.selectedValue) {
            this.setState({ selectedValue: item.value }, () => {
                if (!!this.props.onChange) {
                    this.props.onChange(item.value);
                }
            });
        }
    }

}

export default RbRadio;