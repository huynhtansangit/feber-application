/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import { MarqueeSelection, SelectionMode, Selection } from '@fluentui/react/lib/MarqueeSelection';
import { DetailsList, DetailsListLayoutMode } from '@fluentui/react/lib/DetailsList';
import MoveReport_MoveInformation from '../components/MoveReport_MoveInformation';
import MoveReport_AdditionalInformation from '../components/MoveReport_AdditionalInformation';
import Helper from '../../../core/libraries/Helper';
import SearchService from '../../../services/SearchService';
import DataValidation from '../../../core/libraries/DataValidation';
import SystemService from '../../../services/SystemService';
import DepartmentService from '../../../services/DepartmentService';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel from '../../../bosch-react/components/label/RbLabel';

interface MoveReportProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog
}

class MoveReport extends React.Component<MoveReportProps, any> {

    searchSrv: SearchService = new SearchService();

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    moveInfoRef: React.RefObject<any> = React.createRef();

    additionalInfoRef: React.RefObject<any> = React.createRef();

    constructor(props: MoveReportProps) {
        super(props);

        this.state = {
            moveItem: null,
            toUploadType: "",
            reportTypes: [],
        };
        this.renderGeneralInformation = this.renderGeneralInformation.bind(this);
        this.renderMoveInformation = this.renderMoveInformation.bind(this);
        this.renderAdditionalInformation = this.renderAdditionalInformation.bind(this);

        this.updateUploadType = this.updateUploadType.bind(this);

        this.validateAdditionalInformation = this.validateAdditionalInformation.bind(this);
        this.move = this.move.bind(this);
        this.closeDialogWithMessage = this.closeDialogWithMessage.bind(this);
    }

