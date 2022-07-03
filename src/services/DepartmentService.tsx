import Helper from "../core/libraries/Helper";
import Properties_RnD from "../models/Properties_RnD";
import Properties_LL from "../models/Properties_LL";
import Properties_Thesis from "../models/Properties_Thesis";
import Properties_Paper from "../models/Properties_Paper";
import MigrationService from "./MigrationService";
import IDMService from "./IDMService";
import SystemService from "./SystemService";
import Properties_Common from "../models/Properties_Common";
import Environment from "../Environment";
import Constants from "../core/libraries/Constants";
import BaseService from "./BaseService";
import "@pnp/polyfill-ie11";
import {
  Web,
  IWeb,
  IAttachmentInfo,
  IListEnsureResult,
} from "@pnp/sp/presets/all";
import { IUserPermissions, IUserProfile } from "../store/permission/types";
import _ from "lodash";
import { setTimeout } from "timers";
import { RootState } from "../store/configureStore";
import { connect } from "react-redux";

interface ISiteUrl {
  rootSite?: string;
  documentType: string;
  division: string;
}

class DepartmentService extends BaseService {
  migrationDataSrv: MigrationService = new MigrationService();
  idmSrv: IDMService = new IDMService();
  systemListsSrv: SystemService = new SystemService();

  goToSubsite(currentReportSiteUrl: ISiteUrl) {
    this.sp.setup({
      sp: {
        headers: {
          Accept: "application/json; odata=verbose",
        },
        baseUrl: `${
          !!currentReportSiteUrl.rootSite
            ? currentReportSiteUrl.rootSite
            : Environment.rootWeb
        }/${currentReportSiteUrl.documentType}/${
          currentReportSiteUrl.division
        }`,
      },
    });
  }

  getListItemBySearchResult(searchResult: any, _reportSiteUrl?: string) {
    let reportSiteUrl =
      `${!!_reportSiteUrl ? _reportSiteUrl : Environment.rootWeb}` +
      "/" +
      searchResult.UploadType +
      "/" +
      searchResult.Division;
    let web = Web(reportSiteUrl);
    let listName = Helper.getListName(
      searchResult.UploadType,
      searchResult.SecurityClass,
      searchResult.Department
    );
    return web.lists
      .getByTitle(listName)
      .items.getById(parseInt(searchResult.ListItemID))
      .select("*", "ReportAuthor/Title")
      .expand("ReportAuthor")
      .get();
  }

  getListsBySecurityClasses(scArr: string[]): Promise<any[]> {
    let promise: Promise<any[]> = new Promise((resolve) => {
      this.sp.web.lists
        .get()
        .then((results: any[]) => {
          let rs: any[] = [];
          results.forEach((list) => {
            scArr.forEach((sc) => {
              if (list.Title.indexOf(sc) > -1) {
                rs.push(list);
              }
            });
          });
          resolve(rs);
        })
        .catch(() => {
          resolve([]);
        });
    });
    return promise;
  }

  getUniqueDepartments(documentType: string, division: string): Promise<any[]> {
    let promise: Promise<any[]> = new Promise((resolve) => {
      let docTypes: any[] = [];
      if (documentType !== "") {
        docTypes.push(documentType);
      } else {
        docTypes = [
          Constants.DOCUMENT_TYPE.RnD,
          Constants.DOCUMENT_TYPE.LL,
          Constants.DOCUMENT_TYPE.Thesis,
          Constants.DOCUMENT_TYPE.Paper,
        ];
      }
      let getFunctions: any[] = [];
      docTypes.forEach((docType) => {
        this.goToSubsite({
          rootSite: "",
          documentType: documentType,
          division: division,
        });
        getFunctions.push(this.sp.web.lists.get());
      });
      Promise.all(getFunctions)
        .then((typeResults) => {
          let listNames: string[] = [];
          typeResults.forEach((listResults) => {
            listResults.forEach((list: any) => {
              listNames.push(list.Title);
            });
          });
          // remove SC, replace /
          let changedNames: string[] = [];
          listNames.forEach((name) => {
            let newName = name
              .replace("-SC1", "")
              .replace("-SC2", "")
              .replace("-SC3", "")
              .replace("_", "/");
            changedNames.push(newName);
          });
          // remove duplicated departments
          let results: string[] = [];
          changedNames.forEach((listName) => {
            if (Helper.checkExistInSystemLists(listName) === false) {
              if (results.length === 0) {
                results.push(listName);
              } else {
                let found = false;
                results.forEach((result) => {
                  if (result === listName) {
                    found = true;
                  }
                });
                if (found === false) {
                  results.push(listName);
                }
              }
            }
          });
          results.sort();
          resolve(results);
        })
        .catch(() => {
          resolve([]);
        });
    });
    return promise;
  }

  updateCustomACL(listName: string, addedCustomACL: number[]) {
    let promise = new Promise((resolve) => {
      this.sp.web.lists
        .getByTitle(listName)
        .items.getAll()
        .then((items: any[]) => {
          // Get current CustomACL value
          let customACLArr: any[] = [];
          items.forEach((item) => {
            customACLArr.push(
              !_.isNil(item["CustomACLId"])
                ? (item["CustomACLId"].results as any[])
                : []
            );
          });

          // Add new added CustomACL
          customACLArr.forEach((customACL: any[]) => {
            addedCustomACL.forEach((newACL) => {
              customACL.push(newACL);
            });
          });

          // Prepare to update
          let updateFunctions = [];
          for (let index = 0; index < items.length; index++) {
            const item = items[index];
            let updatedObj = {
              CustomACLId: {
                results: customACLArr[index],
              },
            };
            updateFunctions.push(
              this.sp.web.lists
                .getByTitle(listName)
                .items.getById(item.Id)
                .update(updatedObj)
            );
          }

          // Update
          Promise.all(updateFunctions)
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        })
        .catch(() => {
          resolve(false);
        });
    });
    return promise;
  }

  checkExistingDepartmentList(listName: string): Promise<boolean> {
    let promise: Promise<boolean> = new Promise((resolve) => {
      this.sp.web.lists
        .getByTitle(listName)
        .get()
        .then(() => {
          console.log(">>>>>checkExistingDepartmentList", "success");
          resolve(true);
        })
        .catch(() => {
          console.log(">>>>>checkExistingDepartmentList", "failure");
          resolve(false);
        });
    });
    return promise;
  }

  createDepartmentLists(uploadTypeGroups: any[]) {
    let promise = new Promise((resolve) => {
      let createFunctions: any[] = [];
      uploadTypeGroups.forEach((group) => {
        let web = Web(
          Environment.rootWeb + "/" + group.UploadType + "/" + group.Division
        );
        group.DepartmentLists.forEach((list: string) => {
          createFunctions.push(
            this.createDepartmentList(web, list, group.UploadType).catch(() => {
              return false;
            })
          );
        });
      });
      Promise.all(createFunctions).then(() => {
        resolve(true);
      });
    });
    return promise;
  }

  createDepartmentList(
    web: IWeb,
    listName: string,
    documentType: any,
    currentReportSiteUrl?: string
  ) {
    let promise = new Promise((resolve) => {
      web.lists
        .add(
          listName, // List name
          "", // Description
          100, // Template (Custom List)
          true // Use content type
        )
        .then(() => {
          console.log(">>>createDepartmentList", "success");
          this._configList(
            web,
            listName,
            documentType,
            resolve,
            currentReportSiteUrl
          );
        })
        .catch(() => {
          console.log(">>>createDepartmentList", "failure");
          resolve(false);
        });
    });
    return promise;
  }

