import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../../store/configureStore";
import { IUserProfile } from "../../../../store/permission/types";
import {
  changeMode,
  validateData,
} from "../../../../store/access-mediator/actions";
import Constants from "../../../../core/libraries/Constants";
import { ReportStatus } from "../../../../store/access-mediator/types";
import Environment from "../../../../Environment";
import MigrationService from "../../../../services/MigrationService";
import {
  confirmDialog,
  showDialog,
  showToastMessage,
} from "../../../../store/util/actions";
import Helper from "../../../../core/libraries/Helper";
import { init } from "../../../../store/access-mediator/actions";
import {
  getData,
  getReportTypes,
  updateReport,
  deleteReport,
  restartUploadWorkflow,
} from "../../../../store/access-mediator/thunks";
import RbButton, {
  ButtonSize,
  ButtonType,
} from "../../../../bosch-react/components/button/RbButton";

interface CommandBarProps {
  userProfile: IUserProfile | undefined;
  report: any;
  mode: string;
  status: string;
  init: typeof init;
  changeMode: typeof changeMode;
  getData: any;
  getReportTypes: any;
  updateReport: any;
  restartUploadWorkflow: any;
  deleteReport: any;
  validateData: typeof validateData;
  confirmDialog: typeof confirmDialog;
  showDialog: typeof showDialog;
  showToastMessage: typeof showToastMessage;
  // from parent
  hasAdminPermission: boolean;
}

class CommandBar extends React.Component<CommandBarProps, any> {
  migrationDataSrv: MigrationService = new MigrationService();

  constructor(props: CommandBarProps) {
    super(props);
    this.renderEditButton = this.renderEditButton.bind(this);
    this.renderMoveButton = this.renderMoveButton.bind(this);
    this.renderDeleteButton = this.renderDeleteButton.bind(this);
    this.renderUpdateButton = this.renderUpdateButton.bind(this);
    this.renderRestartButton = this.renderRestartButton.bind(this);
    this.renderCancelButton = this.renderCancelButton.bind(this);

    this.checkAndConfrimaDeletion = this.checkAndConfrimaDeletion.bind(this);
    this.cancelChanges = this.cancelChanges.bind(this);
    this.renderCopyButton = this.renderCopyButton.bind(this);
    // Helper functions
    this.getMode = this.getMode.bind(this);
  }

