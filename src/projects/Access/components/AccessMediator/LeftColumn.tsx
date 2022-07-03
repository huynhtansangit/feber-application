import * as React from "react";
import Template from "../../../../core/libraries/Template";
import { connect } from "react-redux";
import { RootState } from "../../../../store/configureStore";
import { Link, Icon } from "@fluentui/react";
import Helper from "../../../../core/libraries/Helper";
import PeoplePicker from "../../../../core/components/PeoplePickerWithErrorController";
import Constants from "../../../../core/libraries/Constants";
import {
  updateProperty,
  updateChecbox,
  updateFirstLoadCheck,
} from "../../../../store/access-mediator/actions";
import DatePicker from "../../../../core/components/DatePickerWithErrorController";
import Environment from "../../../../Environment";
import _ from "lodash";
import {
  changeDepartment,
  changeDivisionAdmin,
} from "../../../../store/access-mediator/thunks";
import { showDialog, showToastMessage } from "../../../../store/util/actions";
import { ReportStatus } from "../../../../store/access-mediator/types";
import FilePicker from "../../../../core/components/FilePicker";
import { IUserProfile } from "../../../../store/permission/types";
import SystemService from "../../../../services/SystemService";
import RbTextField from "../../../../bosch-react/components/text-field/RbTextField";
import RbLabel from "../../../../bosch-react/components/label/RbLabel";
import RbCheckbox from "../../../../bosch-react/components/checkbox/RbCheckbox";
import "../../../../core/scss/_customize.scss";

interface LeftColumnProps {
  userProfile: IUserProfile | undefined;
  data: any;
  validation: any;
  mode: string;
  status: string;
  showDialog: typeof showDialog;
  showToastMessage: typeof showToastMessage;
  updateProperty: typeof updateProperty;
  updateChecbox: typeof updateChecbox;
  updateFirstLoadCheck: typeof updateFirstLoadCheck;
  changeDepartment: any;
  changeDivisionAdmin: any;
  // from parent
  hasAdminPermission: boolean;
  checkBoxChecked: any;
  isFirstLoad: any;
}

class LeftColumn extends React.Component<LeftColumnProps, any> {
  authorsRef: React.RefObject<any> = React.createRef();

  approverRef: React.RefObject<any> = React.createRef();

  changeDepartmentRef: React.RefObject<any> = React.createRef();

  componentDidMount() {
    // Exception for BSH: If the report is LL and from division BSH, set approver is empty
    if (
      this.props.mode === "Edit" &&
      this.props.status !== ReportStatus.PUBLISHED &&
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL &&
      this.props.data.Division === "BSH"
    ) {
      this.props.updateProperty("ROU", null);
    }
    // No limit the number of authors for admin users
    if (this.props.hasAdminPermission === true) {
      this.setState({ maximumAuthor: undefined });
    } else {
      let systemSrv = new SystemService();
      systemSrv
        .getConfigurations()
        .then((results: any[]) => {
          let configValue = results.filter(
            (r) => r.Title === "MaximumAuthor"
          )[0].ConfigureValue;
          this.setState({ maximumAuthor: configValue });
        })
        .catch(() => {
          // Set default value
          this.setState({ maximumAuthor: 5 });
        });
    }
    if (this.props.data.UploadType === "Thesis") {
      if (
        this.props.data.ReportAuthor.length === 0 &&
        this.props.data.FeberAuthorDisplayName !== ""
      ) {
        this.props.updateChecbox("checkBoxChecked", true);
      } else {
        this.props.updateChecbox("checkBoxChecked", false);
      }
    }
  }

  constructor(props: LeftColumnProps) {
    super(props);
    this.state = {
      maximumAuthor: 5, // Default value
    };
    this.renderTitle = this.renderTitle.bind(this);
    this.renderAttachment = this.renderAttachment.bind(this);
    this.renderAttachedUrl = this.renderAttachedUrl.bind(this);
    this.renderAuthors = this.renderAuthors.bind(this);
    this.renderROU = this.renderROU.bind(this);
    this.renderPortfolio = this.renderPortfolio.bind(this);
    this.renderApproverForBSH = this.renderApproverForBSH.bind(this);
    this.renderChangeDepartment = this.renderChangeDepartment.bind(this);
    this.renderLLDivisionAdmin = this.renderLLDivisionAdmin.bind(this);
    this.renderAuthorDisplayName = this.renderAuthorDisplayName.bind(this);
    this.renderSubmitter = this.renderSubmitter.bind(this);
    this.renderKeywords = this.renderKeywords.bind(this);
    this.renderReportDate = this.renderReportDate.bind(this);
    this.renderDivision = this.renderDivision.bind(this);
    this.renderDepartment = this.renderDepartment.bind(this);
    this.openAMFile = this.openAMFile.bind(this);
    this.generateFileName = this.generateFileName.bind(this);
  }