  private _configList(
    web: IWeb,
    listName: string,
    documentType: string,
    rootResolve: any,
    currentReportSiteUrl?: string
  ) {
    let currentWeb = Web(currentReportSiteUrl);
    // Get Content Types
    currentWeb.contentTypes.get().then((contentTypes: any[]) => {
      Helper.showTrackingLog("getContentType success", contentTypes);
      // Get Feber Content Type
      let contentTypeId = contentTypes.filter(
        (x) =>
          x.Name === this._convertDocumentTypeToContentTypeName(documentType)
      )[0].StringId;
      // Add Feber Content Type
      web.lists
        .getByTitle(listName)
        .contentTypes.addAvailableContentType(contentTypeId)
        .then(() => {
          // Get all current list's content types
          web.lists
            .getByTitle(listName)
            .contentTypes.get()
            .then((listCTs: any[]) => {
              // Get content type id: item
              let listCTId = listCTs.filter((x) => x.Name === "Item")[0]
                .StringId;
              web.lists
                .getByTitle(listName)
                .contentTypes.getById(listCTId)
                .delete()
                .then(() => {
                  rootResolve(true);
                })
                .catch(() => {
                  rootResolve(false);
                });
            })
            .catch(() => {
              rootResolve(false);
            });
        })
        .catch(() => {
          rootResolve(false);
        });
    });
  }

  private _convertDocumentTypeToContentTypeName(documentType: string) {
    let result = "";
    switch (documentType) {
      case Constants.DOCUMENT_TYPE.RnD: {
        result = "ResearchReports";
        break;
      }
      case Constants.DOCUMENT_TYPE.LL: {
        result = "LessonsLearned";
        break;
      }
      case Constants.DOCUMENT_TYPE.Thesis:
      case Constants.DOCUMENT_TYPE.Paper: {
        result = documentType;
        break;
      }
    }
    return result;
  }

  createMigratedReports(items: any[]) {
    let promise = new Promise((resolve) => {
      let index: number = 0;
      this.createMigratedReportsByIteration(items, index, resolve);
    });
    return promise;
  }

  private createMigratedReportsByIteration(
    items: any[],
    index: number,
    mainResolve: any
  ) {
    let maxIndex = index + 10 < items.length ? index + 10 : items.length;
    let createFunctions: any[] = [];
    for (let i = index; i < maxIndex; i++) {
      const item = items[i];
      createFunctions.push(
        this._createMigratedReport(item).catch(() => {
          return false;
        })
      );
    }
    Promise.all(createFunctions)
      .then(() => {
        if (maxIndex < items.length) {
          this.createMigratedReportsByIteration(items, maxIndex, mainResolve);
        } else {
          mainResolve(true);
        }
      })
      .catch(() => {
        mainResolve(false);
      });
  }

  private _createMigratedReport(item: any) {
    let promise = new Promise((resolve) => {
      if (!_.isUndefined(item.Id)) {
        let newObj: any = new Properties_Common();
        switch (item.UploadType) {
          case Constants.DOCUMENT_TYPE.RnD: {
            newObj = new Properties_RnD();
            break;
          }
          case Constants.DOCUMENT_TYPE.LL: {
            newObj = new Properties_LL();
            break;
          }
          case Constants.DOCUMENT_TYPE.Thesis: {
            newObj = new Properties_Thesis();
            break;
          }
          case Constants.DOCUMENT_TYPE.Paper: {
            newObj = new Properties_Paper();
            break;
          }
          default: {
            resolve(false);
            break;
          }
        }
        // Remove extra field
        if (!_.isNil(newObj)) {
          delete newObj.ROU;
        }
        for (let key in newObj) {
          if (key.indexOf("Id") === -1) {
            newObj[key] = item[key];
          } else {
            if (item[key] === "") {
              newObj[key] = null;
            } else if (!_.isNil(item[key])) {
              newObj[key] = item[key];
            }
          }
          // Remove property: __metadata
          if (
            !_.isNil(newObj[key]) && !_.isUndefined(newObj[key])
              ? !_.isUndefined(newObj[key].__metadata)
              : false
          ) {
            delete newObj[key].__metadata;
          }
        }
        if (!_.isNil(newObj)) {
          let web = Web(
            Environment.rootWeb + "/" + item.UploadType + "/" + item.Division
          );
          web.lists
            .getByTitle(
              Helper.getListName(
                item.UploadType,
                item.SecurityClass,
                item.FeberDepartment
              )
            )
            .items.add(newObj)
            .then((createResult: any) => {
              let newItem = createResult.data;
              // Stop inheriting permission
              this._inheritItemPermissions(false, item, newItem.Id)
                .then(() => {
                  // Prepare to add attachment
                  this.migrationDataSrv
                    .updateMigrationInfo(
                      {
                        Status: "Pending Attachment",
                        TargetUrl:
                          Environment.rootWeb +
                          "/" +
                          newItem.UploadType +
                          "/" +
                          newItem.Division +
                          "/Lists/" +
                          Helper.getListNameUrl(newItem) +
                          "/DispForm.aspx?ID=" +
                          newItem.Id,
                      },
                      [{ Id: item.MigrationId }]
                    )
                    .then(() => {
                      // Get attachment name
                      this._getAttachmentName(item)
                        .then((attachments: IAttachmentInfo[]) => {
                          // Get attachment content
                          this._getAttachmentContent(item, attachments)
                            .then((attachmentContent: Blob) => {
                              // Add attachment
                              this._addAttachment(
                                item,
                                newItem,
                                attachments[0].FileName,
                                attachmentContent
                              )
                                .then(() => {
                                  this.migrationDataSrv
                                    .updateMigrationInfo(
                                      { Status: "Complete" },
                                      [{ Id: item.MigrationId }]
                                    )
                                    .then(() => {
                                      resolve(true);
                                    })
                                    .catch(() => {
                                      resolve(false);
                                    });
                                })
                                .catch(() => {
                                  this.migrationDataSrv
                                    .updateMigrationInfo(
                                      {
                                        Status: "Unsuccessful",
                                        ErrorMessage: "Time out",
                                      },
                                      [{ Id: item.MigrationId }]
                                    )
                                    .then(() => {
                                      resolve(true);
                                    })
                                    .catch(() => {
                                      resolve(false);
                                    });
                                });
                            })
                            .catch(() => {
                              // Exceptional case: Paper sometimes does not contain attachment
                              if (
                                item.UploadType ===
                                Constants.DOCUMENT_TYPE.Paper
                              ) {
                                this.migrationDataSrv
                                  .updateMigrationInfo({ Status: "Complete" }, [
                                    { Id: item.MigrationId },
                                  ])
                                  .then(() => {
                                    resolve(true);
                                  })
                                  .catch(() => {
                                    resolve(false);
                                  });
                              } else {
                                this.migrationDataSrv
                                  .updateMigrationInfo(
                                    {
                                      Status: "Unsuccessful",
                                      ErrorMessage: "No attachment found",
                                    },
                                    [{ Id: item.MigrationId }]
                                  )
                                  .then(() => {
                                    resolve(true);
                                  })
                                  .catch(() => {
                                    resolve(false);
                                  });
                              }
                            });
                        })
                        .catch(() => {
                          // Exceptional case: Paper sometimes does not contain attachment
                          if (
                            item.UploadType === Constants.DOCUMENT_TYPE.Paper
                          ) {
                            this.migrationDataSrv
                              .updateMigrationInfo({ Status: "Complete" }, [
                                { Id: item.MigrationId },
                              ])
                              .then(() => {
                                resolve(true);
                              })
                              .catch(() => {
                                resolve(false);
                              });
                          } else {
                            this.migrationDataSrv
                              .updateMigrationInfo(
                                {
                                  Status: "Unsuccessful",
                                  ErrorMessage: "No attachment found",
                                },
                                [{ Id: item.MigrationId }]
                              )
                              .then(() => {
                                resolve(true);
                              })
                              .catch(() => {
                                resolve(false);
                              });
                          }
                        });
                    });
                })
                .catch(() => {
                  this.migrationDataSrv
                    .updateMigrationInfo(
                      {
                        Status: "Unsuccessful",
                        ErrorMessage: "Stopping permission cannot be set",
                      },
                      [{ Id: item.MigrationId }]
                    )
                    .then(() => {
                      resolve(true);
                    })
                    .catch(() => {
                      resolve(false);
                    });
                });
            })
            .catch(() => {
              this.migrationDataSrv
                .updateMigrationInfo(
                  {
                    Status: "Unsuccessful",
                    ErrorMessage: "Something happened while creating meta-data",
                  },
                  [{ Id: item.MigrationId }]
                )
                .then(() => {
                  resolve(true);
                })
                .catch(() => {
                  resolve(false);
                });
            });
        }
      } else {
        resolve(false);
      }
    });
    return promise;
  }

