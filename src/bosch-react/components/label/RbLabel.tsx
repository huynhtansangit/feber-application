import * as React from 'react';
import './RbLabel.scss';
import TextareaAutosize from 'react-textarea-autosize';

interface RbLabelProps {
    title?: string,
    size?: string,
    isInline?: boolean;
    isMultipleLines?: boolean,
    maxLines?: number,
    children?: any;
    style?: React.CSSProperties,
    className?: string,
    hasPadding?: boolean,
    onClick?: () => void,
    isLongAuthor?: boolean
}

export const LabelSize = {
    XXLarge: "rb-xxlarge-label",
    XLarge: "rb-xlarge-label",
    Large: "rb-large-label",
    Standard: "rb-standard-label",
    Small: "rb-small-label",
    Tiny: "rb-tiny-label",
};

class RbLabel extends React.Component<RbLabelProps, any> {

    render() {
        const size = " " + ((!!this.props.size) ? this.props.size : LabelSize.Standard);
        let labelTemplate = null;
        if (!!this.props.isMultipleLines) {

            let overFlowYValue: any = "hidden";
            if (this.props.maxLines > 0) {
                overFlowYValue = "auto";
            }

            labelTemplate = (
                <TextareaAutosize style={{
                    ...this.props.style,
                    overflowX: "hidden", overflowY:overFlowYValue, backgroundColor: "transparent", width: "100%", border: "none", resize: "none"
                }}
                    title={(!!this.props.title) ? this.props.title : ""}
                    className={
                        "rb-label"
                        + size
                        + ((this.props.isInline === false) ? " block" : "")
                        + ((!!this.props.className) ? (" " + this.props.className) : "")
                        + ((!!this.props.hasPadding) ? " has-padding" : "")
                    }
                    onClick={() => {
                        if (!!this.props.onClick) {
                            this.props.onClick();
                        }
                    }}
                    minRows={1} maxRows={this.props.maxLines}
                    readOnly={true}
                    defaultValue={this.props.children} />
            );
        }
        else if(this.props.isLongAuthor === true){
            let overFlowYValue: any = "hidden";
            if (this.props.maxLines > 0) {
                overFlowYValue = "auto";
            }

            labelTemplate = (
                <TextareaAutosize style={{
                    ...this.props.style,
                    overflowX: "hidden", overflowY:overFlowYValue, backgroundColor: "transparent", width: "100%", border: "none", resize: "none"
                }}
                    title={(!!this.props.title) ? this.props.title : ""}
                    className={
                        "rb-label" + " longAuthor"
                        + size
                        + ((this.props.isInline === false) ? " block" : "")
                        + ((!!this.props.className) ? (" " + this.props.className) : "")
                        + ((!!this.props.hasPadding) ? " has-padding" : "")
                    }
                    onClick={() => {
                        if (!!this.props.onClick) {
                            this.props.onClick();
                        }
                    }}
                    minRows={1} maxRows={this.props.maxLines}
                    readOnly={true}
                    defaultValue={this.props.children} />
            // labelTemplate = (
            //     <span style={this.props.style}
            //         title={(!!this.props.title) ? this.props.title : ""}
            //         className={
            //             "rb-label" + " longAuthor"
            //             + size
            //             + ((this.props.isInline === false) ? " block" : "")
            //             + ((!!this.props.className) ? (" " + this.props.className) : "")
            //             + ((!!this.props.hasPadding) ? " has-padding" : "")
            //         }
            //         onClick={() => {
            //             if (!!this.props.onClick) {
            //                 this.props.onClick();
            //             }
            //         }}>
            //         {this.props.children}
            //     </span>
            );
        }
        else {
            labelTemplate = (
                <span style={this.props.style}
                    title={(!!this.props.title) ? this.props.title : ""}
                    className={
                        "rb-label"
                        + size
                        + ((this.props.isInline === false) ? " block" : "")
                        + ((!!this.props.className) ? (" " + this.props.className) : "")
                        + ((!!this.props.hasPadding) ? " has-padding" : "")
                    }
                    onClick={() => {
                        if (!!this.props.onClick) {
                            this.props.onClick();
                        }
                    }}>
                    {this.props.children}
                </span>
            );
        }
        return labelTemplate;
    }

}

export default RbLabel;