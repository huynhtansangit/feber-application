import * as React from "react";
import Template from "../../../../core/libraries/Template";
import { connect } from "react-redux";
import { RootState } from "../../../../store/configureStore";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import { PeoplePicker } from "../../../../core/components/PeoplePicker";
import Helper from "../../../../core/libraries/Helper";
import Constants from "../../../../core/libraries/Constants";
import { updateProperty } from "../../../../store/access-mediator/actions";
import DatePicker from "../../../../core/components/DatePickerWithErrorController";
import { ReportStatus } from "../../../../store/access-mediator/types";
import RbLabel from "../../../../bosch-react/components/label/RbLabel";
import RbTextField from "../../../../bosch-react/components/text-field/RbTextField";
import RbRadio from "../../../../bosch-react/components/radio/RbRadio";

interface RightColumnProps {
  data: any;
  validation: any;
  mode: string;
  status: string;
  securityClasses: any[];
  reportTypes: any[];
  updateProperty: typeof updateProperty;
  // from parent
  hasAdminPermission: boolean;
}

class RightColumn extends React.Component<RightColumnProps, any> {
  additionalApproversRef: React.RefObject<any> = React.createRef();
  notificationUsersRef: React.RefObject<any> = React.createRef();
  notifyToRef: React.RefObject<any> = React.createRef();
  authorizedAssociatesRef: React.RefObject<any> = React.createRef();
  organizationalUnitsRef: React.RefObject<any> = React.createRef();
  customACLRef: React.RefObject<any> = React.createRef();

  constructor(props: RightColumnProps) {
    super(props);
    this.renderRelevantForForeignTradeLegistation =
      this.renderRelevantForForeignTradeLegistation.bind(this);
    this.renderSecurityClass = this.renderSecurityClass.bind(this);
    this.renderReportType = this.renderReportType.bind(this);
    this.renderReportNumber = this.renderReportNumber.bind(this);
    this.renderProjectNumber = this.renderProjectNumber.bind(this);
    this.renderPlantBU = this.renderPlantBU.bind(this);
    this.renderProduct = this.renderProduct.bind(this);
    this.renderProcess = this.renderProcess.bind(this);
    this.renderIQISNumber = this.renderIQISNumber.bind(this);
    this.renderNameOfConference = this.renderNameOfConference.bind(this);
    this.renderLocationOfConference =
      this.renderLocationOfConference.bind(this);
    this.renderDateOfConference = this.renderDateOfConference.bind(this);
    this.renderNameOfJournal = this.renderNameOfJournal.bind(this);
    this.renderDateOfPublication = this.renderDateOfPublication.bind(this);
    this.renderAbstract = this.renderAbstract.bind(this);
    this.renderAdditionalApprovers = this.renderAdditionalApprovers.bind(this);
    this.renderNotificationUsers = this.renderNotificationUsers.bind(this);
    this.renderAuthorizedAssociates =
      this.renderAuthorizedAssociates.bind(this);
    this.renderOrganizationalUnits = this.renderOrganizationalUnits.bind(this);
    this.renderCustomACL = this.renderCustomACL.bind(this);
    this.renderComment = this.renderComment.bind(this);
  }

