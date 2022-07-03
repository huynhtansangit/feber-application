import * as React from 'react';
import Color from '../../../core/libraries/Color';
import DivisionsService from '../../../services/DivisionsService';
import Constants from '../../../core/libraries/Constants';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { Dropdown,IDetailsListProps } from '@fluentui/react';
import Table from '../../../core/components/Table';
import { init, changeFilter, search } from '../../../store/log/view/actions';
import { getLogContent, getLogFiles } from '../../../store/log/view/thunk';
import { getRules } from '../../../store/log/rules/thunks';
import { ILogTable } from '../../../store/log/view/types';
import Helper from '../../../core/libraries/Helper';
import RbLabel from '../../../bosch-react/components/label/RbLabel';
import RbSearchField from '../../../bosch-react/components/search-field/RbSearchField';

interface Logs_ViewProps {
    userProfile: IUserProfile | undefined,
    log: ILogTable,
    rules: any[],
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    changeFilter: typeof changeFilter,
    search: typeof search,
    getLogFiles: any,
    getLogContent: any,
    getRules: any
}

class Logs_View extends React.Component<Logs_ViewProps, any> {

    searchBoxRef: React.RefObject<any> = React.createRef();

    divisionsSrv: DivisionsService = new DivisionsService();

    constructor(props: Logs_ViewProps) {
        super(props);
        this._renderItemColumn = this._renderItemColumn.bind(this);
    }

    componentDidMount() {
        this.props.getRules(() => { }, () => { }, () => {
            this.props.init();
        });
    }

    render() {
        let element: any = "";
        let detailsListProps: IDetailsListProps = {
            items: (this.props.log.keyword.trim() === "") ?
                this.props.log.filteredData
                : (this.props.log.filteredData.filter(x => (x.Details as string).toLowerCase().indexOf(this.props.log.keyword.toLowerCase()) > -1
                    || (x.Error as string).toLowerCase().indexOf(this.props.log.keyword.toLowerCase()) > -1)),
            columns: this.props.log.columns,
            onRenderItemColumn: this._renderItemColumn
        };
        // Define error name
        detailsListProps.items.forEach((item: any) => {
            if (item.Type === "ERROR") {
                let isUndefined = true;
                this.props.rules.forEach((rule: any) => {
                    let keywords: string[] = (rule.Keywords as string).split(";");
                    let isMatched = true;
                    keywords.forEach((keyword: string) => {
                        isMatched = isMatched && ((item.Details as string).indexOf(keyword.trim()) > -1) && keyword.trim() !== "";
                    });
                    if (isMatched === true) {
                        item.Error = rule.Title;
                        isUndefined = false;
                    }
                });
                if (isUndefined === true) {
                    item.Error = "Undefined";
                }
            }
        });
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            element = (
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm1"><RbLabel hasPadding={true}>Log type</RbLabel></div>
                        <div className="ms-Grid-col ms-sm4">
                            <Dropdown
                                selectedKey={this.props.log.type}
                                placeholder="Choose log type ..."
                                options={Constants.DD_LOG_TYPE_OPTIONS}
                                onChange={(event, option) => {
                                    this.props.changeFilter("mode", "ERROR");
                                    this.props.search("", () => {
                                        this.props.changeFilter("type", option.key);
                                        this.props.getLogFiles(option.key);
                                    });
                                }}
                            />
                        </div>
                    </div>

                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm1"><RbLabel hasPadding={true}>Log file</RbLabel></div>
                        <div className="ms-Grid-col ms-sm4">
                            <Dropdown
                                selectedKey={this.props.log.file}
                                placeholder="Choose log file ..."
                                options={this.props.log.files}
                                disabled={this.props.log.files.length === 0}
                                onChange={(event, option) => {
                                    this.props.changeFilter("mode", "ERROR");
                                    this.props.changeFilter("", null);
                                    Helper.runNewTask(() => {
                                        this.props.search("", () => {
                                            this.props.changeFilter("file", option.key);
                                            this.props.getLogContent(option.key);
                                        });
                                    });
                                }}
                            />
                        </div>
                    </div>

                    {(this.props.log.file !== "") ?
                        <React.Fragment>
                            <div className="ms-Grid-row common-padding-row">
                                <RbLabel style={{ color: Color.BLUE }}><h3 style={{ margin: "0px" }}>{this.props.log.file}</h3></RbLabel>
                            </div>

                            <div className="ms-Grid-row common-padding-row">
                                <div className="ms-Grid-col ms-sm2">
                                    <Dropdown
                                        selectedKey={this.props.log.mode}
                                        placeholder="Filter ..."
                                        options={Constants.DD_LOG_MODE_OPTIONS}
                                        onChange={(event, option) => {
                                            this.props.changeFilter("", null);
                                            this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIVE);
                                            Helper.runNewTask(() => {
                                                this.props.search("", () => {
                                                    this.props.changeFilter("mode", option.key);
                                                    this.props.showDialog(false);
                                                });
                                            });
                                        }}
                                    />
                                </div>
                                <div className="ms-Grid-col ms-sm6" />
                                <div className="ms-Grid-col ms-sm4">
                                    <RbSearchField placeholder="Search..."
                                        onChange={(event) => {
                                            this.props.changeFilter("", null);
                                            this.props.search(event.currentTarget.value, () => {
                                                this.props.changeFilter("mode", this.props.log.mode);
                                                Helper.runNewTask(() => {
                                                    this.forceUpdate();
                                                });
                                            });
                                        }
                                        } />
                                </div>
                            </div>
                            {(this.props.log.filteredData.length > 0) ?
                                <div className="ms-Grid-row common-padding-row">
                                    <Table detailsListProps={detailsListProps} height={60}></Table>
                                </div>
                                : null}

                        </React.Fragment> : null
                    }

                </div>
            );
        }
        return element;
    }

    _renderItemColumn(item: any, index: number | undefined, column: any) {
        let content: any = "";
        switch (column.key) {
            case "type": {
                content = "";
                switch (item[column.fieldName]) {
                    case "ERROR": {
                        content = <span className="rb-ic rb-ic-abort-frame-black" />;
                        break;
                    }
                    case "INFO": {
                        content = <span className="rb-ic rb-ic-info-i-frame" />;
                        break;
                    }
                }
                break;
            }
            default: {
                content = <span>{item[column.fieldName]}</span>;
                break;
            }
        }
        return content;
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    log: state.log,
    rules: state.logRules.data
});

export default connect(mapStateToProps, {
    confirmDialog,
    showDialog,
    showToastMessage,
    init,
    changeFilter,
    search,
    getLogFiles,
    getLogContent,
    getRules
})(Logs_View);