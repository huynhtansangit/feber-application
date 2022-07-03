import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import Constants from '../../../core/libraries/Constants';
import Template from '../../../core/libraries/Template';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import LogService from '../../../services/LogService';
import Helper from '../../../core/libraries/Helper';
import RbButton, { ButtonType } from '../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../bosch-react/components/text-field/RbTextField';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';

interface LogRuleFormProps {
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    ruleId: any,
    rules: any[],
    refreshList: () => {},
    closeDialog: () => {}
}

class LogRuleFrom extends React.Component<LogRuleFormProps, any> {

    logSrv: LogService = new LogService();

    oldMembers: any[] = [];

    constructor(props: LogRuleFormProps) {
        super(props);

        this.state = {
            clicked: false,
            isValid: false,

            ruleNameRef: React.createRef(),
            keywordsRef: React.createRef()
        };
        this.renderRuleName = this.renderRuleName.bind(this);
        this.renderKeywords = this.renderKeywords.bind(this);
        this.closeDialog = this.closeDialog.bind(this);

        this.createRule = this.createRule.bind(this);
        this.editRule = this.editRule.bind(this);
        this.checkTextChanged = this.checkTextChanged.bind(this);
    }

    componentDidMount() {
        if (!_.isNil(this.props.ruleId)) {
            this.logSrv.getRuleById(this.props.ruleId).then((result: any) => {
                (this.state.ruleNameRef as React.RefObject<any>).current.setValue(result.Title);
                (this.state.keywordsRef as React.RefObject<any>).current.setValue(result.Keywords);
                this.checkTextChanged();
            });
        }
        else {
            Helper.runNewTask(() => {
                (this.state.ruleNameRef as React.RefObject<any>).current.setValue("");
                (this.state.keywordsRef as React.RefObject<any>).current.setValue("");
            });
        }
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
                    title: (_.isNil(this.props.ruleId)) ? "New Rule" : "Edit Rule"
                }}
            >
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        {this.renderRuleName()}
                        {this.renderKeywords()}
                    </div>
                </div>

                <DialogFooter>
                    <RbButton type={ButtonType.Secondary} disabled={this.state.clicked || this.state.isValid === false} onClick={() => this.closeDialog(true)} label={(_.isNil(this.props.ruleId)) ? "Create" : "Update"} />
                    <RbButton type={ButtonType.Secondary} disabled={this.state.clicked} onClick={() => this.closeDialog(false)} label="Cancel" />
                </DialogFooter>
            </Dialog>
        );
        return element;
    }

    renderRuleName() {
        return Template.renderCommonTemplate("Rule name",
            <RbTextField ref={this.state.ruleNameRef} placeholder="Type rule name ..." onChange={this.checkTextChanged} />,
            false, 4, 8, 12);
    }

    renderKeywords() {
        return Template.renderCommonTemplate("Keywords",
            <React.Fragment>
                <RbTextField ref={this.state.keywordsRef} isMultiple={true} minRows={5} placeholder="Type keywords ..." onChange={this.checkTextChanged} />
                <RbLabel size={LabelSize.Small}>Use separator semicolon ";" for multiple keywords</RbLabel>
            </React.Fragment>,
            false, 4, 8, 12);
    }

    closeDialog(isSaved = false) {
        if (isSaved === true) {
            let ruleName = this.state.ruleNameRef.current.getValue().trim();
            let keywords = this.state.keywordsRef.current.getValue().trim();
            if (_.isNil(this.props.ruleId)) {
                this.createRule(ruleName, keywords);
            }
            else {
                this.editRule(ruleName, keywords);
            }
        }
        this.props.closeDialog();
    }

    createRule(ruleName: string, keywords: string) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.CREATE_NEW_RULE);
        this.logSrv.createRule(ruleName, keywords).then((result: any) => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                Constants.LOG_MESSAGE.CREATE_RULE.SUCCESS.replace("{0}", ruleName)
            );
            this.props.showDialog(false);
            this.props.refreshList();
            this.closeDialog();
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.LOG_MESSAGE.CREATE_RULE.FAILED.replace("{0}", ruleName)
            );
            this.props.showDialog(false);
        });
    }

    editRule(ruleName: string, keywords: string) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.UPDATE_RULE);
        this.logSrv.editRule(this.props.ruleId, ruleName, keywords).then((result: any) => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                Constants.LOG_MESSAGE.UPDATE_RULE.SUCCESS.replace("{0}", ruleName)
            );
            this.props.showDialog(false);
            this.props.refreshList();
            this.closeDialog();
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.LOG_MESSAGE.UPDATE_RULE.FAILED.replace("{0}", ruleName)
            );
            this.props.showDialog(false);
        });

    }

    checkTextChanged() {
        let ruleName = this.state.ruleNameRef.current.state.value.trim();
        let keywords = this.state.keywordsRef.current.state.value.trim();
        this.setState({
            isValid: ruleName !== "" && keywords !== ""
        });
    }

}

export default connect(null, { confirmDialog, showDialog, showToastMessage })(LogRuleFrom);