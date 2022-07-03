import * as React from 'react';
import { IDetailsListProps } from '@fluentui/react/lib/DetailsList';
import Helper from '../../../core/libraries/Helper';
import SystemService from '../../../services/SystemService';
import DepartmentService from '../../../services/DepartmentService';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import { showDialog, showToastMessage, confirmDialog } from '../../../store/util/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize } from '../../../bosch-react/components/button/RbButton';

interface DeptMgm_CleanUpProps {
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage
}

class DeptMgm_CleanUp extends React.Component<DeptMgm_CleanUpProps, any> {

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    constructor(props: DeptMgm_CleanUpProps) {
        super(props);

        this.state = {
            isLoaded: false,
            hasEmptyLists: true,
            columns: [
                {
                    key: 'divisionName',
                    name: 'Division Name',
                    fieldName: 'DivisionName',
                    currentWidth: Helper.resizeColumnByScreenWidth(40),
                    minWidth: Helper.resizeColumnByScreenWidth(40),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.DivisionName}</RbLabel>);
                    }
                },
                {
                    key: 'rndEmptyLists',
                    name: 'RnD Empty Lists',
                    fieldName: 'RnDEmptyLists',
                    currentWidth: Helper.resizeColumnByScreenWidth(15),
                    minWidth: Helper.resizeColumnByScreenWidth(15),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.RnDEmptyLists}</RbLabel>);
                    }
                },
                {
                    key: 'llEmptyLists',
                    name: 'LL Empty Lists',
                    fieldName: 'LLEmptyLists',
                    currentWidth: Helper.resizeColumnByScreenWidth(15),
                    minWidth: Helper.resizeColumnByScreenWidth(15),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.LLEmptyLists}</RbLabel>);
                    }
                },
                {
                    key: 'thesisEmptyLists',
                    name: 'Thesis Empty Lists',
                    fieldName: 'ThesisEmptyLists',
                    currentWidth: Helper.resizeColumnByScreenWidth(15),
                    minWidth: Helper.resizeColumnByScreenWidth(15),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.ThesisEmptyLists}</RbLabel>);
                    }
                },
                {
                    key: 'paperEmptyLists',
                    name: 'Paper Empty Lists',
                    fieldName: 'PaperEmptyLists',
                    currentWidth: Helper.resizeColumnByScreenWidth(15),
                    minWidth: Helper.resizeColumnByScreenWidth(15),
                    isResizable: true,
                    onRender: (item: any) => {
                        return (<RbLabel size={LabelSize.Small}>{item.PaperEmptyLists}</RbLabel>);
                    }
                }
            ],
            items: [],
            emptyLists: []
        };
        this.loadData = this.loadData.bind(this);
        this.countEmptyLists = this.countEmptyLists.bind(this);
        this.cleanOut = this.cleanOut.bind(this);
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.state.items,
            columns: this.state.columns
        };
        let element: any = "";
        if (this.state.isLoaded === false) {
            element = (
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row" title="Check empty department lists"
                        style={{ textAlign: "center", cursor: "pointer", marginTop: "10%" }}
                        onClick={this.loadData}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <span className="rb-ic rb-ic-sync" />&nbsp;
                            <RbLabel style={{ cursor: "pointer" }}>Check empty department lists</RbLabel>

                        </div>


                    </div>
                </div>
            );
        }
        else {
            element = (
                <div className="ms-Grid">

                    {/* Button "Clean out" */}
                    {(this.state.hasEmptyLists === true) ?
                        <div className="ms-Grid-row common-padding-row">
                            <RbButton label="Clean out" size={ButtonSize.Small} onClick={this.cleanOut} />
                        </div>
                        : ""}

                    {(this.state.hasEmptyLists === true) ?
                        // List of Divisions
                        <Table detailsListProps={detailsListProps} height={50}></Table>
                        :
                        // Empty 
                        <div className="ms-Grid-row" style={{ textAlign: "center", marginTop: "10%" }}>
                            <RbLabel>There is no empty list from all divisions.</RbLabel>
                        </div>
                    }

                </div>
            );
        }
        return element;
    }

    loadData() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.COUNT_EMPTY_LISTS);
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            let rs: any[] = [];
            for(let i = 0; i < results.length; i++) {
                rs.push({
                    DivisionCode: (results[i].DivisionCode !== "" && !_.isNil(results[i].DivisionCode)) ? results[i].DivisionCode : results[i].Title,
                    DivisionName: results[i].DivisionName,
                    RnDEmptyLists: 0,
                    LLEmptyLists: 0,
                    ThesisEmptyLists: 0,
                    PaperEmptyLists: 0
                }); 
                setTimeout(() => {

                },1000)
            }
            Helper.sortObjects(rs, "DivisionName");
            this.countEmptyLists(rs);
        });
    }

    countEmptyLists(divisionsList: any[]) {
        // Get division code only
        let divisionCodeArr: any[] = [];
        divisionsList.forEach(division => { divisionCodeArr.push(division.DivisionCode); });
        this.departmentListsSrv.countEmptyLists(divisionCodeArr).then((results: any[]) => {
            let items: any[] = divisionsList;
            let emptyLists: any[] = [];
            let hasEmptyLists = false;
            for (let index = 0; index < items.length; index++) {
                items[index].RnDEmptyLists = results[index].RnDEmptyLists;
                items[index].LLEmptyLists = results[index].LLEmptyLists;
                items[index].ThesisEmptyLists = results[index].ThesisEmptyLists;
                items[index].PaperEmptyLists = results[index].PaperEmptyLists;
                emptyLists.push.apply(emptyLists, results[index].emptyLists);
                if (items[index].RnDEmptyLists !== 0 || items[index].LLEmptyLists !== 0
                    || items[index].ThesisEmptyLists !== 0 || items[index].PaperEmptyLists !== 0) {
                    hasEmptyLists = true;
                }
            }
            this.setState({
                isLoaded: true,
                items: items,
                emptyLists: emptyLists,
                hasEmptyLists: hasEmptyLists
            });
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.CLEAN_UP_DEPARTMENTS_MESSAGE.CANNOT_COUNT_EMPTY_LISTS
            );
            this.props.showDialog(false);
        });
    }

    cleanOut() {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.CAUTION,
            Constants.CONFIRMATION_MESSAGE.CLEAN_UP,
            false,
            () => {
                this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_EMPTY_LISTS);
                this.departmentListsSrv.removeEmptyLists(this.state.emptyLists).then(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.SUCCESS,
                        Constants.CLEAN_UP_DEPARTMENTS_MESSAGE.SUCCESS
                    );
                    this.props.showDialog(false);
                    this.setState({ isLoaded: false });
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.CLEAN_UP_DEPARTMENTS_MESSAGE.FAILED
                    );
                    this.props.showDialog(false);
                    this.setState({ isLoaded: false });
                });
            }
        );
    }

}

export default connect(null, { confirmDialog, showDialog, showToastMessage })(DeptMgm_CleanUp);