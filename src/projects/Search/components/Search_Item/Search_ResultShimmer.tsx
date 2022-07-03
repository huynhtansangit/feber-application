import * as React from "react";
import { Fabric } from '@fluentui/react/lib/Fabric';
import { Shimmer, ShimmerElementsGroup, ShimmerElementType, IShimmerStyleProps, IShimmerStyles } from '@fluentui/react/lib/Shimmer';
import { mergeStyles } from '@fluentui/react/lib/Styling';

const wrapperClass = mergeStyles({
    padding: 2,
    selectors: {
        '& > *': {
            margin: '4px 0'
        }
    }
});

class Search_ResultShimmer extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.getShimmerGroup = this.getShimmerGroup.bind(this);
        this._getShimmerStyles=this._getShimmerStyles.bind(this);
    }

    render() {
        return (
            <Fabric className={wrapperClass}>
                <Shimmer customElementsGroup={this.getShimmerGroup()} styles={this._getShimmerStyles} width={'100%'} />
            </Fabric>
        );

    }

    getShimmerGroup() {
        return (
            <div style={{ display: "flex" }}>
                <ShimmerElementsGroup
                    shimmerElements={[
                        { type: ShimmerElementType.line, width: 65, height: 70 },
                        { type: ShimmerElementType.gap, width: 10, height: 70 }
                    ]}
                />
                <Shimmer width="100%" height="70" />
            </div>
        );
    }

    private _getShimmerStyles = (props: IShimmerStyleProps): IShimmerStyles => {
      return {
        shimmerWrapper: [
          {
            backgroundColor: '#deecf9',
          },
        ],
        shimmerGradient: [
          {
            backgroundColor: '#deecf9',
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, #c7e0f4 50%, rgba(255, 255, 255, 0) 100%)',
          },
        ],
      };
    };

}

export default Search_ResultShimmer;