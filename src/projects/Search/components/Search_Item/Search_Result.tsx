/* eslint react/jsx-pascal-case: 0 */
/* eslint react/no-direct-mutation-state: 0 */
import * as React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react/lib/Callout';
import Search_HoverPanel from './Search_HoverPanel';
import Helper from '../../../../core/libraries/Helper';
import SearchService from '../../../../services/SearchService';
import SystemService from '../../../../services/SystemService';
import Environment from '../../../../Environment';
import DepartmentService from '../../../../services/DepartmentService';
import Constants from '../../../../core/libraries/Constants';
import MigrationService from '../../../../services/MigrationService';
import { IUserProfile, IUserPermissions } from '../../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../../store/util/actions';
import { RootState } from '../../../../store/configureStore';
import { connect } from 'react-redux';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../../../bosch-react/components/label/RbLabel';
import RbLoadingSpinner from '../../../../bosch-react/components/loading-spinner/RbLoadingSpinner';
import { BoschColor } from '../../../../bosch-react/constants/color';
import RbButton, { ButtonType } from '../../../../bosch-react/components/button/RbButton';

interface Search_ResultProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    data: any
}

class Search_Result extends React.Component<Search_ResultProps, any> {

    searchSrv: SearchService = new SearchService();

    systemListsSrv: SystemService = new SystemService();

    departmentListsSrv: DepartmentService = new DepartmentService();

    migrationDataSrv: MigrationService = new MigrationService();

    constructor(props: Search_ResultProps) {
        super(props);

        this.state = {
            HasPermission: null,
            ItemRef: React.createRef(),
            IsHoverPanelDisplayed: false,
            HoverStatuses: {
                item: false,
                panel: false
            },
            Commands: [],
            IsAddingBookmark: false,
            IsBookmarked: -1,
            IsExportLLDialogShown: false
        };

        this.prepareCommandMenu = this.prepareCommandMenu.bind(this);
        this.checkShowAdminCommands = this.checkShowAdminCommands.bind(this);
        this.checkShowNormalCommands = this.checkShowNormalCommands.bind(this);

        this.checkPermissionSession = this.checkPermissionSession.bind(this);
        this.showHoverPanel = this.showHoverPanel.bind(this);
        this.handleCommand = this.handleCommand.bind(this);

        this.renderCommandButtons = this.renderCommandButtons.bind(this);

        this.downloadFile = this.downloadFile.bind(this);

        this.forwardEmail = this.forwardEmail.bind(this);
        this.addBookmark = this.addBookmark.bind(this);
        this.openRemoveBookmarkDialog = this.openRemoveBookmarkDialog.bind(this);
        this.removeBookmark = this.removeBookmark.bind(this);
        this.closeExportLLDialog = this.closeExportLLDialog.bind(this);
        this.closeDeleteReportDialog = this.closeDeleteReportDialog.bind(this);
    }

    componentDidMount() {
        // Get bookmark
        this.systemListsSrv.getAllBookmarksByUser(this.props.userProfile?.id as number).then((results: any) => {
            this.setState({
                IsBookmarked: Helper.checkBookmarked(this.props.data.Guid, results)
            });
        });
        // Get Commands
        this.prepareCommandMenu((adminCommands: any[], normalCommands: any[], noAccessCommands: any[]) => {
            // Get Admin Commands
            this.checkShowAdminCommands(adminCommands, () => {
                // Get Normal Commands
                this.checkShowNormalCommands(normalCommands, noAccessCommands);
            });
        });
    }

