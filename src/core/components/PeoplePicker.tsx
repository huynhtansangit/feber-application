import * as React from "react";
import axios from "axios";
import BaseService from "../../services/BaseService";
import { BaseComponent } from "@fluentui/react/lib/Utilities";
import { IPersonaProps } from "@fluentui/react/lib/Persona";
import {
  IBasePickerSuggestionsProps,
  IBasePicker,
  NormalPeoplePicker,
  ValidationState,
} from "@fluentui/react/lib/Pickers";
import Environment from "../../Environment";
import "@pnp/polyfill-ie11";
import { sp, SPRest } from "@pnp/sp/presets/all";
import _ from "lodash";

export interface IPeoplePickerExampleState {
  currentPicker?: number | string;
  delayResults?: boolean;
  peopleList: IPersonaProps[];
  currentSelectedItems?: IPersonaProps[];
  isPickerDisabled?: boolean;
  isValid?: boolean | null;
  principalType: number;
  path: string;
  uploadType: string;
}

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: "Suggested People",
  mostRecentlyUsedHeaderText: "Suggested Contacts",
  noResultsFoundText: "No results found",
  loadingText: "Loading",
  showRemoveButtons: false,
  suggestionsAvailableAlertText: "People Picker Suggestions available",
  suggestionsContainerAriaLabel: "Suggested contacts",
};

export class PeoplePicker extends BaseComponent<
  any,
  IPeoplePickerExampleState
