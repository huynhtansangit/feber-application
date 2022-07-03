/* eslint no-useless-escape: 0 */
import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import Color from '../../../core/libraries/Color';
import DivisionsService from '../../../services/DivisionsService';
import Constants from '../../../core/libraries/Constants';
import { connect } from 'react-redux';
import { showDialog, showToastMessage } from '../../../store/util/actions';
import _ from 'lodash';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonType, ButtonSize } from '../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';

interface NewDivisionProps {
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    divisions: any[]
    refreshList: () => {},
    closeDialog: () => {}
}

class NewDivision extends React.Component<NewDivisionProps, any> {

    divisionsSrv: DivisionsService = new DivisionsService();

    constructor(props: NewDivisionProps) {
        super(props);

        this.state = {
            clicked: false,
            isValid: false,

            shortNameRef: React.createRef(),
            longNameRef: React.createRef(),
            codeRef: React.createRef()
        };
        this.renderShortName = this.renderShortName.bind(this);
        this.renderLongName = this.renderLongName.bind(this);
        this.renderCode = this.renderCode.bind(this);
        this.renderNewDivisionTemplate = this.renderNewDivisionTemplate.bind(this);
        this.closeDialog = this.closeDialog.bind(this);

        this.checkExistingDivision = this.checkExistingDivision.bind(this);
        this.checkTextChanged = this.checkTextChanged.bind(this);
        this.onInputKey = this.onInputKey.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }

    render() {
        let element = (
            <Dialog minWidth="50vw" maxWidth="50vw"
                hidden={false}
                isDarkOverlay={true}
                onDismiss={(event: any) => {
                    if (event.currentTarget.type === "button") {
                        this.closeDialog(false);
                    }
                }}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "New Division"
                }}
            >
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        {this.renderShortName()}
                        {this.renderLongName()}
                        {this.renderCode()}
                        <div className="ms-Grid-col ms-sm12">
                            <RbLabel style={{ color: Color.GREY }}>* If the short name does not work, it must be a default system site. You should use code instead to make it works.</RbLabel>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked || this.state.isValid === false} onClick={() => this.closeDialog(true)} label="Create" />
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Small} disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />
                </DialogFooter>
            </Dialog>
        );
        return element;
    }

    renderShortName() {
        return this.renderNewDivisionTemplate("Short name",
            <RbTextField placeholder="Example: M" ref={this.state.shortNameRef} onPaste={(event) => {
                this.onPaste("short", event);
            }} onKeyDown={(event) => {
                this.onInputKey("short", event);
            }} onChange={this.checkTextChanged} />);
    }

    renderLongName() {
        return this.renderNewDivisionTemplate("Long name",
            <RbTextField placeholder="Example: M Control Level BBM" ref={this.state.longNameRef} onPaste={(event) => {
                this.onPaste("long", event);
            }} onKeyDown={(event) => {
                this.onInputKey("long", event);
            }} onChange={this.checkTextChanged} />);
    }

    renderCode() {
        return this.renderNewDivisionTemplate("Code (optional)",
            <RbTextField placeholder="Example: MM" ref={this.state.codeRef} onPaste={(event) => {
                this.onPaste("code", event);
            }} onKeyDown={(event) => {
                this.onInputKey("code", event);
            }} onChange={this.checkTextChanged} />);
    }

    renderNewDivisionTemplate(label: string, field: any) {
        return (
            <div className="ms-Grid-col ms-sm12">
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm3"><RbLabel hasPadding={true}>{label}</RbLabel></div>
                        <div className="ms-Grid-col ms-sm9">
                            {field}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    closeDialog(isSaved = false) {
        if (isSaved === true) {
            let shortName = this.state.shortNameRef.current.getValue().trim();
            let longName = this.state.longNameRef.current.getValue().trim();
            let code = this.state.codeRef.current.getValue().trim();

            let check = this.checkExistingDivision(shortName, code);
            if (check === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.INFO,
                    Constants.DIVISION_MESSAGE.CREATE.EXISTED.replace("{0}", longName)
                );
            }
            else {
                this.props.showDialog(Constants.DIALOG_MESSAGE.CREATE_NEW_DIVISION);
                this.divisionsSrv.createNewDivision(shortName, longName, code).then((result: any) => {
                    if (result.status === "Success") {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.DIVISION_MESSAGE.CREATE.SUCCESS.replace("{0}", longName)
                        );
                        this.props.showDialog(false);
                        this.props.refreshList();
                        this.closeDialog();
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            result.error
                        );
                        this.props.showDialog(false);
                    }
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.DIVISION_MESSAGE.CREATE.FAILED.replace("{0}", longName)
                    );
                    this.props.showDialog(false);
                });
            }
        }
        else {
            this.props.closeDialog();
        }
    }

    checkExistingDivision(shortName: string, code: string) {
        let isExisted = false;
        this.props.divisions.forEach((division: any) => {
            if (division.ShortName.toLowerCase() === shortName.toLowerCase() || division.ShortName.toLowerCase() === code.toLowerCase()
                || ((!_.isNil(division.Code)) ?
                    (division.Code.toLowerCase() === shortName.toLowerCase() || division.Code.toLowerCase() === code.toLowerCase())
                    : false)) {
                isExisted = true;
            }
        });
        return isExisted;
    }

    checkTextChanged() {
        let shortName = this.state.shortNameRef.current.getValue().trim();
        let longName = this.state.longNameRef.current.getValue().trim();
        this.setState({
            isValid: shortName !== "" && longName !== ""
        });
    }

    onInputKey(field: string, event: any) {
        let isShortOrCode = field === "short" || field === "code";
        let regex = (isShortOrCode === true) ?
            /^[a-zA-Z0-9_-]/
            : /^[|\\"'\/[\]:<>+=,;?*@]/;
        if (regex.test(event.key) === (isShortOrCode === true) ? false : true) {
            event.preventDefault();
        }
    }

    onPaste(field: string, e: any) {
        let isShortOrCode = field === "short" || field === "code";
        let regex = (isShortOrCode === true) ?
            /^[a-zA-Z0-9_-]/
            : /^[|\\"'\/[\]:<>+=,;?*@]/;
        let text = e.clipboardData.getData('Text');
        let valid = true;
        for (let index = 0; index < text.length; index++) {
            const character = text[index];
            if (regex.test(character) === (isShortOrCode === true) ? false : true) {
                valid = false;
            }
        }
        if (valid === false) {
            if (!_.isUndefined(e)) {
                e.preventDefault();
            }
        }
    }

}

export default connect(null, { showDialog, showToastMessage })(NewDivision);