    render() {
        let fileIcon = null;
        switch (this.state.HasPermission) {
            case true: {
                fileIcon = <span className="search-document-icon rb-ic rb-ic-document-pdf pointer" onClick={this.downloadFile} />;
                break;
            }
            case false: {
                fileIcon = <span className="search-document-icon rb-ic rb-ic-lock-closed pointer" onClick={this.downloadFile} />;
                break;
            }
            case null: {
                fileIcon = <RbLoadingSpinner />;
                break;
            }
        }
        let element = (
            <div className="ms-Grid" style={{ marginTop: "10px", marginBottom: "10px" }}>
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm9" style={{ paddingLeft: "0px", paddingRight: "10vw" }} onMouseOver={() => this.showHoverPanel(true, "item")} onMouseLeave={() => this.showHoverPanel(false, "item")}>

                        <div className="ms-Grid">
                            <div className="hover-white-blue">
                                {/* Icon */}
                                <div style={{ display: "table-cell", width: "1px", padding: "0px 10px", verticalAlign: "top" }}>
                                    {fileIcon}
                                </div>
                                {/* Title and Authors */}
                                <div style={{ display: "table-cell" }} ref={this.state.ItemRef}>
                                    <div className="ms-Grid">
                                        <div className="ms-Grid-row" >
                                            <div className="ms-Grid-col ms-sm8" style={{ paddingLeft: "20px" }}>
                                                <RbLabel className="pointer" isInline={false} isMultipleLines={true} style={{ color: BoschColor.bosch_light_blue }} onClick={this.downloadFile}>{this.props.data.Title}</RbLabel>
                                                <RbLabel size={LabelSize.Small} isInline={false} isLongAuthor={true} style={{ marginTop: "0.3rem"}}>{Helper.mergeAuthors(this.props.data.Authors, this.props.data.AuthorDisplayName)}</RbLabel>
                                            </div>
                                            <div className="ms-Grid-col ms-sm2" style={{ textAlign: "left" }}>
                                                <RbLabel size={LabelSize.Small} isInline={false}>{(!_.isNil(this.props.data.DocumentDate)) ? Helper.getDateTimeFormatForUI(this.props.data.DocumentDate, true) : ""}</RbLabel>
                                            </div>
                                            <div className="ms-Grid-col ms-sm2" style={{ textAlign: "right" }}>
                                                <span className="search-action-icon rb-ic rb-ic-back-menu-mirror"
                                                    title="Forward" onClick={() => this.forwardEmail(this.props.data)} />
                                                {(this.state.IsBookmarked > -1) ?
                                                    <span className="search-action-icon rb-ic rb-ic-wishlist-full-yellow"
                                                        title="Remove Bookmark" onClick={this.openRemoveBookmarkDialog} />
                                                    : <span className="search-action-icon rb-ic rb-ic-wishlist"
                                                        title="Bookmark" onClick={this.addBookmark} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="ms-Grid-col ms-sm4">

                        {/* Hover Panel */}
                        <Callout style={{ width: "28vw", maxWidth: "28vw" }}
                            hidden={this.state.IsHoverPanelDisplayed === false}
                            target={this.state.ItemRef.current}
                            directionalHint={DirectionalHint.leftCenter}
                            onMouseOver={() => this.showHoverPanel(true, "panel")} onMouseLeave={() => this.showHoverPanel(false, "panel")}
                        >
                            <Search_HoverPanel data={this.props.data} />
                            {/* {(!_.isNil(this.state.HasPermission)) ? <CommandBar items={this.state.Commands} /> : ""} */}
                            {(!_.isNil(this.state.HasPermission)) ?
                                <div className="search-result-command-buttons">{this.renderCommandButtons(this.state.Commands)}</div> : ""}

                        </Callout>

                    </div>

                </div >

            </div >
        );
        return element;
    }

    renderCommandButtons(arraycommands: any[]) {
        return arraycommands.map((items) => {
            return (
                <RbButton
                    label={items.name}
                    style={{ padding: "0.5rem 1rem", minWidth: "inherit", margin: "0px" }} type={ButtonType.Tertiary}
                    onClick={() => { items.onClick() }}
                />
            );
        });
    }


    prepareCommandMenu(callback: any) {
        // Check permission
        let adminCommands = [
            { key: "View", name: "View", onClick: () => this.handleCommand("View") },
            { key: "Edit", name: "Edit", iconProps: { iconName: 'PageEdit' }, onClick: () => this.handleCommand("Edit") },
            { key: "Delete", name: "Delete", iconProps: { iconName: 'PageRemove' }, onClick: () => this.handleCommand("Delete") },
            { key: "Move", name: "Move", iconProps: { iconName: 'FabricMovetoFolder' }, onClick: () => this.handleCommand("Move") },
            { key: "CopyLink", name: "Copy Link", iconProps: { iconName: 'Copy' }, onClick: () => this.handleCommand("CopyLink") }
        ];
        let normalCommands = [
            { key: "ViewReport", name: "View Report", iconProps: { iconName: 'EntryView' }, onClick: () => this.handleCommand("View") },
            { key: "CopyLink", name: "Copy Link", iconProps: { iconName: 'Copy' }, onClick: () => this.handleCommand("CopyLink") }
        ];
        let noAccessCommands = [
            { key: "RequestReport", name: "Request Report", iconProps: { iconName: 'FileComment' }, onClick: () => this.handleCommand("Order") },
            { key: "CopyLink", name: "Copy Link", iconProps: { iconName: 'Copy' }, onClick: () => this.handleCommand("CopyLink") }
        ];
        // Add button Export Lessons
        if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL) {
            let isExported = this.props.data.LLReferenceNumber !== ""
                && !_.isNil(this.props.data.LLReferenceNumber);
            let exportLessonsButton = {
                key: "ExportLessons",
                name: "Export Lessons",
                title: (isExported === true) ? "Exported to LL" : "Not exported yet",
                iconProps: {
                    iconName: (isExported === true) ?
                        'CheckboxComposite' // Not exported yet
                        : 'Checkbox' // Exported
                },
                onClick: () => this.handleCommand("ExportLL", isExported)
            };
            adminCommands.splice(4, 0, exportLessonsButton);
            normalCommands.splice(1, 0, exportLessonsButton);
        }
        callback(adminCommands, normalCommands, noAccessCommands);
    }

