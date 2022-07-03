import * as React from 'react';
import './RbList.scss';
import RbLabel from '../label/RbLabel';

interface RbListProps {
    items: IRbListItem[]
}

export interface IRbListItem {
    text: string;
    icon?: string;
    onClick?: () => void;
}

class RbList extends React.Component<RbListProps, any> {

    render() {
        return (
            <div className="rb-list-wrapper">
                {this.props.items.map((item: IRbListItem) =>
                    <div className="rb-list-item-wrapper pointer" onClick={() => {
                        if (!!item.onClick) {
                            item.onClick();
                        }
                    }}>
                        {(!!item.icon) ? <div className={"rb-list-item-icon rb-ic " + item.icon} />
                            : <div className="rb-list-item-icon"><div className="rb-list-item-icon-default" /></div>}
                        <RbLabel className="rb-list-item-text">{item.text}</RbLabel>
                        {}
                    </div>
                )}
            </div>
        );
    }

}

export default RbList;