> {
  // All pickers extend from BasePicker specifying the item type.
  private _picker = React.createRef<IBasePicker<IPersonaProps>>();
  private _event = "none";
  private _clipboardData = "";
  private _baseService = new BaseService();
  private _reportSite = '';
  private _principleType: any = {
    None: 0,
    User: 1,
    DistributionList: 2,
    SecurityGroup: 4,
    SharePointGroup: 8,
    All: 15,
  };
  sp: SPRest = sp;
  
  constructor(props: any) {
    super(props);

    this.state = {
      currentPicker: 1,
      delayResults: false,
      peopleList: [],
      currentSelectedItems: [],
      isPickerDisabled: false,
      isValid: null,
      principalType: !_.isUndefined(this.props.principalType)
        ? this._principleType[this.props.principalType]
        : 1,
      path: "",
      uploadType: "",
    };
    this.sp.setup({
      ie11: true,
      sp: {
        headers: {
          Accept: "application/json; odata=verbose",
        },
        baseUrl: Environment.rootWeb,
      },
    });
  }

  componentDidMount() {
    // console.log(">>>>Check props", this.props);
    if (!_.isUndefined(this.props.defaultValue)) {
      this.setItems(!!this.props.defaultValue ? this.props.defaultValue : []);
    }
    // console.log(">>>>Check path uploadType",this.props.path,this.props.uploadType);
    // console.log(!!this.props.path,!!this.props.uploadType);
    this._reportSite = (!!this.props.path || !!this.props.uploadType)?  this.props.path.split('/'+this.props.uploadType)[0]:Environment.rootWeb;
    // this._reportSite = Environment.rootWeb;
  }

  public render() {
    let currentPicker: JSX.Element;

    currentPicker = this._renderNormalPicker();

    return <div>{currentPicker}</div>;
  }

  private _getTextFromItem(persona: IPersonaProps): string {
    return persona.text as string;
  }

  private _renderNormalPicker() {
    let errorMessageStyle: React.CSSProperties = {
      fontFamily:
        '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      fontSize: "12px",
      fontWeight: 400,
      color: "#a80000",
      margin: "0px",
      paddingTop: "5px",
      display: "flex",
      alignItems: "center",
    };
    return (
      <div className={this.state.isValid === false ? "invalid" : ""}>
        <NormalPeoplePicker
          itemLimit={
            !_.isNil(this.props.itemLimit) ? this.props.itemLimit : undefined
          }
          selectedItems={this.state.currentSelectedItems}
          onResolveSuggestions={this._onFilterChanged}
          getTextFromItem={this._getTextFromItem}
          pickerSuggestionsProps={suggestionProps}
          className={"ms-PeoplePicker"}
          key={"normal"}
          onRemoveSuggestion={this._onRemoveSuggestion}
          onValidateInput={this._validateInput}
          removeButtonAriaLabel={"Remove"}
          inputProps={{
            onPaste: (ev) => this._onPasteValue(ev.clipboardData),
            "aria-label": "People Picker",
            placeholder:
              this.state.principalType !==
                this._principleType.DistributionList &&
              this.state.principalType !== this._principleType.SecurityGroup
                ? "Enter names or email addresses..."
                : "Enter department names...",
          }}
          componentRef={this._picker}
          onInputChange={this._onInputChange}
          resolveDelay={300}
          disabled={this.state.isPickerDisabled}
          onChange={(items: IPersonaProps[] | undefined) => {
            if (!_.isUndefined(items)) {
              let tempUsers: IPersonaProps[] = [];
              items.forEach((item) => {
                if (tempUsers.length === 0) {
                  tempUsers.push(item);
                } else {
                  let found = false;
                  tempUsers.forEach((user) => {
                    if (item.secondaryText === user.secondaryText) {
                      found = true;
                    }
                  });
                  if (found === false) {
                    tempUsers.push(item);
                  }
                }
              });
              this.setState(
                {
                  currentSelectedItems: tempUsers,
                  isValid:
                    this.props.isRequired === true ? items.length > 0 : true,
                },
                () => {
                  if (!_.isUndefined(this.props.onChange)) {
                    this.props.onChange();
                  }
                }
              );
            }
          }}
        />
        {this.props.isRequired === true && this.state.isValid === false ? (
          <p className="ms-TextField-errorMessage" style={errorMessageStyle}>
            {this.props.errorMessage}
          </p>
        ) : (
          ""
        )}
      </div>
    );
  }

  public validate() {
    let result = true;
    if (this.props.isRequired === true) {
      if (
        !_.isUndefined(this.state.currentSelectedItems)
          ? this.state.currentSelectedItems.length === 0
          : true
      ) {
        result = false;
        this.setState({
          isValid: false,
        });
      }
    }
    return result;
  }

  public _onPasteValue(clipboardData: DataTransfer) {
    this._event = "paste";
    this._clipboardData = clipboardData
      .getData("Text")
      .replace(/(?:\r\n|\r|\n)/g, "");
  }

  private _onFilterChanged = (
    filterText: string,
    currentPersonas: IPersonaProps[] | undefined,
    limitResults?: number
  ): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText) {
      if (this._event === "paste") {
        // On paste
        filterText = this._clipboardData;
        let promise = new Promise<IPersonaProps[]>((resolve) => {
          this.searchByPaste(filterText, resolve);
          (this._picker.current as any).input.current._updateValue("");
        });
        this._event = "none";
        return promise;
      } else {
        // On type
        let promise = new Promise<IPersonaProps[]>((resolve) => {
          this.searchByType(filterText, resolve);
        });
        return promise;
      }
    } else {
      return [];
    }
  };

  private searchByPaste(filterText: string, resolve: any) {
    setTimeout(() => {
      let subtxt = filterText.split(";");
      for (let i = 0; i < subtxt.length; i++) {
        let temptxt = subtxt[i].trim();
        if (temptxt.indexOf("<") > -1) {
          temptxt = temptxt.split("<")[1].replace(">", "");
        }
        this.searchByText(temptxt, true);
      }
    }, 300);
  }

  private searchByType(filterText: string, resolve: any) {
    let peoplePickerQuery = Object.assign({
      queryParams: {
        QueryString: filterText,
        MaximumEntitySuggestions: 10,
        AllowEmailAddresses: true,
        PrincipalSource: 15,
        PrincipalType: this.state.principalType,
        SharePointGroupID: 0,
      },
    });
    this.getUserSuggestions(peoplePickerQuery)
      .then((results: any[]) => {
        let tempPeopleList: IPersonaProps[] = [];
        let getSpUserFuncs: any[] = [];
        results.forEach((result) => {
          if (result.EntityData.PrincipalType === "SharePointGroup") {
            getSpUserFuncs.push(
              new Promise((resolve) => {
                resolve({
                  data: {
                    Title: result.EntityData.AccountName,
                    Id: result.EntityData.SPGroupID,
                  },
                });
              })
            );
          } else if (result.EntityData.Email !== "") {
            this._baseService.goToSiteByFullUrl(this._reportSite);
            getSpUserFuncs.push(sp.web.ensureUser(result.EntityData.Email));
          }
          // else if (result.Description !== "") {
          //   getSpUserFuncs.push(sp.web.ensureUser(result.Description));
          // }
        });
        Promise.all(getSpUserFuncs).then((rs) => {
          rs.forEach((user) => {
            if (!_.isUndefined(user.data)) {
              tempPeopleList.push({
                text: user.data.Title,
                showSecondaryText: false,
                secondaryText: user.data.Id,
              });
            }
          });
          resolve(tempPeopleList);
        });
      })
      .catch(() => {
        resolve([]);
      });
  }

  private searchByText(filterText: string, isPasted: boolean = false) {
    let promise = new Promise<IPersonaProps[]>((resolve) => {
      let peoplePickerQuery = Object.assign({
        queryParams: {
          QueryString: filterText,
          MaximumEntitySuggestions: 10,
          AllowEmailAddresses: true,
          PrincipalSource: 15,
          PrincipalType: this.state.principalType,
          SharePointGroupID: 0,
        },
      });
      this.getUserSuggestions(peoplePickerQuery).then((results: any[]) => {
        let tempPeopleList: IPersonaProps[] = [];
        let getSpUserFuncs: any[] = [];
        results.forEach((result) => {
          if (result.EntityData.PrincipalType === "SharePointGroup") {
            getSpUserFuncs.push(
              new Promise((resolve) => {
                resolve({
                  data: {
                    Title: result.EntityData.AccountName,
                    Id: result.EntityData.SPGroupID,
                  },
                });
              })
            );
          } else if (result.EntityData.Email !== "") {
            getSpUserFuncs.push(sp.web.ensureUser(result.EntityData.Email));
          }
          // else if (result.Description !== "") {
          //   getSpUserFuncs.push(sp.web.ensureUser(result.Description));
          // }
        });
        Promise.all(getSpUserFuncs).then((rs) => {
          rs.forEach((user) => {
            if (!_.isUndefined(user.data)) {
              tempPeopleList.push({
                text: user.data.Title,
                showSecondaryText: false,
                secondaryText: user.data.Id,
              });
            }
          });
          if (tempPeopleList.length === 1) {
            let items = this.state.currentSelectedItems as any[];
            let found = false;
            if (!_.isUndefined(items)) {
              items.forEach((item) => {
                if (item.secondaryText === tempPeopleList[0].secondaryText) {
                  found = true;
                }
              });
            }
            if (found === false) {
              items.push(tempPeopleList[0]);
              this.setState({ currentSelectedItems: items }, () => {
                this.props.onChange();
              });
            }
            resolve([]);
          } else {
            this.searchByType(filterText, resolve);
          }
        });
      });
    });
    return promise;
  }

  private _onRemoveSuggestion = (item: IPersonaProps): void => {
    const { peopleList } = this.state;
    const indexPeopleList: number = peopleList.indexOf(item);

    if (indexPeopleList >= 0) {
      const newPeople: IPersonaProps[] = peopleList
        .slice(0, indexPeopleList)
        .concat(peopleList.slice(indexPeopleList + 1));
      this.setState({ peopleList: newPeople });
    }
  };

  private _validateInput = (input: string): ValidationState => {
    if (input.indexOf("@") !== -1) {
      return ValidationState.valid;
    } else if (input.length > 1) {
      return ValidationState.warning;
    } else {
      return ValidationState.invalid;
    }
  };

  private _onInputChange(input: string): string {
    const outlookRegEx = /<.*>/g;
    const emailAddress = outlookRegEx.exec(input);

    if (emailAddress && emailAddress[0]) {
      return emailAddress[0].substring(1, emailAddress[0].length - 1);
    }

    return input;
  }

  // Get Data

  public getUserSuggestions(query: PeoplePickerQuery): Promise<any> {
    let promise = new Promise((resolve) => {
      axios
        .post(this._reportSite +"/_api/contextinfo", null, {
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json",
          },
        })
        .then((xRequest) => {
          const digest = (xRequest as any).data.d.GetContextWebInformation
            .FormDigestValue;
          const headers = {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          };
          const httpOptions = {
            headers: headers,
          };
          const PEOPLE_PICKER_URL =
            "/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser";

          axios
            .post(
              this._reportSite + PEOPLE_PICKER_URL,
              query,
              httpOptions
            )
            .then((results) => {
              let jsonData = JSON.parse(
                (results as any).data.d.ClientPeoplePickerSearchUser
              );

              resolve(jsonData);
            })
            .catch(() => {
              resolve([]);
            });
        })
        .catch(() => {
          resolve([]);
        });
    });
    return promise;
  }

  // Get Selected Users/Departments
  public getSelectedItems() {
    let items: any[] = [];
    if (!_.isUndefined(this.state.currentSelectedItems)) {
      this.state.currentSelectedItems.forEach((item) => {
        items.push({
          displayName: item.text,
          id: item.secondaryText,
        });
      });
    }
    return items;
  }

  // Set user/departments
  public setItems(items: any[]) {
    let _items: any[] = [];
    items.forEach((item: any) => {
      _items.push({
        text: item.Title,
        showSecondaryText: false,
        secondaryText: item.Id,
      });
    });
    this.setState({ currentSelectedItems: _items });
  }
}

export interface PeoplePickerQuery {
  queryParams: PeoplePickerQueryParams;
}

export interface PeoplePickerQueryParams {
  QueryString: string;
  MaximumEntitySuggestions: number;
  AllowEmailAddresses: boolean;
  PrincipalType: number;
  PrincipalSource: number;
  SharePointGroupID: number;
}
