import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

class Loading extends React.Component<any, any> {

    render() {
        let classSize = "ms-Grid " + this.props.size + "-loading";
        return (
            <div className={classSize}>
                <div className="ms-Grid-row ms-textAlignCenter">
                    <Spinner size={SpinnerSize.large} />
                </div>
            </div>
        );
    }

}

export default Loading;