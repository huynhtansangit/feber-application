import * as React from 'react';
import './RbTabs.scss';
import RbLabel from '../label/RbLabel';

interface RbTabsProps {
    items: IRbTabItem[];
    onClick?: () => void
}

export interface IRbTabItem {
    label: string;
    content: any;
}

class RbTabs extends React.Component<RbTabsProps, any> {

    constructor(props: RbTabsProps) {
        super(props);
        this.state = {
            selectedItem: this.props.items[0]
        };
    }

    render() {
        return (
            <div className="rb-tabs-wrapper">
                <div className="rb-tabs">
                    {this.props.items.map((item, index) => (
                        <div className={
                            "rb-tab"
                            + ((this.state.selectedItem.label === item.label) ? " selected" : "")
                        } key={index} onClick={() => {
                            this.setState({ selectedItem: item }, () => {
                                if (!!this.props.onClick) {
                                    this.props.onClick();
                                }
                            });
                        }}>
                            <RbLabel>{item.label}</RbLabel>
                        </div>
                    ))}
                </div>
                <div className="rb-tab-content">
                    {this.state.selectedItem.content}
                </div>
            </div>
        );
    }

}

export default RbTabs;