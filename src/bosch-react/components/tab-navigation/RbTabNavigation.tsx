import * as React from 'react';
import './RbTabNavigation.scss';
import RbLabel from '../label/RbLabel';

export interface INavItem {
    label: string,
    url?: string,
    isOpen?: boolean,
    hasDivider?: boolean,
    children?: INavItem[],
    onClick?: () => void
}

interface RbTabNavigationProps {
    items: INavItem[]
}

class RbTabNavigation extends React.Component<RbTabNavigationProps, any> {

    wrapperRef: React.RefObject<any> = React.createRef();

    constructor(props: RbTabNavigationProps) {
        super(props);
        this.state = {
            items: []
        };

        this.initState = this.initState.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);

        this.handleTabLevel1Clicked = this.handleTabLevel1Clicked.bind(this);
        this.renderTabLevel2 = this.renderTabLevel2.bind(this);
        this.handleTabLevel2Clicked = this.handleTabLevel2Clicked.bind(this);
        this.renderTabLevel3 = this.renderTabLevel3.bind(this);
        this.handleTabLevel3Clicked = this.handleTabLevel3Clicked.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        this.initState();
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    render() {
        const items: INavItem[] = this.state.items;
        return (
            <div className="rb-tab-navigation-wrapper" ref={this.wrapperRef}>
                {items.map(item =>
                    <div className="rb-tab-level-1" key={item.label} onClick={(event) => { this.handleTabLevel1Clicked(event, items, item); }}>
                        <RbLabel isInline={true}>{item.label}</RbLabel>
                        {(item.children !== undefined) ?
                            <span className="rb-ic dropdown-icon"></span>
                            : null}
                        {(!!item.isOpen && !!item.children) ? this.renderTabLevel2(items, item) : null}
                    </div>)}
            </div>
        );
    }

    initState() {
        const items: INavItem[] = [];
        this.props.items.forEach(item => {
            items.push({ ...item, isOpen: false });
        });
        this.setState({ items: items });
    }

    handleClickOutside(event: MouseEvent) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.initState();
        }
    }

    handleTabLevel1Clicked(event: React.MouseEvent, items: INavItem[], selectedItem: INavItem) {
        event.stopPropagation();
        if (!!selectedItem.onClick) {
            this.initState();
            selectedItem.onClick();
        }
        else {
            if (!!selectedItem.children) {
                items.forEach(lvl1Child => {
                    if (lvl1Child.label === selectedItem.label) {
                        lvl1Child.isOpen = !lvl1Child.isOpen;
                    }
                    else {
                        lvl1Child.isOpen = false;
                        if (!!lvl1Child.children) {
                            lvl1Child.children.forEach(lvl2Child => {
                                lvl2Child.isOpen = false;
                            });
                        }
                    }
                });
                this.setState({ items: items });
            }
        }
    }

    renderTabLevel2(items: INavItem[], selectedItem: INavItem) {
        return (
            <div className="rb-tab-level-2">
                {selectedItem.children.map(item =>
                    <div className={
                        "rb-tab-level-2-option"
                        + ((!!item.hasDivider) ? " has-divider" : "")
                    } key={item.label} onClick={(event) => { this.handleTabLevel2Clicked(event, items, selectedItem, item); }}>
                        <RbLabel isInline={true}>{item.label}</RbLabel>
                        {(item.children !== undefined) ?
                            <span className="rb-ic dropdown-icon"></span>
                            : null}
                        {(!!item.children) ? this.renderTabLevel3(items, item) : null}
                    </div>
                )}
            </div>
        );
    }

    handleTabLevel2Clicked(event: React.MouseEvent, items: INavItem[], parentItem: INavItem, selectedItem: INavItem) {
        event.stopPropagation();
        if (!!selectedItem.onClick) {
            this.initState();
            selectedItem.onClick();
        }
        else {
            if (!!selectedItem.children) {
                items.forEach(lvl1Child => {
                    lvl1Child.isOpen = lvl1Child.label === parentItem.label;
                });
                this.setState({ items: items });
            }
        }
    }

    renderTabLevel3(items: INavItem[], selectedItem: INavItem) {
        return (
            <div className="rb-tab-level-3">
                {selectedItem.children.map(item =>
                    <div className={
                        "rb-tab-level-2-option"
                        + ((!!item.hasDivider) ? " has-divider" : "")
                    } key={item.label} onClick={(event) => { this.handleTabLevel3Clicked(event, item); }}>
                        <RbLabel isInline={true}>{item.label}</RbLabel>
                    </div>
                )}
            </div>
        );
    }

    handleTabLevel3Clicked(event: React.MouseEvent, selectedItem: INavItem) {
        event.stopPropagation();
        if (!!selectedItem.onClick) {
            this.initState();
            selectedItem.onClick();
        }
    }

}

export default RbTabNavigation;