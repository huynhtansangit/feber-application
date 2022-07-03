import * as React from 'react';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { init } from '../../../store/log/rules/actions';
import { getRules } from '../../../store/log/rules/thunks';
import LogService from '../../../services/LogService';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';
import LogRuleForm from './LogRuleForm';

interface Logs_RulesProps {
    userProfile: IUserProfile | undefined,
    items: any[],
    columns: IColumn[],
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    getRules: any
}

class Logs_Rules extends React.Component<Logs_RulesProps, any> {

    logSrv: LogService = new LogService();

    constructor(props: Logs_RulesProps) {
        super(props);
        this.state = {
            ruleId: null,
            isShownNewRule: false
        };
        this.loadList = this.loadList.bind(this);
        this._confirmDeletion = this._confirmDeletion.bind(this);
    }

    componentDidMount() {
        this.loadList();
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.props.items,
            columns: this.props.columns
        };
        let element: any = "";
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            element = (
                <div className="ms-Grid">

                    {/* Button "New rule" */}
                    <div className="ms-Grid-row common-padding-row">
                        <RbButton label="New rule" size={ButtonSize.Small} onClick={() => { this.setState({ ruleId: null, isShownNewRule: true }); }} />
                    </div>

                    {/* List of rules */}
                    <Table detailsListProps={detailsListProps} height={60}></Table>

                    {/* Add New Group */}
                    {(this.state.isShownNewRule === true) ?
                        <LogRuleForm
                            ruleId={this.state.ruleId}
                            rules={this.props.items}
                            closeDialog={() => { this.setState({ isShownNewRule: false }); }}
                            refreshList={this.loadList} />
                        : ""}

                </div>
            );
        }
        return element;
    }

    loadList() {
        this.props.getRules([
            // 0 - Edit
            (item: any) => {
                this.setState({
                    ruleId: item.Id,
                    isShownNewRule: true
                });
            },
            // 1 - Remove
            (item: any) => {
                this._confirmDeletion(item);
            }
        ]);
    }

    _confirmDeletion(item: any) {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.CAUTION,
            Constants.CONFIRMATION_MESSAGE.REMOVE_RULE.replace("{0}", item.Title),
            false,
            () => {
                this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_RULE);
                this.logSrv.removeLogRule(item).then(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.LOG_MESSAGE.REMOVE_RULE.SUCCESS.replace("{0}", item.Title)
                    );
                    this.loadList();
                    this.props.showDialog(false);
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.LOG_MESSAGE.REMOVE_RULE.FAILED.replace("{0}", item.Title)
                    );
                    this.props.showDialog(false);
                });
            }
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    items: state.logRules.filteredData,
    columns: state.logRules.columns
});

export default connect(mapStateToProps, {
    confirmDialog,
    showDialog,
    showToastMessage,
    init,
    getRules,
})(Logs_Rules);