  addPendingAttachments(items: any[]) {
    let promise = new Promise((resolve) => {
      items.forEach((item) => {
        // Get attachment name
        this._getAttachmentName(item)
          .then((attachments) => {
            // Get attachment content
            this._getAttachmentContent(item, attachments)
              .then((attachmentContent) => {
                // Add attachment
                this._addAttachment(
                  item,
                  item,
                  attachments[0].FileName,
                  attachmentContent
                )
                  .then(() => {
                    this.migrationDataSrv
                      .updateMigrationInfo({ Status: "Complete" }, [
                        { Id: item.MigrationId },
                      ])
                      .then(() => {
                        resolve(true);
                      })
                      .catch(() => {
                        resolve(false);
                      });
                  })
                  .catch(() => {
                    this.migrationDataSrv
                      .updateMigrationInfo(
                        { Status: "Unsuccessful", ErrorMessage: "Time out" },
                        [{ Id: item.MigrationId }]
                      )
                      .then(() => {
                        resolve(true);
                      })
                      .catch(() => {
                        resolve(false);
                      });
                  });
              })
              .catch(() => {
                this.migrationDataSrv
                  .updateMigrationInfo(
                    {
                      Status: "Unsuccessful",
                      ErrorMessage: "No attachment found",
                    },
                    [{ Id: item.MigrationId }]
                  )
                  .then(() => {
                    resolve(true);
                  })
                  .catch(() => {
                    resolve(false);
                  });
              });
          })
          .catch(() => {
            this.migrationDataSrv
              .updateMigrationInfo(
                { Status: "Unsuccessful", ErrorMessage: "No attachment found" },
                [{ Id: item.MigrationId }]
              )
              .then(() => {
                resolve(true);
              })
              .catch(() => {
                resolve(false);
              });
          });
      });
    });
    return promise;
  }

  private _getAttachmentName(item: any) {
    let web = Web(
      Environment.rootWeb + "/" + item.UploadType + "/" + item.SourceDivision
    );
    return web.lists
      .getByTitle(item.SourceList)
      .items.getById(item.SourceId)
      .attachmentFiles.get();
  }

  private _getAttachmentContent(item: any, attachments: any) {
    let web = Web(
      Environment.rootWeb + "/" + item.UploadType + "/" + item.SourceDivision
    );
    return web.lists
      .getByTitle(item.SourceList)
      .items.getById(item.SourceId)
      .attachmentFiles.getByName(attachments[0].FileName)
      .getBlob();
  }

  private _addAttachment(oldItem: any, newItem: any, name: any, content: any) {
    let web = Web(
      Environment.rootWeb + "/" + newItem.UploadType + "/" + newItem.Division
    );
    return web.lists
      .getByTitle(oldItem.TargetList)
      .items.getById(newItem.Id)
      .attachmentFiles.add(name, content);
  }

  private _inheritItemPermissions(isInherited: boolean, item: any, id: any) {
    let promise = new Promise((resolve) => {
      let web = Web(
        Environment.rootWeb + "/" + item.UploadType + "/" + item.Division
      );
      if (isInherited === false) {
        web.lists
          .getByTitle(
            Helper.getListName(
              item.UploadType,
              item.SecurityClass,
              item.FeberDepartment
            )
          )
          .items.getById(id)
          .breakRoleInheritance(false, true)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      } else {
        web.lists
          .getByTitle(
            Helper.getListName(
              item.UploadType,
              item.SecurityClass,
              item.FeberDepartment
            )
          )
          .items.getById(id)
          .resetRoleInheritance()
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      }
    });
    return promise;
  }

  removeMigratedLists(destination: string, items: any[]) {
    let promise = new Promise((resolve) => {
      let documentTypes: any[] = [];
      items.forEach((item) => {
        if (
          documentTypes.length === 0 ||
          documentTypes.indexOf(item.DocumentType) === -1
        ) {
          documentTypes.push(item.DocumentType);
        }
      });
      let getListItemsFunctions: any[] = [];
      let removeLists: any[] = [];
      documentTypes.forEach((documentType) => {
        let web = Web(
          Environment.rootWeb +
            "/" +
            documentType +
            "/" +
            items[0][destination + "Division"]
        );
        let department = items[0][destination + "List"]
          .replace("-SC1", "")
          .replace("-SC2", "")
          .replace("-SC3", "");
        // Get functions
        getListItemsFunctions.push(
          web.lists
            .getByTitle(department)
            .items.getAll()
            .catch(() => {
              return [];
            })
        );
        getListItemsFunctions.push(
          web.lists
            .getByTitle(department + "-SC1")
            .items.getAll()
            .catch(() => {
              return [];
            })
        );
        getListItemsFunctions.push(
          web.lists
            .getByTitle(department + "-SC2")
            .items.getAll()
            .catch(() => {
              return [];
            })
        );
        getListItemsFunctions.push(
          web.lists
            .getByTitle(department + "-SC3")
            .items.getAll()
            .catch(() => {
              return [];
            })
        );
        // Remove functions
        removeLists.push({
          listName: department,
          documentType: documentType,
          division: items[0][destination + "Division"],
        });
        removeLists.push({
          listName: department + "-SC1",
          documentType: documentType,
          division: items[0][destination + "Division"],
        });
        removeLists.push({
          listName: department + "-SC2",
          documentType: documentType,
          division: items[0][destination + "Division"],
        });
        removeLists.push({
          listName: department + "-SC3",
          documentType: documentType,
          division: items[0][destination + "Division"],
        });
      });
      Promise.all(getListItemsFunctions)
        .then((results) => {
          let filteredRemoveFunctions: any[] = [];
          for (let index = 0; index < results.length; index++) {
            const resultItems = results[index];
            if (resultItems.length === 0) {
              let web = Web(
                Environment.rootWeb +
                  "/" +
                  removeLists[index].documentType +
                  "/" +
                  removeLists[index].division
              );
              filteredRemoveFunctions.push(
                web.lists
                  .getByTitle(removeLists[index].listName)
                  .delete()
                  .catch(() => {
                    return false;
                  })
              );
            }
          }
          Promise.all(filteredRemoveFunctions)
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        })
        .catch(() => {
          resolve(false);
        });
    });
    return promise;
  }

  removeMigratedReports(items: any[], isCleaning: boolean = false) {
    let promise = new Promise((resolve) => {
      let index = 0;
      this._removeChainMigratedReport(items, index, resolve, isCleaning);
    });
    return promise;
  }

  private _removeChainMigratedReport(
    items: any[],
    index: any,
    resolve: any,
    isCleaning: boolean = false
  ) {
    const item = items[index];
    let id = !_.isNil(item.TargetUrl) ? item.TargetUrl.split("=")[1] : 0;
    let web = Web(
      Environment.rootWeb + "/" + item.DocumentType + "/" + item.TargetDivision
    );
    // Remove migrated reports
    web.lists
      .getByTitle(item.TargetList)
      .items.getById(id)
      .delete()
      .then(() => {
        if (isCleaning === false) {
          // Remove migration info
          this.migrationDataSrv
            .removeData(item.Id)
            .then(() => {
              index++;
              if (index > items.length - 1) {
                resolve(true);
              } else {
                this._removeChainMigratedReport(
                  items,
                  index,
                  resolve,
                  isCleaning
                );
              }
            })
            .catch(() => {
              index++;
              if (index > items.length - 1) {
                resolve(true);
              } else {
                this._removeChainMigratedReport(
                  items,
                  index,
                  resolve,
                  isCleaning
                );
              }
            });
        } else {
          // Update status to New
          this.migrationDataSrv
            .updateMigrationInfo({ Status: "New" }, [item])
            .then(() => {
              index++;
              if (index > items.length - 1) {
                resolve(true);
              } else {
                this._removeChainMigratedReport(
                  items,
                  index,
                  resolve,
                  isCleaning
                );
              }
            })
            .catch(() => {
              index++;
              if (index > items.length - 1) {
                resolve(true);
              } else {
                this._removeChainMigratedReport(
                  items,
                  index,
                  resolve,
                  isCleaning
                );
              }
            });
        }
      })
      .catch(() => {
        // Update status to New
        this.migrationDataSrv
          .updateMigrationInfo({ Status: "New" }, [item])
          .then(() => {
            index++;
            if (index > items.length - 1) {
              resolve(true);
            } else {
              this._removeChainMigratedReport(
                items,
                index,
                resolve,
                isCleaning
              );
            }
          })
          .catch(() => {
            index++;
            if (index > items.length - 1) {
              resolve(true);
            } else {
              this._removeChainMigratedReport(
                items,
                index,
                resolve,
                isCleaning
              );
            }
          });
      });
  }

