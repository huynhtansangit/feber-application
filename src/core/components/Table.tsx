import * as React from 'react';
import { ScrollablePane, ScrollbarVisibility } from '@fluentui/react/lib/ScrollablePane';
import { DetailsList, Selection, SelectionMode, DetailsListLayoutMode, ConstrainMode, IDetailsListProps } from '@fluentui/react/lib/DetailsList';
import Configuration from '../libraries/Configuration';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import _ from 'lodash';
import RbLabel from '../../bosch-react/components/label/RbLabel';

class Table extends React.Component<{ detailsListProps: IDetailsListProps, height?: number | undefined, allowSelection?: boolean | undefined }, any> {

    render() {
        let list: any = <DetailsList
            compact={true}
            selectionMode={(this.props.allowSelection === true) ? SelectionMode.multiple : SelectionMode.none}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            constrainMode={ConstrainMode.unconstrained}
            isHeaderVisible={true}
            onShouldVirtualize={() => { return false; }}
            onRenderDetailsHeader={Configuration.onRenderStickyDetailsHeader}
            {...this.props.detailsListProps}
        />;
        if (this.props.allowSelection === true) {
            list = <MarqueeSelection selection={new Selection()}>{list}</MarqueeSelection>;
        }
        return (
            <div className="ms-Grid-row" style={{ height: ((_.isUndefined(this.props.height)) ? 68 : this.props.height) + "vh", overflowY: "auto", overflowX: "visible", position: "relative" }}>
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>{list}</ScrollablePane>
                {(this.props.detailsListProps.items.length > 0) ? "" : <RbLabel style={{ textAlign: "center", marginTop: "60px" }}>There are no items to show.</RbLabel>}
            </div>
        );
    }
}

export default Table;