  render() {
    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row common-padding-row">&nbsp;</div>
        <div className="ms-Grid-row common-padding-row">
          {this.renderEditButton()}
          {this.renderMoveButton()}
          {this.renderDeleteButton()}
          {this.renderUpdateButton()}
          {this.renderRestartButton()}
          {this.renderCancelButton()}
          {this.renderCopyButton()}
        </div>
      </div>
    );
  }

  renderEditButton() {
    if (this.props.mode === "View" && this.props.hasAdminPermission === true) {
      return (
        <React.Fragment>
          <RbButton
            label="Edit"
            size={ButtonSize.Small}
            onClick={() => {
              this.props.changeMode("Edit");
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderMoveButton() {
    if (
      this.props.mode === "View" &&
      this.props.hasAdminPermission === true &&
      this.props.status !== ReportStatus.PENDING &&
      this.props.status !== ReportStatus.CLOSED
    ) {
      return (
        <React.Fragment>
          <RbButton
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            label="Move"
            onClick={() => {
              window.location.href =
                Environment.spaRootPageUrl +
                "index.aspx#/MoveReport?Guid=" +
                this.props.report.Guid;
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderDeleteButton() {
    if (
      this.props.mode === "View" &&
      this.props.hasAdminPermission === true &&
      this.props.status !== ReportStatus.PENDING &&
      this.props.status !== ReportStatus.CLOSED
    ) {
      return (
        <React.Fragment>
          <RbButton
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            label="Delete"
            onClick={() => {
              this.checkAndConfrimaDeletion();
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderUpdateButton() {
    if (
      (this.props.mode === "Edit" || this.props.mode === "Move") &&
      this.props.status !== ReportStatus.CLOSED &&
      this.props.hasAdminPermission === true
    ) {
      return (
        <React.Fragment>
          <RbButton
            label="Update"
            size={ButtonSize.Small}
            onClick={() => {
              this.props.validateData(() => {
                this.migrationDataSrv
                  .isMultiMovesReport(this.props.report.Guid)
                  .then((rs: any) => {
                    if (rs === false) {
                      this.props.showDialog(Constants.DIALOG_MESSAGE.UPDATE);
                      this.props.updateReport(
                        this.props.userProfile.userToken,
                        this.props.report,
                        (rs: boolean) => {
                          this.props.showDialog(false);
                          this.props.confirmDialog(
                            Constants.REPORT_MESSAGE.UPDATE.TITLE,
                            (rs === true
                              ? Constants.REPORT_MESSAGE.UPDATE.SUCCESS
                              : Constants.REPORT_MESSAGE.UPDATE.FAILED
                            ).replace("{0}", this.props.report.Title),
                            true,
                            () => {
                              this.cancelChanges();
                            }
                          );
                        }
                      );
                    } else {
                      this.props.confirmDialog(
                        Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                        Constants.MIGRATION.WARN.replace("{0}", rs),
                        true
                      );
                    }
                  });
              });
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderRestartButton() {
    if (this.props.status === ReportStatus.CLOSED) {
      return (
        <React.Fragment>
          <RbButton
            label="Restart workflow"
            size={ButtonSize.Small}
            onClick={() => {
              this.props.validateData(() => {
                this.props.showDialog(Constants.DIALOG_MESSAGE.RESTART);
                this.props.restartUploadWorkflow(
                  this.props.userProfile.userToken,
                  this.props.report,
                  (rs: boolean) => {
                    this.props.showDialog(false);
                    this.props.confirmDialog(
                      Constants.REPORT_MESSAGE.RESTART.TITLE,
                      (rs === true
                        ? Constants.REPORT_MESSAGE.RESTART.SUCCESS
                        : Constants.REPORT_MESSAGE.RESTART.FAILED
                      ).replace("{0}", this.props.report.Title),
                      true,
                      () => {
                        this.cancelChanges();
                        if (rs === true) {
                          window.close();
                        }
                      }
                    );
                  }
                );
              });
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderCancelButton() {
    if (
      (this.props.mode === "Edit" || this.props.mode === "Move") &&
      this.props.status !== ReportStatus.CLOSED &&
      this.props.hasAdminPermission === true
    ) {
      return (
        <React.Fragment>
          <RbButton
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            label="Cancel"
            onClick={this.cancelChanges}
          />
          &nbsp;
        </React.Fragment>
      );
    }
    return null;
  }

  renderCopyButton() {
    if (this.props.hasAdminPermission === true) {
      return (
        <React.Fragment>
          <RbButton
            type={ButtonType.Secondary}
            label="Copy Link"
            size={ButtonSize.Small}
            onClick={() => {
              this.CopyAccessMediatorUrl();
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <RbButton
            label="Copy Link"
            size={ButtonSize.Small}
            onClick={() => {
              this.CopyAccessMediatorUrl();
            }}
          />
          &nbsp;
        </React.Fragment>
      );
    }
  }

  checkAndConfrimaDeletion() {
    this.migrationDataSrv
      .isMultiMovesReport(this.props.report.Guid)
      .then((rs: any) => {
        if (rs === false) {
          this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.DELETE_REPORT.TITLE,
            Constants.CONFIRMATION_MESSAGE.DELETE_REPORT.CONTENT.replace(
              "{0}",
              this.props.report.Title
            ),
            false,
            () => {
              this.props.showDialog(Constants.DIALOG_MESSAGE.DELETE);
              this.props.deleteReport(
                this.props.userProfile.userToken,
                this.props.report,
                (rs: boolean) => {
                  this.props.showDialog(false);
                  this.props.confirmDialog(
                    Constants.REPORT_MESSAGE.REMOVE.TITLE,
                    (rs === true
                      ? Constants.REPORT_MESSAGE.REMOVE.SUCCESS
                      : Constants.REPORT_MESSAGE.REMOVE.FAILED
                    ).replace("{0}", this.props.report.Title),
                    true,
                    () => {
                      if (rs === true) {
                        window.close();
                        this.cancelChanges();
                      }
                    }
                  );
                }
              );
            }
          );
        } else {
          this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
            Constants.MIGRATION.WARN.replace("{0}", rs),
            true
          );
        }
      });
  }

  cancelChanges() {
    let guid: string = this.props.report.Guid;
    this.props.init();
    Helper.runNewTask(() => {
      this.props.getData(
        this.props.userProfile.userToken,
        guid,
        (result: any) => {
          this.props.getReportTypes(result.UploadType);
        }
      );
    });
  }

  // Helper fucntions
  CopyAccessMediatorUrl() {
    if (this.props.status !== ReportStatus.PUBLISHED) {
      let link =
        Environment.spaRootPageUrl +
        "index.aspx#/AccessMediator?Guid=" +
        this.props.report.Guid;
      // Copy link
      const el = document.createElement("textarea");
      el.style.position = "fixed";
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } else {
      let link =
        Environment.spaRootPageUrl +
        "index.aspx#/AccessMediator?Guid=" +
        this.props.report.Guid +
        "&Mode=" +
        this.props.mode;
      // Copy link
      const el = document.createElement("textarea");
      el.style.position = "fixed";
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    this.props.showToastMessage(
      Constants.TOAST_MESSAGE_CODE.SUCCESS,
      "The link is copied into your clipboard. You can paste it anywhere."
    );
  }

  getMode(mode: string = "") {
    let result = "";
    switch (mode.toLowerCase()) {
      case "view":
      case "edit":
      case "move": {
        result = mode;
        break;
      }
      default: {
        result = "View";
        break;
      }
    }
    return result;
  }
}

const mapStateToProps = (state: RootState) => ({
  userProfile: state.permission.userProfile,
  report: state.accessMediator.data,
  mode: state.accessMediator.mode,
  status: state.accessMediator.status,
});

export default connect(mapStateToProps, {
  init,
  changeMode,
  getData,
  getReportTypes,
  updateReport,
  restartUploadWorkflow,
  deleteReport,
  validateData,
  confirmDialog,
  showDialog,
  showToastMessage,
})(CommandBar);