  removeOldReports(items: any[]) {
    let promise = new Promise((resolve) => {
      let index = 0;
      this._removeChainOldReport(items, index, resolve);
    });
    return promise;
  }

  private _removeChainOldReport(items: any[], index: any, resolve: any) {
    const item = items[index];
    let id = !_.isNil(item.SourceUrl) ? item.SourceUrl.split("=")[1] : 0;
    let web = Web(
      Environment.rootWeb + "/" + item.DocumentType + "/" + item.SourceDivision
    );
    web.lists
      .getByTitle(item.SourceList)
      .items.getById(id)
      .get()
      .then(() => {
        // Check if the report could be found to be delete
        // Delete old reports
        web.lists
          .getByTitle(item.SourceList)
          .items.getById(id)
          .delete()
          .then(() => {
            // All new reports to be searched
            this._allowNewReportsSearch(item)
              .then(() => {
                // Remove migration info
                this.migrationDataSrv
                  .removeData(item.Id)
                  .then(() => {
                    index++;
                    if (index > items.length - 1) {
                      resolve(true);
                    } else {
                      this._removeChainOldReport(items, index, resolve);
                    }
                  })
                  .catch(() => {
                    index++;
                    if (index > items.length - 1) {
                      resolve(true);
                    } else {
                      this._removeChainOldReport(items, index, resolve);
                    }
                  });
              })
              .catch(() => {
                index++;
                if (index > items.length - 1) {
                  resolve(true);
                } else {
                  this._removeChainOldReport(items, index, resolve);
                }
              });
          })
          .catch(() => {
            index++;
            if (index > items.length - 1) {
              resolve(true);
            } else {
              this._removeChainOldReport(items, index, resolve);
            }
          });
      })
      .catch(() => {
        // If cannot find the old report, there is something wrong while approve, continue 2 last steps
        // All new reports to be searched
        this._allowNewReportsSearch(item)
          .then(() => {
            // Remove migration info
            this.migrationDataSrv
              .removeData(item.Id)
              .then(() => {
                index++;
                if (index > items.length - 1) {
                  resolve(true);
                } else {
                  this._removeChainOldReport(items, index, resolve);
                }
              })
              .catch(() => {
                index++;
                if (index > items.length - 1) {
                  resolve(true);
                } else {
                  this._removeChainOldReport(items, index, resolve);
                }
              });
          })
          .catch(() => {
            index++;
            if (index > items.length - 1) {
              resolve(true);
            } else {
              this._removeChainOldReport(items, index, resolve);
            }
          });
      });
  }

  private _allowNewReportsSearch(item: any) {
    let id = item.TargetUrl.split("=")[1];
    let web = Web(
      Environment.rootWeb + "/" + item.DocumentType + "/" + item.TargetDivision
    );
    return web.lists
      .getByTitle(item.TargetList)
      .items.getById(id)
      .resetRoleInheritance();
  }