    componentDidMount() {
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            let searchPart = window.location.hash.toLowerCase();
            if (searchPart.indexOf("?guid=") > -1) {
                // Get report
                this.searchSrv.searhReportByGuid(searchPart.split("?guid=")[1]).then((rs: any) => {
                    console.log(">>>>> Check searchReportByGuid",rs)
                    let path=rs.results[0].Path.split('/'+rs.results[0].UploadType)[0];
                    if (rs.results.length > 0) {
                        this.departmentListsSrv.getListItemBySearchResult(rs.results[0],path).then((rs: any) => {
                            if (!_.isNil(rs.ReportAuthor.results)) {
                                let authors: string[] = [];
                                rs.ReportAuthor.results.forEach((author: any) => {
                                    authors.push(author.Title);
                                });
                                rs.ReportAuthors = authors.join("; ");
                            }
                            else {
                                rs.ReportAuthors = "";
                            }
                            //User Story 104711: Auto-fill Report Date
                            console.log(rs);
                            if(rs.DocumentDate === null) {
                                let currentDate = new Date().toISOString();
                                if (rs.FeberUploadDate === null) {
                                    rs.FeberUploadDate = currentDate;
                                }
                                if (rs.FeberApproveDate === null) {
                                    rs.FeberApproveDate = currentDate;
                                }
                            }
                            else {
                                if (rs.FeberUploadDate === null) {
                                    rs.FeberUploadDate = rs.DocumentDate;
                                }
                                if (rs.FeberApproveDate === null) {
                                    rs.FeberApproveDate = rs.DocumentDate;
                                }
                            }

                            // if (rs.FeberUploadDate === '') {
                            //     rs.FeberUploadDate = rs.DocumentDate;
                            // }
                            // if (rs.FeberApproveDate === '') {
                            //     rs.FeberApproveDate = rs.DocumentDate;
                            // }
                            //--
                            this.setState({
                                moveItem: rs
                            });
                        }).catch(() => {
                            this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.NOT_FOUND);
                        });
                    }
                    else {
                        this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.NOT_FOUND);
                    }
                }).catch(() => {
                    this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.NOT_FOUND);
                });
                // Get report types for RnD
                this.systemListsSrv.getReportType("RnDTypeMaster").then((results: any[]) => {
                    let reportTypes: any[] = []
                    results.forEach((reportType: any) => {
                        reportTypes.push({ key: reportType.Title, text: reportType.Title });
                    });
                    this.setState({ reportTypes: reportTypes });
                }).catch(() => {

                });
            }
            else {
                this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.WRONG_LINK);
            }
        }
        else {
            this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.CONTENT);
        }
    }

    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm1" />
                    <div className="ms-Grid-col ms-sm10">

                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <RbLabel className="header-title">Move Report</RbLabel>
                            </div>
                            {this.renderGeneralInformation()}
                            <div className="ms-Grid-row">
                                {(!_.isNil(this.state.moveItem)) ? this.renderMoveInformation() : ""}
                                {(!_.isNil(this.state.moveItem)) ? this.renderAdditionalInformation() : ""}
                            </div>
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12">
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>
            </div>
        );
    }

    renderGeneralInformation() {
        let columns = [
            {
                key: 'title', name: 'Title', fieldName: 'Title',
                currentWidth: Helper.resizeColumnByScreenWidth(20),
                minWidth: Helper.resizeColumnByScreenWidth(20), isResizable: true
            },
            {
                key: 'uploadType', name: 'Upload Type', fieldName: 'UploadType',
                currentWidth: Helper.resizeColumnByScreenWidth(20),
                minWidth: Helper.resizeColumnByScreenWidth(20), isResizable: true
            },
            {
                key: 'securityClass', name: 'Security Class', fieldName: 'SecurityClass',
                currentWidth: Helper.resizeColumnByScreenWidth(20),
                minWidth: Helper.resizeColumnByScreenWidth(20), isResizable: true
            },
            {
                key: 'department', name: 'Department', fieldName: 'FeberDepartment',
                currentWidth: Helper.resizeColumnByScreenWidth(20),
                minWidth: Helper.resizeColumnByScreenWidth(20), isResizable: true
            },
            {
                key: 'authors', name: 'Authors', fieldName: 'ReportAuthors',
                currentWidth: Helper.resizeColumnByScreenWidth(20),
                minWidth: Helper.resizeColumnByScreenWidth(20), isResizable: true
            },
        ];
        return (
            <div className="ms-Grid-row">
                <MarqueeSelection selection={new Selection()}>
                    <DetailsList
                        compact={true}
                        items={[this.state.moveItem]}
                        columns={columns}
                        setKey="set"
                        selectionMode={SelectionMode.none}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        onShouldVirtualize={() => { return false; }}
                    />
                </MarqueeSelection>
            </div>
        );
    }

    renderMoveInformation() {
        if (!_.isNil(this.state.moveItem)) {
            return (
                <div className="ms-Grid-col ms-sm6">
                    <MoveReport_MoveInformation ref={this.moveInfoRef} moveItem={this.state.moveItem} updateUploadType={this.updateUploadType} move={this.move}></MoveReport_MoveInformation>
                </div>
            );
        }
        return "";
    }

    renderAdditionalInformation() {
        if (!_.isNil(this.state.moveItem)) {
            return (
                <div className="ms-Grid-col ms-sm6">
                    <MoveReport_AdditionalInformation ref={this.additionalInfoRef} moveItem={this.state.moveItem} reportTypes={this.state.reportTypes} toUploadType={this.state.toUploadType}></MoveReport_AdditionalInformation>
                </div>
            );
        }
        return "";
    }

    closeDialogWithMessage(message: string) {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.TITLE,
            message,
            true,
            () => {
                // Javascript close dialog
                window.close();
                // If close does not work, return to home page
                window.location.href = Environment.rootWeb;
            }
        );
    }

    updateUploadType(uploadType: string) {
        this.setState({ toUploadType: uploadType });
    }

    move() {
        // Validation
        let validationResult = (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) ?
            this.validateAdditionalInformation(this.additionalInfoRef.current) : true;
        // Move
        if (validationResult === true) {
            this.props.showDialog(Constants.DIALOG_MESSAGE.MOVE_REPORT);
            this.departmentListsSrv.moveSingleReport(this.props.userProfile.userToken, 
                {
                permissions: this.props.userProfile?.permissions,
                sourceReport: this.state.moveItem,
                moveInfo: this.moveInfoRef.current.state,
                additionalInfo: this.additionalInfoRef.current.state
            }).then((rs: boolean) => {
                this.props.showDialog(false);
                if (rs === true) {
                    this.closeDialogWithMessage(Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.SUCCESS);
                }
                else {
                    this.props.confirmDialog(
                        Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.TITLE,
                        Constants.CONFIRMATION_MESSAGE.MOVE_REPORT.ERROR,
                        true,
                        () => {
                            this.props.confirmDialog(false);
                        }
                    );
                }
            });
        }
    }

    validateAdditionalInformation(additionalInfo: any) {
        let result = true;
        let fromUploadType = this.state.moveItem.UploadType;
        let toUploadType = this.state.toUploadType;
        let validationObj: any = {};
        switch (fromUploadType) {
            case Constants.DOCUMENT_TYPE.RnD:
                {
                    switch (toUploadType) {
                        case Constants.DOCUMENT_TYPE.RnD:
                            {
                                // Report contains export controlled material - has default value: false
                                // Security class
                                let checkSC = DataValidation.dropdownValidation(additionalInfo.state.securityClass, "security class", true);
                                validationObj.securityClass = checkSC;
                                result = result && checkSC === "";
                                break;
                            }
                        case Constants.DOCUMENT_TYPE.LL:
                            {
                                // Product & Process
                                let checkProduct = DataValidation.textValidation(additionalInfo.state.product, "product", true, null, 250);
                                let checkProcess = DataValidation.textValidation(additionalInfo.state.process, "process", true, null, 250);
                                if (checkProduct !== "" && checkProcess !== "") {
                                    if (checkProcess.indexOf("maximum") === -1) {
                                        validationObj.product = checkProduct;
                                    }
                                    if (checkProduct.indexOf("maximum") === -1) {
                                        validationObj.process = checkProcess;
                                    }
                                    result = false;
                                }
                                // Plant/Business unit
                                let checkPlantBU = DataValidation.textValidation(additionalInfo.state.plantBU, "plant or business unit", true);
                                validationObj.plantBU = checkPlantBU;
                                result = result && checkPlantBU === "";
                                // IQIS number
                                let checkIQISNumber = DataValidation.textValidation(additionalInfo.state.iqisNumber, "IQIS number", false, null, 250);
                                validationObj.iqisNumber = checkIQISNumber;
                                result = result && checkIQISNumber === "";
                                break;
                            }
                        default: {
                            break;
                        }
                    }
                    break;
                }
            case Constants.DOCUMENT_TYPE.LL:
                {
                    switch (toUploadType) {
                        case Constants.DOCUMENT_TYPE.RnD:
                            {
                                // Abstract
                                let checkAbstract = DataValidation.textValidation(additionalInfo.state.abstract, "abstract", true);
                                validationObj.abstract = checkAbstract;
                                result = result && checkAbstract === "";
                                // Report type
                                let checkReportType = DataValidation.dropdownValidation(additionalInfo.state.reportType, "report type", true);
                                validationObj.reportType = checkReportType;
                                result = result && checkReportType === "";
                                // Report contains export controlled material - has default value: false
                                // Security class
                                let checkSC = DataValidation.dropdownValidation(additionalInfo.state.securityClass, "security class", true);
                                validationObj.securityClass = checkSC;
                                result = result && checkSC === "";
                                // Report number
                                let checkReportNumber = DataValidation.textValidation(additionalInfo.state.reportNumber, "report number", false, null, 250);
                                validationObj.reportNumber = checkReportNumber;
                                result = result && checkReportNumber === "";
                                // Project number
                                let checkProjectNumber = DataValidation.textValidation(additionalInfo.state.projectNumber, "project number", false, null, 250);
                                validationObj.projectNumber = checkProjectNumber;
                                result = result && checkProjectNumber === "";
                                break;
                            }
                        case Constants.DOCUMENT_TYPE.LL:
                            {
                                // No additional information
                                break;
                            }
                        default: {
                            break;
                        }
                    }
                    break;
                }
        }
        additionalInfo.setState({ validationMessage: validationObj });
        return result;
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showDialog })(MoveReport);