    checkShowAdminCommands(adminCommands: any[], checkShowNormalCommands: any) {
        if (!_.isUndefined(this.props.userProfile?.permissions)) {
            let userPermissions: IUserPermissions = this.props.userProfile.permissions;
            if (this.props.userProfile.permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
                this.setState({
                    HasPermission: true,
                    Commands: adminCommands
                });
            }
            else {
                let hasPermission = false;
                switch (this.props.data.UploadType) {
                    case Constants.DOCUMENT_TYPE.RnD:
                        {
                            // Check RnD Division Admin
                            if (userPermissions.checkHasDivisionAdminPermission(Constants.DOCUMENT_TYPE.RnD, "", this.props.data.Division)
                                && this.props.data.Division !== "") {
                                this.setState({
                                    HasPermission: true,
                                    Commands: adminCommands

                                });
                                hasPermission = true;
                            }
                            break;
                        }
                    case Constants.DOCUMENT_TYPE.LL:
                        {
                            // Check LL Admin / LL Division Admin
                            if (userPermissions.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN])
                                || (userPermissions.checkHasDivisionAdminPermission(Constants.DOCUMENT_TYPE.LL, "", this.props.data.Division)
                                    && this.props.data.Division !== "")) {
                                this.setState({
                                    HasPermission: true,
                                    Commands: adminCommands
                                });
                                hasPermission = true;
                            }
                            break;
                        }
                    case Constants.DOCUMENT_TYPE.Thesis:
                        {
                            // Check Thesis Admin
                            if (userPermissions.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
                                this.setState({
                                    HasPermission: true,
                                    Commands: adminCommands
                                });
                                hasPermission = true;
                            }
                            break;
                        }
                    case Constants.DOCUMENT_TYPE.Paper:
                        {
                            // Check Paper Admin
                            if (userPermissions.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN])) {
                                this.setState({
                                    HasPermission: true,
                                    Commands: adminCommands
                                });
                                hasPermission = true;
                            }
                            break;
                        }
                }
                // Other cases
                if (hasPermission === false) {
                    checkShowNormalCommands();
                }
            }
        }
    }

    checkShowNormalCommands(normalCommands: any[], noAccessCommands: any[]) {
        // RnD, LL, Thesis, Paper SC1
        if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL
            || this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper
            || (this.props.data.SecurityClass === Constants.SECURITY_CLASS_LONG_NAME.SC1
                && (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD
                    || this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis))) {
            this.setState({
                HasPermission: true,
                Commands: normalCommands
            });
        }
        else { // Thesis SC2 or RnD SC2/SC3
            let checkSession = this.checkPermissionSession();
            if (!_.isNil(checkSession)) {
                this.setState({
                    HasPermission: checkSession,
                    Commands: ((checkSession === true) ? normalCommands : noAccessCommands)
                });
            }
            else {
                this.searchSrv.checkPermissionByWebService(this.props.userProfile.userToken,this.props.userProfile?.loginName.split('\\')[1] as string, this.props.data.Guid).then((result: any) => {
                    // Create check permission session
                    let expDate = new Date();
                    expDate.setMinutes(expDate.getMinutes() + 10);
                    sessionStorage.setItem(this.props.userProfile?.id + "_" + this.props.data.Guid, JSON.stringify({ Result: result, ExpireTime: expDate }));

                    this.setState({
                        HasPermission: result,
                        Commands: ((result === true) ? normalCommands : noAccessCommands)
                    });
                }).catch(() => {
                    this.setState({
                        HasPermission: false,
                        Commands: noAccessCommands
                    });
                });
            }
        }
    }

    checkPermissionSession() {
        let result = null;
        let checkSession = sessionStorage.getItem(this.props.userProfile?.id + '_' + this.props.data.Guid);
        if (!_.isNil(checkSession)) {
            let guidSession = JSON.parse(checkSession);
            if (new Date() < new Date(guidSession.ExpireTime)) {
                result = guidSession.Result;
            }
            else {
                sessionStorage.removeItem(this.props.userProfile?.id + '_' + this.props.data.Guid);
            }
        }
        return result;
    }

    showHoverPanel(status: any, component: any) {
        if (status === true) {
            if (component === "panel") {
                this.state.HoverStatuses.panel = true;
                if (this.state.HoverStatuses.item === false) {
                    if (this.state.IsHoverPanelDisplayed === false) {
                        this.setState({
                            IsHoverPanelDisplayed: true
                        });
                    }
                }
            }
            else { // item
                this.state.HoverStatuses.item = true;
                if (this.state.HoverStatuses.panel === false) {
                    if (this.state.IsHoverPanelDisplayed === false) {
                        this.setState({
                            IsHoverPanelDisplayed: true
                        });
                    }
                }
            }
        }
        else {
            Helper.runNewTask(() => {
                if (component === "panel") {
                    this.state.HoverStatuses.panel = false;
                    if (this.state.HoverStatuses.item === false) {
                        this.setState({
                            IsHoverPanelDisplayed: false
                        });
                    }
                }
                else { // item
                    this.state.HoverStatuses.item = false;
                    if (this.state.HoverStatuses.panel === false) {
                        this.setState({
                            IsHoverPanelDisplayed: false
                        });
                    }
                }
            });
        }
    }

    handleCommand(command: string, param: any = null) {
        switch (command) {
            case "View": {
                Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + this.props.data.Guid + "&Mode=" + command);
                break;
            }
            case "Edit": {
                this.migrationDataSrv.isMultiMovesReport(this.props.data.Guid).then((rs: any) => {
                    if (rs === false) {
                        Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + this.props.data.Guid + "&Mode=" + command);
                    }
                    else {
                        this.props.confirmDialog(
                            Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                            Constants.MIGRATION.WARN.replace("{0}", rs), true);
                    }
                });
                break;
            }
            case "Move": {
                this.migrationDataSrv.isMultiMovesReport(this.props.data.Guid).then((rs: any) => {
                    if (rs === false) {
                        Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/MoveReport?Guid=" + this.props.data.Guid);
                    }
                    else {
                        this.props.confirmDialog(
                            Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                            Constants.MIGRATION.WARN.replace("{0}", rs), true);
                    }
                });
                break;
            }
            case "Delete": {
                this.migrationDataSrv.isMultiMovesReport(this.props.data.Guid).then((rs: any) => {
                    if (rs === false) {
                        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.DELETE_REPORT.TITLE,
                            Constants.CONFIRMATION_MESSAGE.DELETE_REPORT.CONTENT.replace("{0}", this.props.data.Title),
                            false, () => {
                                this.closeDeleteReportDialog();
                            });
                    }
                    else {
                        this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                            Constants.MIGRATION.WARN.replace("{0}", rs), true);
                    }
                });
                break;
            }
            case "CopyLink": {
                // Get link
                let link: string = Environment.phaPageUrl + "AMFile.aspx?Guid=" + this.props.data.Guid;
                if (this.props.data.AttachedUrl !== "") {
                    // Get link, exceptional case for paper
                    link = this.props.data.AttachedUrl;
                }
                // Copy link
                const el = document.createElement('textarea');
                el.style.position = "fixed";
                el.value = link;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.SEARCH_MESSAGE.COPY_LINK.replace("{0}", this.props.data.Title)
                );
                break;
            }
            case "Order": {
                Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + this.props.data.Guid);
                break;
            }
            case "ExportLL": {
                if (param === true) { // Exported
                    this.props.confirmDialog(Constants.CONFIRMATION_MESSAGE.EXPORT_LESSONS.TITLE,
                        Constants.CONFIRMATION_MESSAGE.EXPORT_LESSONS.CONTENT.replace("{0}", this.props.data.Title),
                        false, () => {
                            this.closeExportLLDialog();
                        });
                }
                else { // Not exported yet
                    Helper.openDialog(Environment.phaPageUrl + "LLExport.aspx?Guid=" + this.props.data.Guid);
                }
                break;
            }
            default: {
                break;
            }
        }
        // Close hover panel after the action
        this.setState({
            IsHoverPanelDisplayed: false,
            HoverStatuses: {
                item: false,
                panel: false
            }
        });
    }

    downloadFile() {
        if (!_.isNil(this.state.HasPermission)) {
            if (this.state.HasPermission === true) {
                if (this.props.data.AttachedUrl !== "" && this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper) {
                    // Exception case for Paper reports, which has no attachment
                    Helper.openDialog(this.props.data.AttachedUrl);
                    let data = {
                        Title: this.props.data.Title,
                        DocumentURL: this.props.data.AttachedUrl,
                        Division: this.props.data.Division,
                        Department: this.props.data.Department,
                        SecurityClass: Helper.getSCShortName(this.props.data.SecurityClass),
                        EventDate: new Date(),
                        GUID1: this.props.data.Guid,
                        SubmitterId: this.props.userProfile?.id,
                        ReportType: this.props.data.DocumentType,
                        UploadType: this.props.data.UploadType
                    };
                    this.systemListsSrv.addNewStatisticRecord("DownloadedStatistics", data).then((rs: any) => {
                        console.log("Added new item to Downloaded Statistics successfully");
                        console.log(rs);
                    }).catch((ex: any) => {
                        console.log("Cannot add new item to Downloaded Statistics");
                        console.log(ex);
                    });
                }
                else {
                    Helper.openDialog(Environment.phaPageUrl + "AMFile.aspx?Guid=" + this.props.data.Guid);
                }
            }
            else {
                Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + this.props.data.Guid);
            }
        }
    }

    forwardEmail(data: any) {
        window.location.href = "mailto:?"
            + "subject=%5BFEBER%5D Recommended Report"
            + "&body=Hi,%0D%0A%0D%0AThe sender of this message would like to recommend a report from FEBER, the Bosch wide database for research and development reports.%0D%0A"
            + "Kindly access the recommended report which might be interesting to you.%0D%0A%0D%0A"
            + "Title: " + data.Title + " %0D%0A"
            + "Report Author(s): " + Helper.mergeAuthors(data.Authors, data.AuthorDisplayName) + " %0D%0A"
            + "Date of Document: " + ((!_.isNil(data.DocumentDate)) ? Helper.getDateTimeFormatForUI(data.DocumentDate) : "") + " %0D%0A"
            + "Security Class: " + data.SecurityClass + " %0D%0A"
            + "Report Path: "
            + ((this.props.data.UploadType !== Constants.DOCUMENT_TYPE.Paper) ?
                (Environment.phaPageUrl + "AMFile.aspx?Guid=")
                : Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=") + data.Guid;
    }

    addBookmark() {
        if (this.state.IsAddingBookmark === false) {
            let mergeAuthors = Helper.mergeAuthors(this.props.data.Authors, this.props.data.AuthorDisplayName)
            this.setState({ IsAddingBookmark: true }, () => {
                let data = {
                    Title: this.props.data.Title,
                    Keywords: this.props.data.Keywords,
                    BookmarkDate: new Date(),
                    Authors: mergeAuthors,
                    BookmarkUserId: this.props.userProfile?.id,
                    DocumentTitle: {
                        "__metadata": { "type": "SP.FieldUrlValue" },
                        "Description": this.props.data.Title,
                        "Url": Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + this.props.data.Guid
                    }
                };
                this.systemListsSrv.addBookmark(data).then((result: any) => {
                    if (result > -1) {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.BOOKMARK_MESSAGE.CREATE.SUCCESS.replace("{0}", this.props.data.Title)
                        );
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.BOOKMARK_MESSAGE.CREATE.FAILED.replace("{0}", this.props.data.Title)
                        );
                    }
                    this.setState({
                        IsAddingBookmark: false,
                        IsBookmarked: result
                    });
                }).catch(() => {
                    this.props.showToastMessage(
                        Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.BOOKMARK_MESSAGE.CREATE.FAILED.replace("{0}", this.props.data.Title)
                    );
                    this.setState({
                        IsAddingBookmark: false
                    });
                });
            });
        }
    }

    openRemoveBookmarkDialog() {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.REMOVE_BOOKMARK.TITLE,
            Constants.CONFIRMATION_MESSAGE.REMOVE_BOOKMARK.CONTENT.replace("{0}", this.props.data.Title),
            false, () => {
                this.removeBookmark();
            });
    }

    removeBookmark() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_BOOKMARK);
        this.systemListsSrv.removeBookmark(this.state.IsBookmarked).then((result: any) => {
            if (result === true) {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.BOOKMARK_MESSAGE.REMOVE.SUCCESS.replace("{0}", this.props.data.Title)
                );
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.BOOKMARK_MESSAGE.REMOVE.FAILED.replace("{0}", this.props.data.Title)
                );
            }
            this.setState({ IsBookmarked: -1 });
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.BOOKMARK_MESSAGE.REMOVE.FAILED.replace("{0}", this.props.data.Title)
            );
            this.props.showDialog(false);
        });
    }

    closeExportLLDialog() {
        Helper.openDialog(Environment.phaPageUrl + "LLExport.aspx?Guid=" + this.props.data.Guid);
    }

    closeDeleteReportDialog() {
        this.departmentListsSrv.removeReport(this.props.data).then(() => {
            // Add to deleted statistics
            let data = {
                Title: this.props.data.Title,
                Division: this.props.data.Division,
                Department: this.props.data.Department,
                DocumentURL: this.props.data.AMPath,
                SecurityClass: Helper.getSCShortName(this.props.data.SecurityClass),
                GUID1: this.props.data.Guid,
                UploadType: this.props.data.UploadType,
                ReportType: this.props.data.DocumentType,
                EventDate: new Date(),
                SubmitterId: this.props.userProfile?.id,
            };
            this.systemListsSrv.addNewStatisticRecord("DeletedStatistics", data).then((rs: any) => {
                console.log("Added new item to Deleted Statistics successfully");
                console.log(rs);
            }).catch((ex: any) => {
                console.log("Cannot add new item to Deleted Statistics");
                console.log(ex);
            });

            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.SUCCESS,
                Constants.REPORT_MESSAGE.REMOVE.SUCCESS.replace("{0}", this.props.data.Title)
            );
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.REPORT_MESSAGE.REMOVE.FAILED.replace("{0}", this.props.data.Title)
            );
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showDialog, showToastMessage })(Search_Result);