  countEmptyLists(divisionCodeArr: string[]): Promise<any[]> {
    let promise: Promise<any[]> = new Promise(async (resolve) => {
      let getFunctions: any[] = [];
      for (let i = 0; i < divisionCodeArr.length; i++) {
        getFunctions.push(this._countEmptyListsByDivision(divisionCodeArr[i]));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      Promise.all(getFunctions)
        .then((rs) => {
          resolve(rs);
        })
        .catch(() => {
          resolve([]);
        });
    });
    return promise;
  }

  private _countEmptyListsByDivision(divisionCode: string) {
    let promise = new Promise((resolve) => {
      let getListFunctions = [];
      let rndWeb = Web(Environment.rootWeb + "/RnD/" + divisionCode);
      getListFunctions.push(rndWeb.lists.get());
      let llWeb = Web(Environment.rootWeb + "/LL/" + divisionCode);
      getListFunctions.push(llWeb.lists.get());
      let thesisWeb = Web(Environment.rootWeb + "/Thesis/" + divisionCode);
      getListFunctions.push(thesisWeb.lists.get());
      let paperWeb = Web(Environment.rootWeb + "/Paper/" + divisionCode);
      getListFunctions.push(paperWeb.lists.get());
      Promise.all(getListFunctions)
        .then((listsArray: any[]) => {
          this._countListItems(divisionCode, listsArray)
            .then((rs: any) => {
              resolve(rs);
            })
            .catch(() => {
              resolve({});
            });
        })
        .catch(() => {
          resolve({});
        });
    });
    return promise;
  }

  private _countListItems(divisionCode: string, listsArray: any[]): any | null {
    let promise = new Promise(async (resolve) => {
      let getListCountFunctions: any[] = [
        await this._countListItemsByDocumentType(
          Constants.DOCUMENT_TYPE.RnD,
          divisionCode,
          listsArray[0]
        ),
        await this._countListItemsByDocumentType(
          Constants.DOCUMENT_TYPE.LL,
          divisionCode,
          listsArray[1]
        ),
        await this._countListItemsByDocumentType(
          Constants.DOCUMENT_TYPE.Thesis,
          divisionCode,
          listsArray[2]
        ),
        await this._countListItemsByDocumentType(
          Constants.DOCUMENT_TYPE.Paper,
          divisionCode,
          listsArray[3]
        ),
      ];
      Promise.all(getListCountFunctions)
        .then((rs) => {
          let result: any = {
            RnDEmptyLists: rs[0].count,
            LLEmptyLists: rs[1].count,
            ThesisEmptyLists: rs[2].count,
            PaperEmptyLists: rs[3].count,
            emptyLists: [],
          };
          result.emptyLists.push.apply(result.emptyLists, rs[0].lists);
          result.emptyLists.push.apply(result.emptyLists, rs[1].lists);
          result.emptyLists.push.apply(result.emptyLists, rs[2].lists);
          result.emptyLists.push.apply(result.emptyLists, rs[3].lists);
          resolve(result);
        })
        .catch(() => {
          resolve({});
        });
    });
    return promise;
  }

  private _countListItemsByDocumentType(
    documentType: string,
    divisionCode: string,
    listsArr: any[]
  ) {
    let promise = new Promise(async (resolve) => {
      let getListFunctions: any[] = [];
      let web = Web(
        Environment.rootWeb + "/" + documentType + "/" + divisionCode
      );
      while (listsArr.length) {
        let list = listsArr.splice(0, 5);
        await Promise.all(list).then(async (rs2) => {
          for (let i = 0; i < rs2.length; i++) {
            if (!Helper.checkExistInSystemLists(rs2[i].Title)) {
              getListFunctions.push(
                await web.lists.getByTitle(list[i].Title).get()
              );
            }
          }
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      Promise.all(getListFunctions)
        .then((lists: any[]) => {
          let resultObj: any = {
            count: 0,
            lists: [],
          };
          lists.forEach((list) => {
            if (list.ItemCount === 0) {
              resultObj.count += 1;
              resultObj.lists.push({
                webUrl: list.ParentWebUrl,
                title: list.Title,
              });
            }
          });
          resolve(resultObj);
        })
        .catch(() => {
          resolve({});
        });
    });
    return promise;
  }

  removeEmptyLists(emptyLists: any[]) {
    let promise = new Promise((resolve) => {
      let index = 0;
      this._removeChainEmptyLists(emptyLists, index, resolve);
    });
    return promise;
  }

  private _removeChainEmptyLists(
    emptyLists: any[],
    index: number,
    resolve: any
  ) {
    let nextFunction = (i: number) => {
      if (i < emptyLists.length) {
        this._removeChainEmptyLists(emptyLists, i, resolve);
      } else {
        resolve(true);
      }
    };
    let web = Web(Environment.rootWeb + "/" + emptyLists[index].webUrl);
    web.lists
      .getByTitle(emptyLists[index].title)
      .get()
      .then((list) => {
        if (list.ItemCount === 0) {
          web.lists
            .getByTitle(emptyLists[index].title)
            .delete()
            .then(() => {
              nextFunction(index + 1);
            })
            .catch(() => {
              nextFunction(index + 1);
            });
        } else {
          nextFunction(index + 1);
        }
      })
      .catch(() => {
        nextFunction(index + 1);
      });
  }

  getDepartmentValidation(userToken: string, division: any) {
    let promise = new Promise((resolve) => {
      let docTypes = [
        Constants.DOCUMENT_TYPE.RnD,
        Constants.DOCUMENT_TYPE.LL,
        Constants.DOCUMENT_TYPE.Thesis,
        Constants.DOCUMENT_TYPE.Paper,
      ];
      let getFunctions: any[] = [];
      docTypes.forEach((docType) => {
        let web = Web(Environment.rootWeb + "/" + docType + "/" + division);
        getFunctions.push(web.lists.get());
      });
      Promise.all(getFunctions)
        .then(async (listArrs: any[]) => {
          let RnDLists = this._getUniqueDepartmentName(listArrs[0]);
          let LLLists = this._getUniqueDepartmentName(listArrs[1]);
          let ThesisLists = this._getUniqueDepartmentName(listArrs[2]);
          let PaperLists = this._getUniqueDepartmentName(listArrs[3]);
          let allLists: string[] = [];
          allLists.push.apply(allLists, RnDLists);
          allLists.push.apply(allLists, LLLists);
          allLists.push.apply(allLists, ThesisLists);
          allLists.push.apply(allLists, PaperLists);
          allLists = Helper.uniqueStringArray(allLists);
          let results: any[] = [];
          let checkFunctions: any[] = [];
          while (allLists.length) {
            let list = allLists.splice(0, 5);
            await Promise.all(list).then(async (rs1: any[]) => {
              rs1.forEach((department) => {
                checkFunctions.push(
                  this.idmSrv
                    .getROUValidation(userToken, department)
                    .catch(() => {
                      return 0;
                    })
                );
              });
              await Promise.all(checkFunctions)
                .then((rs2) => {
                  for (let index = 0; index < list.length; index++) {
                    let listName = list[index];
                    results.push({
                      DepartmentName: listName,
                      Approver: rs2[index] !== null ? rs2[index] : "None",
                      RnD: RnDLists.indexOf(listName) > -1,
                      LL: LLLists.indexOf(listName) > -1,
                      Thesis: ThesisLists.indexOf(listName) > -1,
                      Paper: PaperLists.indexOf(listName) > -1,
                      Status: rs2[index] !== null ? "Valid" : "Invalid",
                    });
                  }
                })
                .catch(() => {
                  resolve({
                    status: "Error",
                    error:
                      "Something went wrong while retrieving approvers' names.",
                  });
                });
              checkFunctions = [];
            });
          }
          resolve({
            status: "Success",
            results: results,
          });
        })
        .catch(() => {
          resolve({
            status: "Error",
            error:
              "Something went wrong while retrieving the department lists.",
          });
        });
    });
    return promise;
  }

  private _getUniqueDepartmentName(lists: any[], scArray: number[] = []) {
    let results: string[] = [];
    lists.forEach((list) => {
      let listName = list.Title;
      let isCorrectList = false;
      // Get all
      if (scArray.length === 0) {
        isCorrectList = true;
      }
      // Get by SC
      else {
        scArray.forEach((sc) => {
          isCorrectList = isCorrectList || listName.indexOf("-SC" + sc) > -1;
        });
      }

      if (isCorrectList === true) {
        listName = listName
          .replace("-SC1", "")
          .replace("-SC2", "")
          .replace("-SC3", "")
          .replace("_", "/");
        if (!Helper.checkExistInSystemLists(listName)) {
          if (
            results.length === 0 ||
            (results.length > 0 && results.indexOf(listName) === -1)
          ) {
            results.push(listName);
          }
        }
      }
    });
    return results;
  }

  getAIMDepartmentValidation(userToken: string, division: any) {
    let promise = new Promise((resolve) => {
      let docTypes = [
        Constants.DOCUMENT_TYPE.RnD,
        Constants.DOCUMENT_TYPE.Thesis,
      ];
      let getFunctions: any[] = [];
      docTypes.forEach((docType) => {
        let web = Web(Environment.rootWeb + "/" + docType + "/" + division);
        getFunctions.push(web.lists.get());
      });
      Promise.all(getFunctions)
        .then((listArrs: any[]) => {
          let RnDLists = this._getUniqueDepartmentName(listArrs[0], [2, 3]);
          let ThesisLists = this._getUniqueDepartmentName(listArrs[1], [2, 3]);
          let allLists: string[] = [];
          allLists.push.apply(allLists, RnDLists);
          allLists.push.apply(allLists, ThesisLists);
          allLists = Helper.uniqueStringArray(allLists);
          let results: any[] = [];
          let subPromise = new Promise<any[]>((subResolve) => {
            this._getROUByIteration(userToken, allLists, 0, subResolve, []);
          });
          subPromise
            .then((rs1: any[]) => {
              let getNameFunctions: any[] = [];
              rs1.forEach((rouId) => {
                getNameFunctions.push(
                  this.sp.web.siteUsers
                    .getById(rouId)
                    .get()
                    .catch(() => {
                      return "";
                    })
                );
              });
              Promise.all(getNameFunctions)
                .then((rs2) => {
                  for (let index = 0; index < allLists.length; index++) {
                    let listName = allLists[index];
                    results.push({
                      HoDId: rs1[index],
                      DivisionName: division,
                      DepartmentName: listName,
                      HoD: rs2[index] !== "" ? rs2[index].Title : "None",
                    });
                  }
                  this.systemListsSrv
                    .getAIMHistoryList()
                    .then((items: any[]) => {
                      results.forEach((rs) => {
                        let foundItems = items.filter(
                          (x) =>
                            x.Department === rs.DepartmentName &&
                            x.Division === rs.DivisionName
                        );
                        if (foundItems.length > 0) {
                          let latestDate = new Date(foundItems[0].EventDate);
                          foundItems.forEach((item) => {
                            let date = new Date(item.EventDate);
                            if (date > latestDate) {
                              latestDate = date;
                            }
                          });
                          rs.LastSent = latestDate.toLocaleString();
                        } else {
                          rs.LastSent = "";
                        }
                      });
                      resolve({
                        status: "Success",
                        results: results,
                      });
                    })
                    .catch(() => {
                      resolve({
                        status: "Error",
                        error:
                          "Something went wrong while retrieving AIM History.",
                      });
                    });
                })
                .catch(() => {
                  resolve({
                    status: "Error",
                    error:
                      "Something went wrong while retrieving approvers' names.",
                  });
                });
            })
            .catch(() => {
              resolve({
                status: "Error",
                error:
                  "Something went wrong while checking departments' approvers.",
              });
            });
        })
        .catch(() => {
          resolve({
            status: "Error",
            error:
              "Something went wrong while retrieving the department lists.",
          });
        });
    });
    return promise;
  }

  private _getROUByIteration(
    userToken: string,
    items: any[],
    index: number,
    mainResolve: any,
    finalResults: any[]
  ) {
    let maxIndex = index + 10 < items.length ? index + 10 : items.length;
    let getFunctions: any[] = [];
    for (let i = index; i < maxIndex; i++) {
      const department = items[i];
      getFunctions.push(
        this.idmSrv.getROUId(userToken, department).catch(() => {
          return 0;
        })
      );
    }
    Promise.all(getFunctions)
      .then((ROUs) => {
        finalResults.push.apply(finalResults, ROUs);
        if (maxIndex < items.length) {
          this._getROUByIteration(
            userToken,
            items,
            maxIndex,
            mainResolve,
            finalResults
          );
        } else {
          mainResolve(finalResults);
        }
      })
      .catch(() => {
        mainResolve([]);
      });
  }

  removeReport(data: any) {
    let reportDivision = data.Path.split(`${data.UploadType}/`)[1].split(
      `/List`
    )[0];
    let reportHostUrl = data.Path.split(`/${data.UploadType}/`)[0];
    let web = Web(reportHostUrl + "/" + data.UploadType + "/" + reportDivision);
    return web.lists
      .getById(data.ListID)
      .items.getById(data.ListItemID)
      .recycle();
  }

  getAllListMetadata(divisionCode: string): Promise<any[]> {
    let promise: Promise<any[]> = new Promise((resolve, reject) => {
      let uploadTypes: string[] = [
        Constants.DOCUMENT_TYPE.RnD,
        Constants.DOCUMENT_TYPE.LL,
        Constants.DOCUMENT_TYPE.Thesis,
        Constants.DOCUMENT_TYPE.Paper,
      ];
      let getListsFunctions: any[] = [];
      uploadTypes.forEach((uploadType: string) => {
        let web = Web(
          Environment.rootWeb + "/" + uploadType + "/" + divisionCode
        );
        getListsFunctions.push(web.lists.get());
      });
      Promise.all(getListsFunctions)
        .then((listArrs: any[]) => {
          let getItemsFunctions: any[] = [];
          listArrs.forEach((listArr: any[], index: number) => {
            getItemsFunctions.push(
              this.getAllDivisionItems(
                uploadTypes[index],
                divisionCode,
                listArr
              )
            );
          });
          Promise.all(getItemsFunctions)
            .then((itemArr: any[]) => {
              resolve(itemArr);
            })
            .catch(() => {
              reject();
            });
        })
        .catch(() => {
          reject();
        });
    });
    return promise;
  }

  private getAllDivisionItems(
    uploadType: string,
    divisionCode: string,
    listArr: any[]
  ) {
    let promise = new Promise((resolve, reject) => {
      let expansionConfig = this.getExpansionConfig(uploadType);
      let selections = expansionConfig.selections;
      let expansions = expansionConfig.expansions;

      let getItemsFunctions: any[] = [];
      listArr.forEach((list: any) => {
        if (Constants.SYSTEM_LISTS.indexOf(list.Title) === -1) {
          getItemsFunctions.push(
            this.getAllListItems(
              list.Title,
              Environment.rootWeb + "/" + uploadType + "/" + divisionCode,
              "ID",
              false,
              "",
              selections,
              expansions
            )
          );
        }
      });
      Promise.all(getItemsFunctions)
        .then((itemArr: any[]) => {
          let results: any[] = [];
          itemArr.forEach((items: any[]) => {
            items.forEach((item: any) => {
              item.FeberDepartment = !_.isNil(item.FeberDepartment)
                ? (item.FeberDepartment as string).replace("_", "/")
                : "";
            });
            results = results.concat(items);
          });
          resolve(results);
        })
        .catch(() => {
          reject();
        });
    });
    return promise;
  }

  private getExpansionConfig(uploadType: string) {
    let result: { selections: string[]; expansions: string[] } = {
      selections: [],
      expansions: [],
    };
    switch (uploadType) {
      case Constants.DOCUMENT_TYPE.RnD:
      case Constants.DOCUMENT_TYPE.Thesis: {
        result.selections = [
          "*",
          "ReportAuthor/Title",
          "AuthorizedAssociates/Title",
          "OrganizationalUnit/Title",
          "AdditionalApprovers/Title",
          "NotificationUsers/Title",
          "CustomACL/Title",
          "OrderUsers/Title",
          "Submitter/Title",
        ];
        result.expansions = [
          "ReportAuthor",
          "AuthorizedAssociates",
          "OrganizationalUnit",
          "AdditionalApprovers",
          "NotificationUsers",
          "CustomACL",
          "OrderUsers",
          "Submitter",
        ];
        break;
      }
      case Constants.DOCUMENT_TYPE.LL: {
        result.selections = ["*", "ReportAuthor/Title", "Submitter/Title"];
        result.expansions = ["ReportAuthor", "Submitter"];
        break;
      }
      case Constants.DOCUMENT_TYPE.Paper: {
        result.selections = [
          "*",
          "ReportAuthor/Title",
          "AdditionalApprovers/Title",
          "NotificationUsers/Title",
          "Submitter/Title",
        ];
        result.expansions = [
          "ReportAuthor",
          "AdditionalApprovers",
          "NotificationUsers",
          "Submitter",
        ];
        break;
      }
    }
    return result;
  }

  private _getAccessGroups(
    documentType: string,
    division: string,
    securityClass: string,
    currentReportSiteUrl: string
  ): Promise<any[]> {
    let promise: Promise<any[]> = new Promise((resolve) => {
      let web = Web(currentReportSiteUrl + "/" + documentType + "/" + division);
      web
        .get()
        .then((webInfo: any) => {
          let getFucntions = [];
          let rootWeb = Web(currentReportSiteUrl);
          switch (documentType) {
            case Constants.DOCUMENT_TYPE.RnD: {
              switch (securityClass) {
                case Constants.SECURITY_CLASS_LONG_NAME.SC1: {
                  resolve([]);
                  break;
                }
                case Constants.SECURITY_CLASS_LONG_NAME.SC2: {
                  getFucntions.push(
                    rootWeb.siteGroups
                      .getByName("FEBER " + webInfo.Title + " SC2 Access")
                      .get()
                      .catch(() => {
                        return null;
                      })
                  );
                  getFucntions.push(
                    rootWeb.siteGroups
                      .getByName(
                        "FEBER " + webInfo.Title + " RnD Division Admin"
                      )
                      .get()
                      .catch(() => {
                        return null;
                      })
                  );
                  break;
                }
                case Constants.SECURITY_CLASS_LONG_NAME.SC3: {
                  getFucntions.push(
                    rootWeb.siteGroups
                      .getByName("FEBER " + webInfo.Title + " SC3 Access")
                      .get()
                      .catch(() => {
                        return null;
                      })
                  );
                  getFucntions.push(
                    rootWeb.siteGroups
                      .getByName(
                        "FEBER " + webInfo.Title + " RnD Division Admin"
                      )
                      .get()
                      .catch(() => {
                        return null;
                      })
                  );
                  break;
                }
              }
              break;
            }
            case Constants.DOCUMENT_TYPE.Thesis: {
              if (securityClass === Constants.SECURITY_CLASS_LONG_NAME.SC2) {
                getFucntions.push(
                  rootWeb.siteGroups
                    .getByName("FEBER " + webInfo.Title + " SC2 Access")
                    .get()
                    .catch(() => {
                      return null;
                    })
                );
                getFucntions.push(
                  rootWeb.siteGroups
                    .getByName("FEBER Thesis Admin")
                    .get()
                    .catch(() => {
                      return null;
                    })
                );
              }
              break;
            }
            default: {
              resolve([]);
            }
          }
          Promise.all(getFucntions)
            .then((groups: any[]) => {
              let results: any[] = [];
              groups.forEach((group) => {
                if (!_.isNil(group)) {
                  results.push(group.Id);
                }
              });
              resolve(results);
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

  // MOVE SINGLE REPORT
  moveSingleReport(userToken: string, moveData: any): Promise<boolean> {
    // moveData:
    // + permissions
    // + sourceReport
    // + moveInfo
    // + additionalInfo
    console.log(moveData);
    let promise: Promise<boolean> = new Promise((resolve) => {
      let permissions: IUserPermissions = moveData.permissions;
      let currentReportSiteUrl = moveData.sourceReport.__metadata.uri.split(
        "/" + moveData.sourceReport.UploadType
      )[0];
      let targetUploadType =
        moveData.moveInfo.selectedUploadType !== ""
          ? moveData.moveInfo.selectedUploadType
          : moveData.sourceReport.UploadType;
      let targetSecurityClass =
        permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN]) &&
        targetUploadType === Constants.DOCUMENT_TYPE.RnD
          ? moveData.additionalInfo.securityClass // If the user is super admin and is moving to RnD report, get SC from "Additional Information"
          : moveData.moveInfo.selectedSecurityClass !== "" // If the user is super admin and move non-RnD report OR normal admin move, get SC from "Move Information"
          ? moveData.moveInfo.selectedSecurityClass
          : // Else get from original report for Thesis and default is 1 Internal for LL and Paper
          targetUploadType === Constants.DOCUMENT_TYPE.Thesis
          ? moveData.sourceReport.SecurityClass
          : Constants.SECURITY_CLASS_LONG_NAME.SC1;
      let listName = Helper.getListName(
        targetUploadType,
        targetSecurityClass,
        moveData.moveInfo.selectedTargetDepartment
      );

      this._createListIfNotExist(
        targetUploadType,
        moveData.moveInfo.selectedTargetDivision,
        listName,
        currentReportSiteUrl
      ).then(() => {
        Helper.showTrackingLog("_createListIfNotExist", "pass");
        let item = moveData.sourceReport;
        let moveInfo = moveData.moveInfo;
        let executeFunction: any = null;
        switch (item.UploadType) {
          case Constants.DOCUMENT_TYPE.RnD: {
            executeFunction = this._moveRnDReport;
            break;
          }
          case Constants.DOCUMENT_TYPE.LL: {
            executeFunction = this._moveLLReport;
            break;
          }
          case Constants.DOCUMENT_TYPE.Thesis: {
            executeFunction = this._moveThesisReport;
            break;
          }
          case Constants.DOCUMENT_TYPE.Paper: {
            executeFunction = this._movePaperReport;
            break;
          }
        }
        this._fillReportData(
          userToken,
          item,
          moveInfo,
          targetUploadType,
          targetSecurityClass,
          currentReportSiteUrl
        ).then((newObj: any) => {
          Helper.showTrackingLog("_fillReportData", "pass");
          executeFunction(
            moveData,
            newObj,
            listName,
            targetUploadType,
            currentReportSiteUrl
          )
            .then((addedItem: any) => {
              Helper.showTrackingLog("executeFunction pass", addedItem);
              // Get attachment name
              this._getSingleAttachmentName(item, currentReportSiteUrl)
                .then((attachments: IAttachmentInfo[]) => {
                  Helper.showTrackingLog("_getSingleAttachmentName", "pass");

                  // Get attachment content
                  this._getSingleAttachmentContent(
                    item,
                    attachments,
                    currentReportSiteUrl
                  )
                    .then((attachmentContent: Blob) => {
                      Helper.showTrackingLog(
                        "_getSingleAttachmentContent",
                        "pass"
                      );
                      // Add attachment
                      this._addSingleAttachment(
                        addedItem.data,
                        attachments[0].FileName,
                        attachmentContent,
                        currentReportSiteUrl
                      )
                        .then(() => {
                          Helper.showTrackingLog(
                            "_addSingleAttachment",
                            "pass"
                          );
                          // Remove old report
                          this._removeOldSingleReport(
                            item,
                            currentReportSiteUrl
                          )
                            .then(() => {
                              Helper.showTrackingLog(
                                "_removeOldSingleReport",
                                "pass"
                              );

                              resolve(true);
                            })
                            .catch(() => {
                              resolve(false);
                            });
                        })
                        .catch(() => {
                          resolve(false);
                        });
                    })
                    .catch(() => {
                      // Exceptional case: Paper sometimes does not contain attachment
                      if (item.UploadType === Constants.DOCUMENT_TYPE.Paper) {
                        // Remove old report
                        this._removeOldSingleReport(item, currentReportSiteUrl)
                          .then(() => {
                            resolve(true);
                          })
                          .catch(() => {
                            resolve(false);
                          });
                      } else {
                        resolve(false);
                      }
                    });
                })
                .catch(() => {
                  // Exceptional case: Paper sometimes does not contain attachment
                  if (item.UploadType === Constants.DOCUMENT_TYPE.Paper) {
                    // Remove old report
                    this._removeOldSingleReport(item, currentReportSiteUrl)
                      .then(() => {
                        resolve(true);
                      })
                      .catch(() => {
                        resolve(false);
                      });
                  } else {
                    resolve(false);
                  }
                });
            })
            .catch(() => {
              resolve(false);
            });
        });
      });
    });
    return promise;
  }

  private _createListIfNotExist(
    uploadType: string,
    division: string,
    listName: string,
    currentReportSiteUrl: string
  ) {
    let promise: Promise<void> = new Promise((resolve) => {
      this.goToSubsite({
        rootSite: currentReportSiteUrl,
        documentType: uploadType,
        division: division,
      });
      // From here we are standing on subsite/uploadtype/devision
      this.checkExistingDepartmentList(listName).then(
        (isExistingList: boolean) => {
          console.log(">>>>checkExistingDepartmentList", isExistingList);
          if (isExistingList === true) {
            resolve();
          } else {
            // let web = Web(
            //   currentReportSiteUrl + "/" + uploadType + "/" + division
            // );
            this.createDepartmentList(
              this.sp.web,
              listName,
              uploadType,
              currentReportSiteUrl
            ).then(() => {
              resolve();
            });
          }
        }
      );
    });
    return promise;
  }

  private _fillReportData(
    userToken: string,
    item: any,
    moveInfo: any,
    targetUploadType: string,
    targetSecurityClass: string,
    currentReportSiteUrl: string
  ): Promise<any> {
    let newObj: any = null;
    switch (targetUploadType) {
      case Constants.DOCUMENT_TYPE.RnD: {
        newObj = new Properties_RnD();
        break;
      }
      case Constants.DOCUMENT_TYPE.LL: {
        newObj = new Properties_LL();
        break;
      }
      default: {
        switch (item.UploadType) {
          case Constants.DOCUMENT_TYPE.RnD: {
            newObj = new Properties_RnD();
            break;
          }
          case Constants.DOCUMENT_TYPE.LL: {
            newObj = new Properties_LL();
            break;
          }
          case Constants.DOCUMENT_TYPE.Thesis: {
            newObj = new Properties_Thesis();
            break;
          }
          case Constants.DOCUMENT_TYPE.Paper: {
            newObj = new Properties_Paper();
            break;
          }
        }
        break;
      }
    }
    delete newObj.ROU;
    let promise: Promise<any> = new Promise((resolve) => {
      for (let key in newObj) {
        if (!_.isNil(item[key])) {
          newObj[key] = item[key];
        } else if (item[key] === "") {
          newObj[key] = null;
        }
        // Remove property: __metadata
        if (
          !_.isNil(newObj[key]) ? !_.isUndefined(newObj[key].__metadata) : false
        ) {
          delete newObj[key].__metadata;
        }
      }
      // Change Division
      newObj.Division = moveInfo.selectedTargetDivision;
      // Change Department
      newObj.FeberDepartment = moveInfo.selectedTargetDepartment;
      // Change Security Class
      newObj.SecurityClass = targetSecurityClass;
      // Change Upload Type
      newObj.UploadType = targetUploadType;
      newObj.UploadTypeDescription =
        Helper.getUploadTypeDescription(targetUploadType);
      //Add ROU and Access Groups
      if (newObj.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1) {
        // Get new ROU
        this.idmSrv
          .getROUId(userToken, newObj.FeberDepartment)
          .then((rouId: any) => {
            // Get Acccess Groups
            this._getAccessGroups(
              newObj.UploadType,
              newObj.Division,
              newObj.SecurityClass,
              currentReportSiteUrl
            ).then(async (accessGroupsArr: any[]) => {
              let customACLIds = newObj.CustomACLId.results as any[];
              customACLIds.push(rouId);
              customACLIds.push(...accessGroupsArr);
              if (newObj.UploadType === "RnD" && newObj.Division === "CR") {
                await this.idmSrv
                  .GetGroupManagerByDepartments([
                    { Id: "", Title: newObj.FeberDepartment },
                  ])
                  .then((department: any) => {
                    if (department.length !== 0) {
                      if (department[0].ROU.Id !== rouId) {
                        customACLIds.push(department[0].ROU.Id);
                      }
                    }
                  });
              }
              // Authors
              if (newObj.ReportAuthorId.results.length > 0) {
                customACLIds.push(...newObj.ReportAuthorId.results);
              }
              // Submitter
              if (!_.isNil(newObj.SubmitterId)) {
                customACLIds.push(newObj.SubmitterId);
              }
              // Authorized associates
              if (newObj.AuthorizedAssociatesId.results.length > 0) {
                customACLIds.push(...newObj.AuthorizedAssociatesId.results);
              }
              // Authorized organizational units
              if (newObj.OrganizationalUnitId.results.length > 0) {
                customACLIds.push(...newObj.OrganizationalUnitId.results);
              }
              // Additional approvers
              if (newObj.AdditionalApproversId.results.length > 0) {
                customACLIds.push(...newObj.AdditionalApproversId.results);
              }
              // Notification users
              if (newObj.NotificationUsersId.results.length > 0) {
                customACLIds.push(...newObj.NotificationUsersId.results);
              }
              newObj.CustomACLId.results = customACLIds;
              resolve(newObj);
            });
          });
      } else {
        // If the report is not LL and Paper, set CustomACL is empty if SC1
        if (!_.isUndefined(newObj.CustomACLId)) {
          newObj.CustomACLId.results = [];
        }
        resolve(newObj);
      }
    });
    return promise;
  }

  private _moveRnDReport(
    moveData: any,
    newObj: any,
    listName: string,
    targetUploadType: string,
    currentReportSiteUrl: string
  ) {
    console.log(">>>Check move data", moveData);
    let promise = new Promise((resolve) => {
      let permissions: IUserPermissions = moveData.permissions;
      if (permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
        switch (newObj.UploadType) {
          case Constants.DOCUMENT_TYPE.RnD: {
            newObj.RelevantforFDLegislation = moveData.additionalInfo.rFTL;
            newObj.SecurityClass = moveData.additionalInfo.securityClass;
            break;
          }
          case Constants.DOCUMENT_TYPE.LL: {
            newObj.Product = moveData.additionalInfo.product;
            newObj.Process = moveData.additionalInfo.process;
            newObj.PlantorBU = moveData.additionalInfo.plantBU;
            newObj.IQISNumber = moveData.additionalInfo.iqisNumber;
            break;
          }
        }
      }
      let web = Web(
        currentReportSiteUrl +
          "/" +
          targetUploadType +
          "/" +
          moveData.moveInfo.selectedTargetDivision
      );
      console.log(Environment.rootWeb, currentReportSiteUrl);
      console.log(newObj);
      resolve(
        web.lists.getByTitle(listName).items.add(newObj)
      );
    });
    return promise;
  }

  private _moveLLReport(
    moveData: any,
    newObj: any,
    listName: string,
    targetUploadType: string,
    currentReportSiteUrl: string
  ) {
    let promise = new Promise((resolve) => {
      let permissions: IUserPermissions = moveData.permissions;
      if (permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
        switch (newObj.UploadType.toUpperCase()) {
          case Constants.DOCUMENT_TYPE.RnD: {
            newObj.Abstract = moveData.additionalInfo.abstract;
            newObj.DocumentType = moveData.additionalInfo.reportType;
            newObj.RelevantforFDLegislation = moveData.additionalInfo.rFTL;
            newObj.SecurityClass = moveData.additionalInfo.securityClass;
            newObj.DocumentNumber = moveData.additionalInfo.reportNumber;
            newObj.ProjectNumber = moveData.additionalInfo.projectNumber;
            let customACLs =
              newObj.SecurityClass !== Constants.SECURITY_CLASS_LONG_NAME.SC1
                ? (moveData.additionalInfo.customACLRef.current.getSelectedItems() as any[])
                : [];
            customACLs.forEach((customACLItem) => {
              newObj.CustomACLId.results.push(customACLItem.id);
            });
            break;
          }
          case Constants.DOCUMENT_TYPE.LL: {
            break;
          }
        }
      }
      let web = Web(
        currentReportSiteUrl +
          "/" +
          targetUploadType +
          "/" +
          moveData.moveInfo.selectedTargetDivision
      );
      resolve(web.lists.getByTitle(listName).items.add(newObj));
    });
    return promise;
  }

  private _moveThesisReport(
    moveData: any,
    newObj: any,
    listName: string,
    targetUploadType: string,
    currentReportSiteUrl: string
  ) {
    let promise = new Promise((resolve) => {
      let web = Web(
        currentReportSiteUrl +
          "/" +
          targetUploadType +
          "/" +
          moveData.moveInfo.selectedTargetDivision
      );
      resolve(web.lists.getByTitle(listName).items.add(newObj));
    });
    return promise;
  }

  private _movePaperReport(
    moveData: any,
    newObj: any,
    listName: string,
    targetUploadType: string,
    currentReportSiteUrl: string
  ) {
    let promise = new Promise((resolve) => {
      let web = Web(
        currentReportSiteUrl +
          "/" +
          targetUploadType +
          "/" +
          moveData.moveInfo.selectedTargetDivision
      );
      resolve(web.lists.getByTitle(listName).items.add(newObj));
    });
    return promise;
  }

  private _getSingleAttachmentName(
    sourceItem: any,
    currentReportSiteUrl: string
  ) {
    let sourceListName = Helper.getListName(
      sourceItem.UploadType,
      sourceItem.SecurityClass,
      sourceItem.FeberDepartment
    );
    let web = Web(
      currentReportSiteUrl +
        "/" +
        sourceItem.UploadType +
        "/" +
        sourceItem.Division
    );
    return web.lists
      .getByTitle(sourceListName)
      .items.getById(sourceItem.Id)
      .attachmentFiles.get();
  }

  private _getSingleAttachmentContent(
    sourceItem: any,
    attachments: any,
    currentReportSiteUrl: string
  ) {
    let sourceListName = Helper.getListName(
      sourceItem.UploadType,
      sourceItem.SecurityClass,
      sourceItem.FeberDepartment
    );
    let web = Web(
      currentReportSiteUrl +
        "/" +
        sourceItem.UploadType +
        "/" +
        sourceItem.Division
    );
    return web.lists
      .getByTitle(sourceListName)
      .items.getById(sourceItem.Id)
      .attachmentFiles.getByName(attachments[0].FileName)
      .getBlob();
  }

  private _addSingleAttachment(
    targetItem: any,
    name: any,
    content: any,
    currentReportSiteUrl: string
  ) {
    let targetListName = Helper.getListName(
      targetItem.UploadType,
      targetItem.SecurityClass,
      targetItem.FeberDepartment
    );
    let web = Web(
      currentReportSiteUrl +
        "/" +
        targetItem.UploadType +
        "/" +
        targetItem.Division
    );
    return web.lists
      .getByTitle(targetListName)
      .items.getById(targetItem.Id)
      .attachmentFiles.add(name, content);
  }

  private _removeOldSingleReport(
    sourceItem: any,
    currentReportSiteUrl: string
  ) {
    let sourceListName = Helper.getListName(
      sourceItem.UploadType,
      sourceItem.SecurityClass,
      sourceItem.FeberDepartment
    );
    let web = Web(
      currentReportSiteUrl +
        "/" +
        sourceItem.UploadType +
        "/" +
        sourceItem.Division
    );
    return web.lists
      .getByTitle(sourceListName)
      .items.getById(sourceItem.Id)
      .delete();
  }
}

export default DepartmentService;