  render() {
    // console.log(this.props.data.Path);
    let element_checkbox: any;
    if (this.props.data.UploadType === "Thesis" && this.props.mode === "Edit") {
      element_checkbox = this.renderAuthorsLeftCheckbox();
    }
    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-lg12 ms-xl11">
            {this.renderTitle()}
            {this.renderAttachment()}
            {this.renderAttachedUrl()}
            {this.renderAuthors()}
            {element_checkbox}
            {this.renderAuthorDisplayName()}
            {this.renderROU()}
            {this.renderPortfolio()}
            {this.renderChangeDepartment()}
            {this.renderLLDivisionAdmin()}
            {this.renderSubmitter()}
            {this.renderKeywords()}
            {this.renderReportDate()}
            {this.renderDivision()}
            {this.renderDepartment()}
          </div>
          <div className="ms-Grid-col ms-lg0 ms-xl1" />
        </div>
      </div>
    );
  }

  renderTitle() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Title",
      <span className="textarea-transparent">
        <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
          {this.props.data.Title}
        </RbLabel>
      </span>,
      <RbTextField
        value={this.props.data.Title}
        onChange={(event: React.ChangeEvent<any>) => {
          this.props.updateProperty("Title", event.currentTarget.value);
        }}
      />,
      Helper.setEmptyIfNull(this.props.validation.Title)
    );
  }

  renderAttachment() {
    if (
      this.props.data.UploadType !== Constants.DOCUMENT_TYPE.Paper ||
      (this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
        this.props.data.AttachedUrl === "" &&
        this.props.mode === "View")
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Attachment",
        <div
          className="attachment-button"
          onClick={() => {
            if (this.props.data.HasAttachment === true) {
              this.openAMFile();
            }
          }}
        >
          <Icon
            iconName={
              this.props.data.HasAttachment === true
                ? "Download"
                : "StatusCircleErrorX"
            }
          />
          &nbsp;&nbsp;&nbsp;
          <span style={{ wordBreak: "break-word" }}>
            {this.props.data.HasAttachment === true
              ? this.generateFileName()
              : "Missed document"}
          </span>
        </div>,
        <React.Fragment>
          <span className="textarea-transparent">
            <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
              {this.generateFileName()}
            </RbLabel>
          </span>
          <FilePicker
            text="Change file"
            onFileChange={(file: any) => {
              this.props.updateProperty("Attachment", file);
            }}
          />
        </React.Fragment>
      );
    }
    return null;
  }

  renderAttachedUrl() {
    if (
      (this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
        this.props.data.AttachedUrl !== "" &&
        this.props.mode === "View") ||
      (this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
        this.props.mode === "Edit")
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Url",
        <div style={{ width: "100%", wordBreak: "break-all" }}>
          <Link
            target="_blank"
            href={this.props.data.AttachedUrl}
            onClick={() => {
              let systemSrv = new SystemService();
              let data = {
                Title: this.props.data.Title,
                DocumentURL: this.props.data.AttachedUrl,
                Division: this.props.data.Division,
                Department: this.props.data.FeberDepartment,
                SecurityClass: Helper.getSCShortName(
                  this.props.data.SecurityClass
                ),
                EventDate: new Date(),
                GUID1: this.props.data.Guid,
                SubmitterId: this.props.userProfile?.id,
                ReportType: this.props.data.DocumentType,
                UploadType: this.props.data.UploadType,
              };
              systemSrv
                .addNewStatisticRecord("DownloadedStatistics", data)
                .then((rs: any) => {
                  console.log(
                    "Added new item to Downloaded Statistics successfully"
                  );
                  console.log(rs);
                })
                .catch((ex: any) => {
                  console.log("Cannot add new item to Downloaded Statistics");
                  console.log(ex);
                });
            }}
          >
            {this.props.data.AttachedUrl}
          </Link>
        </div>,
        <RbTextField
          value={this.props.data.AttachedUrl}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("AttachedUrl", event.currentTarget.value);
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.AttachedUrl)
      );
    }
    return null;
  }

  renderAuthors() {
    //if(this.props.data.ReportAuthor.length === 0)
    if (this.props.checkBoxChecked === true) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Authors",
        Template.renderReadOnlyPeoplePickerTags(
          Helper.getPeoplePickerStringByObjectArray(
            this.props.data.ReportAuthor
          )
        ),
        <div className="authorDisabled">
          <PeoplePicker
            principalType="User"
            defaultValue={this.props.data.ReportAuthor}
            componentRef={this.authorsRef}
            path={this.props.data.Path}
            uploadType={this.props.data.UploadType}
            itemLimit={this.state.maximumAuthor}
            onChange={() => {
              let items = this.authorsRef.current.getSelectedItems();
              let results: any[] = [];
              items.forEach((item: any) => {
                results.push({
                  Id: item.id,
                  Title: item.displayName,
                });
              });
              this.props.updateProperty("ReportAuthor", results);
            }}
          />
        </div>
      );
    } else {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Authors",
        Template.renderReadOnlyPeoplePickerTags(
          Helper.getPeoplePickerStringByObjectArray(
            this.props.data.ReportAuthor
          )
        ),
        <PeoplePicker
          principalType="User"
          defaultValue={this.props.data.ReportAuthor}
          componentRef={this.authorsRef}
          path={this.props.data.Path}
          uploadType={this.props.data.UploadType}
          itemLimit={this.state.maximumAuthor}
          onChange={() => {
            let items = this.authorsRef.current.getSelectedItems();
            let results: any[] = [];
            items.forEach((item: any) => {
              results.push({
                Id: item.id,
                Title: item.displayName,
              });
            });
            this.props.updateProperty("ReportAuthor", results);
          }}
          errorMessage={this.props.validation.ReportAuthor}
        />
      );
    }
  }

  //Author Display Name
  renderAuthorDisplayName() {
    //if (this.props.data.UploadType === 'Thesis' && this.props.data.ReportAuthor.length === 0) {
    if (
      this.props.data.UploadType === "Thesis" &&
      this.props.checkBoxChecked === true
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Author display name",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.FeberAuthorDisplayName}
          </RbLabel>
        </span>,
        <RbTextField
          minRows={5}
          value={this.props.data.FeberAuthorDisplayName}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "FeberAuthorDisplayName",
              event.currentTarget.value
            );
          }}
        />,
        this.props.validation.FeberAuthorDisplayName
      );
    } else if (
      this.props.hasAdminPermission === true &&
      this.props.status === ReportStatus.PUBLISHED &&
      this.props.data.UploadType !== "Thesis"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Author display name",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.FeberAuthorDisplayName}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.FeberAuthorDisplayName}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "FeberAuthorDisplayName",
              event.currentTarget.value
            );
          }}
        />
      );
    } else {
      return null;
    }
  }

  renderAuthorsLeftCheckbox() {
    if (this.props.checkBoxChecked === true) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "",
        <span className="textarea-transparent">
          <RbLabel
            isMultipleLines={true}
            maxLines={10}
            hasPadding={true}
          ></RbLabel>
        </span>,
        <div
          style={{
            marginTop: "-10px",
            marginLeft: "-23px",
            marginRight: "-36px",
          }}
        >
          <RbCheckbox
            checked={this.props.checkBoxChecked}
            label="The author has already left Bosch?"
            onChange={() => {
              //this.props.data.ReportAuthor.length = 1;
              this.props.updateProperty("ReportAuthor", []);
              this.props.updateProperty("FeberAuthorDisplayName", "");
              this.props.updateChecbox(
                "checkBoxChecked",
                !this.props.checkBoxChecked
              );

              //this.props.updateFirstLoadCheck("isFirstLoad", false)
            }}
          />
        </div>
      );
    } else {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "",
        <span className="textarea-transparent">
          <RbLabel
            isMultipleLines={true}
            maxLines={10}
            hasPadding={true}
          ></RbLabel>
        </span>,
        <div
          style={{
            marginTop: "-10px",
            marginLeft: "-23px",
            marginRight: "-36px",
          }}
        >
          <RbCheckbox
            checked={this.props.checkBoxChecked}
            label="The author has already left Bosch?"
            onChange={() => {
              //this.props.data.ReportAuthor.length = 1;
              this.props.updateProperty("FeberAuthorDisplayName", "");
              this.props.updateProperty("ReportAuthor", []);
              this.props.updateChecbox(
                "checkBoxChecked",
                !this.props.checkBoxChecked
              );
            }}
          />
        </div>
      );
    }
  }

  renderROU() {
    if (
      this.props.hasAdminPermission === true ||
      (this.props.status !== ReportStatus.PUBLISHED &&
        this.props.mode === "Edit")
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Approver",
        Template.renderReadOnlyPeoplePickerTags(
          Helper.getPeoplePickerStringByObjectArray([this.props.data.ROU])
        ),
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL &&
          this.props.data.Division === "BSH"
          ? this.renderApproverForBSH() // Exception for BSH
          : Template.renderReadOnlyPeoplePickerTags(
              Helper.getPeoplePickerStringByObjectArray([this.props.data.ROU])
            )
      );
    }
    return null;
  }

  renderPortfolio() {
    if (
      this.props.data.Division === "CR" &&
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD
    ) {
      if (
        this.props.hasAdminPermission === true ||
        (this.props.status !== ReportStatus.PUBLISHED &&
          this.props.mode === "Edit")
      ) {
        return Template.renderAccessMediatorRowTemplate(
          this.props.mode,
          "Strategic Portfolio Owner",
          Template.renderReadOnlyPeoplePickerTags(
            Helper.getPeoplePickerStringByObjectArray([
              this.props.data.GroupManager,
            ])
          ),
          Template.renderReadOnlyPeoplePickerTags(
            Helper.getPeoplePickerStringByObjectArray([
              this.props.data.GroupManager,
            ])
          )
        );
      }
      return null;
    }
  }

  renderApproverForBSH() {
    return (
      <PeoplePicker
        principalType="User"
        itemLimit={1}
        defaultValue={[]}
        componentRef={this.approverRef}
        onChange={() => {
          let items = this.approverRef.current.getSelectedItems();
          let results: any[] = [];
          items.forEach((item: any) => {
            results.push({
              Id: item.id,
              Title: item.displayName,
            });
          });
          this.props.updateProperty(
            "ROU",
            results.length === 0 ? null : results[0]
          );
        }}
        errorMessage={this.props.validation.ROU}
      />
    );
  }

  renderChangeDepartment() {
    if (
      this.props.mode === "Edit" &&
      this.props.status !== ReportStatus.PUBLISHED &&
      // Exception for BSH: Not showing tis field if restart
      !(
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL &&
        this.props.data.Division === "BSH"
      )
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Change department",
        null,
        <PeoplePicker
          principalType="SecurityGroup"
          itemLimit={1}
          path={this.props.data.Path}
          uploadType={this.props.data.UploadType}
          componentRef={this.changeDepartmentRef}
          onChange={() => {
            let items = this.changeDepartmentRef.current.getSelectedItems();
            if (items.length > 0) {
              this.props.showDialog("Loading");
              this.props.changeDepartment(
                items[0].displayName,
                (result: boolean) => {
                  if (result === true) {
                    // Exception for LL: Get LL Division Admin
                    if (
                      this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL
                    ) {
                      this.props.changeDivisionAdmin(
                        this.props.data.Division,
                        () => {
                          this.forceUpdate();
                        }
                      );
                    } else {
                      this.forceUpdate();
                    }
                  } else {
                    this.props.showToastMessage(
                      Constants.TOAST_MESSAGE_CODE.ERROR,
                      "This is not a valid department"
                    );
                  }
                  this.props.showDialog(false);
                  this.forceUpdate();
                }
              );
            }
          }}
        />
      );
    }
    return null;
  }

  renderLLDivisionAdmin() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL &&
      this.props.status !== ReportStatus.PUBLISHED &&
      this.props.mode === "Edit"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Divisional lessons learned coordinator",
        Template.renderReadOnlyPeoplePickerTags(
          Helper.getPeoplePickerStringByObjectArray([
            this.props.data.LLDivisionAdmin,
          ])
        ),
        Template.renderReadOnlyPeoplePickerTags(
          Helper.getPeoplePickerStringByObjectArray([
            this.props.data.LLDivisionAdmin,
          ])
        )
      );
    }
    return null;
  }

  renderSubmitter() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Submitter",
      Template.renderReadOnlyPeoplePickerTags(
        Helper.getPeoplePickerStringByObjectArray([this.props.data.Submitter])
      ),
      Template.renderReadOnlyPeoplePickerTags(
        Helper.getPeoplePickerStringByObjectArray([this.props.data.Submitter])
      )
    );
  }

  renderKeywords() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Keywords",
      <span className="textarea-transparent">
        <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
          {this.props.data.FeberKeywords}
        </RbLabel>
      </span>,
      <RbTextField
        minRows={5}
        isMultiple={true}
        value={this.props.data.FeberKeywords}
        onChange={(event: React.ChangeEvent<any>) => {
          this.props.updateProperty("FeberKeywords", event.currentTarget.value);
        }}
      />,
      Helper.setEmptyIfNull(this.props.validation.FeberKeywords)
    );
  }

  renderReportDate() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Report date",
      <span className="textarea-transparent">
        <RbLabel hasPadding={true}>
          {Helper.getDateTimeFormatForUI(this.props.data.DocumentDate)}
        </RbLabel>
      </span>,
      <DatePicker
        value={Helper.parseDate(this.props.data.DocumentDate)}
        onSelectDate={(date: Date) => {
          this.props.updateProperty("DocumentDate", date);
        }}
        errorMessage={this.props.validation.DocumentDate}
      />
    );
  }

  renderDivision() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Division",
      <span className="textarea-transparent">
        <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
          {this.props.data.Division}
        </RbLabel>
      </span>,
      <RbTextField
        disabled={true}
        value={this.props.data.Division}
        onChange={(event: React.ChangeEvent<any>) => {
          this.props.updateProperty("Division", event.currentTarget.value);
        }}
      />
    );
  }

  renderDepartment() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Department",
      <span className="textarea-transparent">
        <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
          {this.props.data.FeberDepartment.replace("_", "/")}
        </RbLabel>
      </span>,
      <RbTextField
        disabled={true}
        value={this.props.data.FeberDepartment.replace("_", "/")}
        onChange={(event: React.ChangeEvent<any>) => {
          this.props.updateProperty(
            "FeberDepartment",
            event.currentTarget.value
          );
        }}
      />
    );
  }

  openAMFile() {
    Helper.openDialog(
      Environment.phaPageUrl + "AMFile.aspx?Guid=" + this.props.data.Guid
    );
  }

  generateFileName() {
    // Get Title
    let title = this.props.data.Title;
    // Get Report number (optional)
    let reportNumber = _.isNil(this.props.data.DocumentNumber)
      ? ""
      : this.props.data.DocumentNumber;
    // Check special characters
    let fileName = reportNumber + (reportNumber !== "" ? "_" : "") + title;
    let fileNameArr: string[] = fileName.split("");
    let filteredFileNameArr = fileNameArr.filter(
      (c) => c.match(/^[0-9a-zA-Z]+$/) || c === " " || c === "-" || c === "_"
    );
    // The file name must be less than 255 characters
    let finalArr: string[] = [];
    filteredFileNameArr.forEach((item) => {
      if (finalArr.length <= 255) {
        finalArr.push(item);
      }
    });
    fileName = _.join(finalArr, "");
    return fileName + ".pdf";
  }
}

const mapStateToProps = (state: RootState) => ({
  userProfile: state.permission.userProfile,
  data: state.accessMediator.data,
  validation: state.accessMediator.validation,
  mode: state.accessMediator.mode,
  status: state.accessMediator.status,
  checkBoxChecked: state.accessMediator.checkBoxChecked,
  isFirstLoad: state.accessMediator.isFirstLoad,
});

export default connect(mapStateToProps, {
  showDialog,
  showToastMessage,
  updateProperty,
  changeDepartment,
  changeDivisionAdmin,
  updateChecbox,
  updateFirstLoadCheck,
})(LeftColumn);
