/* eslint no-useless-escape: 0 */
import * as React from 'react';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../bosch-react/components/button/RbButton';

interface FilePickerProps {
    text: string;
    value?: any;
    onFileChange: (fileInfo: any) => void;
}

class FilePicker extends React.Component<FilePickerProps, any> {
    fileRef: React.RefObject<any> = React.createRef();
    constructor(props: FilePickerProps) {
        super(props);
        this.state = {
            errorMessage: ""
        };
        this.triggerFileInput = this.triggerFileInput.bind(this);
        this.changeFile = this.changeFile.bind(this);
        this.checkAttachment = this.checkAttachment.bind(this);
    }

    render() {
        let hiddenStyle = { 'display': 'none' };
        let showStyle = { 'display': 'block', 'marginTop': '2px' };
        let errorBlock = (
            <div className="customized-error-message">
                <div role="alert">
                    <p className="ms-TextField-errorMessage">

                        <RbLabel className="error-txt" size={LabelSize.Small}>{this.state.errorMessage}</RbLabel>
                    </p>
                </div>
            </div>
        );

        return (
            <div>
                <RbButton label={this.props.text} size={ButtonSize.Small} onClick={() => this.triggerFileInput()} />
                <input type="file" accept="application/pdf" style={hiddenStyle} ref={this.fileRef} onChange={(event) => this.changeFile(event)} />
                {(!!this.props.value) ? <RbLabel style={showStyle}>{this.props.value.name}</RbLabel> : ""}
                {(!!this.fileRef.current) ?
                    ((!!this.fileRef.current.files) ?
                        ((this.fileRef.current.files.length > 0) ? "" : errorBlock)
                        : errorBlock)
                    : errorBlock
                }

            </div>
        );
    }

    getFile() {
        return this.fileRef
    }

    private triggerFileInput() {
        this.fileRef.current.click();
    }

    private changeFile(event: React.ChangeEvent<HTMLInputElement>, callback: any = null) {
        let callbackFunc = (callback !== null) ? callback : () => { };
        if (!_.isUndefined(this.fileRef.current.files)) {
            if (this.fileRef.current.files.length > 0) {
                let check = this.checkAttachment(this.fileRef.current.files[0]);
                if (check.result === true) {
                    this.setState({
                        fileRef: this.fileRef,
                        errorMessage: ""
                    }, () => { callbackFunc(); });
                    this.props.onFileChange(this.fileRef.current.files[0]);
                }
                else {
                    event.target.value = null;
                    this.setState({
                        fileRef: React.createRef(),
                        errorMessage: check.errorMessage
                    }, () => { callbackFunc(); });
                    this.props.onFileChange(null);
                }
            }
            else {
                event.target.value = null;
                this.setState({
                    fileRef: React.createRef(),
                    errorMessage: "PDF file is required"
                }, () => { callbackFunc(); });
                this.props.onFileChange(null);
            }
        }
        else {
            event.target.value = null;
            this.setState({
                fileRef: React.createRef(),
                errorMessage: "PDF file is required"
            }, () => { callbackFunc(); });
            this.props.onFileChange(null);
        }
    }

    private checkAttachment(file: any) {
        let result = false;
        let attError = "";
        if (file.type === "application/pdf") {
            if (file.name.length > 128) {
                attError = "File name (include extension) is too long: only 128 characters supported";
            }
            else {
                let fileNameWithoutExtension = file.name.substr(0, file.name.lastIndexOf('.'));
                let rg1 = /^[^\\/:\*\~\{\}\+\&\%\#\?"<>\|.]+$/; // forbidden characters
                let rg2 = /^\./; // cannot start with dot (.)
                let isValidFileName = rg1.test(fileNameWithoutExtension) && !rg2.test(fileNameWithoutExtension);
                if (isValidFileName === false) {
                    attError = "The attached file has one of these invalid characters (~ . # % & + * { } \\ : < > ? / | \"). Kindly change the file name and upload again.";
                }
                else {
                    result = true;
                }
            }

        }
        else {
            attError = "Wrong file type: only PDF supported";
        }
        return {
            result: result,
            errorMessage: attError
        };
    }

}

export default FilePicker;