  render() {
    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-lg0 ms-xl1" />
          <div className="ms-Grid-col ms-lg12 ms-xl11">
            {this.renderRelevantForForeignTradeLegistation()}
            {this.renderSecurityClass()}
            {this.renderReportType()}
            {this.renderReportNumber()}
            {this.renderProjectNumber()}
            {this.renderPlantBU()}
            {this.renderProduct()}
            {this.renderProcess()}
            {this.renderIQISNumber()}
            {this.renderNameOfConference()}
            {this.renderLocationOfConference()}
            {this.renderDateOfConference()}
            {this.renderNameOfJournal()}
            {this.renderDateOfPublication()}
            {this.renderAbstract()}
            {this.renderAdditionalApprovers()}
            {this.renderNotificationUsers()}
            {this.renderAuthorizedAssociates()}
            {this.renderOrganizationalUnits()}
            {this.renderCustomACL()}
            {this.renderComment()}
          </div>
        </div>
      </div>
    );
  }

  renderRelevantForForeignTradeLegistation() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Report contains export controlled material",
        <RbRadio
          defaultValue={this.props.data.RelForForeignTradeLegislation}
          itemWidth={5}
          isHorizontal={true}
          items={[
            { value: true, label: "Yes", disabled: true },
            { value: false, label: "No", disabled: true },
          ]}
        />,
        <RbRadio
          defaultValue={this.props.data.RelForForeignTradeLegislation}
          itemWidth={5}
          isHorizontal={true}
          items={[
            {
              value: true,
              label: "Yes",
              disabled: this.props.status === ReportStatus.PUBLISHED,
            },
            {
              value: false,
              label: "No",
              disabled: this.props.status === ReportStatus.PUBLISHED,
            },
          ]}
          onChange={(selectedValue) => {
            this.props.updateProperty(
              "RelForForeignTradeLegislation",
              selectedValue
            );
            if (selectedValue === true) {
              this.props.updateProperty(
                "SecurityClass",
                Constants.SECURITY_CLASS_LONG_NAME.SC3
              );
            }
            this.forceUpdate();
          }}
        />
      );
    }
    return null;
  }

  renderSecurityClass() {
    let scOptions: IDropdownOption[] = this.props.securityClasses;
    if (this.props.data.RelForForeignTradeLegislation === true) {
      scOptions = scOptions.map((sc) => {
        return {
          ...sc,
          disabled: sc.key !== Constants.SECURITY_CLASS_LONG_NAME.SC3,
        };
      });
    } else {
      scOptions = scOptions.map((sc) => {
        return { ...sc, disabled: sc.key === "" };
      });
    }
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Security class",
      <span className="textarea-transparent">
        <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
          {this.props.data.SecurityClass}
        </RbLabel>
      </span>,
      <Dropdown
        selectedKey={this.props.data.SecurityClass}
        placeholder="Choose a report type ..."
        options={scOptions}
        onChange={(event, option: IDropdownOption) => {
          this.props.updateProperty(
            "SecurityClass",
            option.key !== "" ? option.key : null
          );
          this.forceUpdate();
        }}
        disabled={this.props.status === ReportStatus.PUBLISHED}
        errorMessage={Helper.setEmptyIfNull(
          this.props.validation.SecurityClass
        )}
      />
    );
  }

  renderReportType() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis ||
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Report type",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.DocumentType}
          </RbLabel>
        </span>,
        <Dropdown
          selectedKey={this.props.data.DocumentType}
          placeholder="Choose a report type ..."
          options={this.props.reportTypes}
          onChange={(event, option: IDropdownOption) => {
            this.props.updateProperty("DocumentType", option.key);
            this.forceUpdate();
          }}
          errorMessage={Helper.setEmptyIfNull(
            this.props.validation.DocumentType
          )}
        />
      );
    }
    return null;
  }

  renderReportNumber() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Report number",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.DocumentNumber}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.DocumentNumber}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "DocumentNumber",
              event.currentTarget.value
            );
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.DocumentNumber),
        true
      );
    }
    return null;
  }

  renderProjectNumber() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Project number",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.ProjectNumber}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.ProjectNumber}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "ProjectNumber",
              event.currentTarget.value
            );
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.ProjectNumber),
        true
      );
    }
    return null;
  }

  renderPlantBU() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Plant/Business unit",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.PlantorBU}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.PlantorBU}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("PlantorBU", event.currentTarget.value);
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.PlantorBU)
      );
    }
    return null;
  }

  renderProduct() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Product",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.Product}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.Product}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("Product", event.currentTarget.value);
            this.forceUpdate();
          }}
          disabled={
            Helper.setEmptyIfNull(this.props.data.Process).trim() !== ""
          }
        />,
        Helper.setEmptyIfNull(this.props.validation.Product)
      );
    }
    return null;
  }

  renderProcess() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Process",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.Process}
          </RbLabel>{" "}
        </span>,
        <RbTextField
          value={this.props.data.Process}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("Process", event.currentTarget.value);
            this.forceUpdate();
          }}
          disabled={
            Helper.setEmptyIfNull(this.props.data.Product).trim() !== ""
          }
        />,
        Helper.setEmptyIfNull(this.props.validation.Process)
      );
    }
    return null;
  }

  renderIQISNumber() {
    if (this.props.data.UploadType === Constants.DOCUMENT_TYPE.LL) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "IQIS number",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.IQISNumber}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.IQISNumber}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("IQISNumber", event.currentTarget.value);
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.IQISNumber),
        true
      );
    }
    return null;
  }

  renderNameOfConference() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
      this.props.data.DocumentType === "Conference Paper"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Name of conference",
        <span className="textarea-transparent">
          <RbLabel>{this.props.data.NameOfConference}</RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.NameOfConference}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "NameOfConference",
              event.currentTarget.value
            );
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.NameOfConference)
      );
    }
    return null;
  }

  renderLocationOfConference() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
      this.props.data.DocumentType === "Conference Paper"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Location of conference",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.LocationOfConference}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.LocationOfConference}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "LocationOfConference",
              event.currentTarget.value
            );
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.LocationOfConference)
      );
    }
    return null;
  }

  renderDateOfConference() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
      this.props.data.DocumentType === "Conference Paper"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Date of conference",
        <span className="textarea-transparent">
          <RbLabel hasPadding={true}>
            {Helper.getDateTimeFormatForUI(this.props.data.DateOfConference)}
          </RbLabel>
        </span>,
        <DatePicker
          value={Helper.parseDate(this.props.data.DateOfConference)}
          onSelectDate={(date: Date) => {
            this.props.updateProperty("DateOfConference", date);
          }}
          errorMessage={this.props.validation.DateOfConference}
        />
      );
    }
    return null;
  }

  renderNameOfJournal() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
      this.props.data.DocumentType === "Journal Paper"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Name of journal",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.NameOfJournal}
          </RbLabel>
        </span>,
        <RbTextField
          value={this.props.data.NameOfJournal}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty(
              "NameOfJournal",
              event.currentTarget.value
            );
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.NameOfJournal)
      );
    }
    return null;
  }

  renderDateOfPublication() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper &&
      this.props.data.DocumentType === "Journal Paper"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Date of publication",
        <span className="textarea-transparent">
          <RbLabel hasPadding={true}>
            {Helper.getDateTimeFormatForUI(this.props.data.DateOfPublication)}
          </RbLabel>
        </span>,
        <DatePicker
          value={Helper.parseDate(this.props.data.DateOfPublication)}
          onSelectDate={(date: Date) => {
            this.props.updateProperty("DateOfPublication", date);
          }}
          errorMessage={this.props.validation.DateOfPublication}
        />
      );
    }
    return null;
  }

  renderAbstract() {
    if (
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis ||
      this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Abstract",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.Abstract}
          </RbLabel>
        </span>,
        <RbTextField
          isMultiple={true}
          minRows={2}
          value={this.props.data.Abstract} //Previous minRows={5}
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("Abstract", event.currentTarget.value);
          }}
        />,
        Helper.setEmptyIfNull(this.props.validation.Abstract)
      );
    }
    return null;
  }

  renderAdditionalApprovers() {
    return Template.renderAccessMediatorRowTemplate(
      this.props.mode,
      "Additional approvers",
      Template.renderReadOnlyPeoplePickerTags(
        Helper.getPeoplePickerStringByObjectArray(
          this.props.data.AdditionalApprovers
        )
      ),
      <PeoplePicker
        principalType="User"
        defaultValue={this.props.data.AdditionalApprovers}
        path={this.props.data.Path}
        uploadType={this.props.data.UploadType}
        componentRef={this.additionalApproversRef}
        onChange={() => {
          let items = this.additionalApproversRef.current.getSelectedItems();
          let results: any[] = [];
          items.forEach((item: any) => {
            results.push({
              Id: item.id,
              Title: item.displayName,
            });
          });
          this.props.updateProperty("AdditionalApprovers", results);
        }}
      />
    );
  }

  renderNotificationUsers() {
    if (
      this.props.hasAdminPermission === true ||
      (this.props.status !== ReportStatus.PUBLISHED &&
        this.props.mode === "Edit")
    ) {
      if (
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis ||
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.Paper
      ) {
        let notificationUsers_EditMode =
          this.props.status === ReportStatus.PUBLISHED ? (
            Template.renderReadOnlyPeoplePickerTags(
              Helper.getPeoplePickerStringByObjectArray(
                this.props.data.NotificationUsers
              )
            )
          ) : (
            <PeoplePicker
              principalType="User"
              defaultValue={this.props.data.NotificationUsers}
              path={this.props.data.Path}
              uploadType={this.props.data.UploadType}
              componentRef={this.notificationUsersRef}
              onChange={() => {
                let items =
                  this.notificationUsersRef.current.getSelectedItems();
                let results: any[] = [];
                items.forEach((item: any) => {
                  results.push({
                    Id: item.id,
                    Title: item.displayName,
                  });
                });
                this.props.updateProperty("NotificationUsers", results);
              }}
            />
          );
        let element = (
          <React.Fragment>
            {/* Notification users */}
            {Template.renderAccessMediatorRowTemplate(
              this.props.mode,
              "Notification users",
              Template.renderReadOnlyPeoplePickerTags(
                Helper.getPeoplePickerStringByObjectArray(
                  this.props.data.NotificationUsers
                )
              ),
              notificationUsers_EditMode,
              this.props.validation.NotificationUsers
            )}
            {/* Notify to */}
            {this.props.mode === "Edit" &&
            this.props.status === ReportStatus.PUBLISHED
              ? Template.renderAccessMediatorRowTemplate(
                  this.props.mode,
                  "Notify to",
                  null,
                  <PeoplePicker
                    principalType="User"
                    path={this.props.data.Path}
                    uploadType={this.props.data.UploadType}
                    componentRef={this.notifyToRef}
                    onChange={() => {
                      let items = this.notifyToRef.current.getSelectedItems();
                      let results: any[] = [];
                      items.forEach((item: any) => {
                        results.push({
                          Id: item.id,
                          Title: item.displayName,
                        });
                      });
                      this.props.updateProperty("NotifyTo", results);
                    }}
                  />
                )
              : null}
          </React.Fragment>
        );
        return element;
      }
    }
    return null;
  }

  renderAuthorizedAssociates() {
    if (
      this.props.hasAdminPermission === true ||
      (this.props.status !== ReportStatus.PUBLISHED &&
        this.props.mode === "Edit")
    ) {
      if (
        (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
          this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis) &&
        this.props.data.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1
      ) {
        return Template.renderAccessMediatorRowTemplate(
          this.props.mode,
          "Authorized associates",
          Template.renderReadOnlyPeoplePickerTags(
            Helper.getPeoplePickerStringByObjectArray(
              this.props.data.AuthorizedAssociates
            )
          ),
          <PeoplePicker
            principalType="User"
            defaultValue={this.props.data.AuthorizedAssociates}
            path={this.props.data.Path}
            uploadType={this.props.data.UploadType}
            componentRef={this.authorizedAssociatesRef}
            onChange={() => {
              let items =
                this.authorizedAssociatesRef.current.getSelectedItems();
              let results: any[] = [];
              items.forEach((item: any) => {
                results.push({
                  Id: item.id,
                  Title: item.displayName,
                });
              });
              this.props.updateProperty("AuthorizedAssociates", results);
            }}
          />
        );
      }
    }
    return null;
  }

  renderOrganizationalUnits() {
    if (
      this.props.hasAdminPermission === true ||
      (this.props.status !== ReportStatus.PUBLISHED &&
        this.props.mode === "Edit")
    ) {
      if (
        this.props.data.SecurityClass ===
          Constants.SECURITY_CLASS_LONG_NAME.SC2 &&
        (this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
          this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis)
      ) {
        return Template.renderAccessMediatorRowTemplate(
          this.props.mode,
          "Organizational units",
          Template.renderReadOnlyPeoplePickerTags(
            Helper.getPeoplePickerStringByObjectArray(
              this.props.data.OrganizationalUnits
            )
          ),
          <PeoplePicker
            principalType="SecurityGroup"
            defaultValue={this.props.data.OrganizationalUnits}
            path={this.props.data.Path}
            uploadType={this.props.data.UploadType}
            componentRef={this.organizationalUnitsRef}
            onChange={() => {
              let items =
                this.organizationalUnitsRef.current.getSelectedItems();
              let results: any[] = [];
              items.forEach((item: any) => {
                results.push({
                  Id: item.id,
                  Title: item.displayName,
                });
              });
              this.props.updateProperty("OrganizationalUnits", results);
            }}
          />
        );
      }
    }
    return null;
  }

  renderCustomACL() {
    if (
      this.props.hasAdminPermission === true &&
      this.props.status === ReportStatus.PUBLISHED &&
      this.props.data.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1
    ) {
      if (
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.RnD ||
        this.props.data.UploadType === Constants.DOCUMENT_TYPE.Thesis
      ) {
        return Template.renderAccessMediatorRowTemplate(
          this.props.mode,
          "CustomACL",
          Template.renderReadOnlyPeoplePickerTags(
            Helper.getPeoplePickerStringByObjectArray(this.props.data.CustomACL)
          ),
          <PeoplePicker
            principalType="All"
            defaultValue={this.props.data.CustomACL}
            path={this.props.data.Path}
            uploadType={this.props.data.UploadType}
            componentRef={this.customACLRef}
            onChange={() => {
              let items = this.customACLRef.current.getSelectedItems();
              let results: any[] = [];
              items.forEach((item: any) => {
                results.push({
                  Id: item.id,
                  Title: item.displayName,
                });
              });
              this.props.updateProperty("CustomACL", results);
            }}
          />
        );
      }
    }
    return null;
  }

  renderComment() {
    if (
      this.props.status !== ReportStatus.PUBLISHED &&
      this.props.mode === "Edit"
    ) {
      return Template.renderAccessMediatorRowTemplate(
        this.props.mode,
        "Comment",
        <span className="textarea-transparent">
          <RbLabel isMultipleLines={true} maxLines={10} hasPadding={true}>
            {this.props.data.Comment}
          </RbLabel>
        </span>,
        <RbTextField
          minRows={5}
          maxRows={8}
          isMultiple={true}
          value={this.props.data.Comment}
          placeholder="If there is any further information you want to tell the approvers before reviewing your document, you can let them know here."
          onChange={(event: React.ChangeEvent<any>) => {
            this.props.updateProperty("Comment", event.currentTarget.value);
          }}
        />,
        "",
        true,
        "(Optional – will only be seen by the approvers)"
      );
    }
    return null;
  }
}

const mapStateToProps = (state: RootState) => ({
  data: state.accessMediator.data,
  validation: state.accessMediator.validation,
  mode: state.accessMediator.mode,
  status: state.accessMediator.status,
  securityClasses: state.accessMediator.securityClasses,
  reportTypes: state.accessMediator.reportTypes,
});

export default connect(mapStateToProps, {
  updateProperty,
})(RightColumn);
