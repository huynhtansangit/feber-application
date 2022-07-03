import * as React from "react";
import { Dropdown } from "@fluentui/react/lib/Dropdown";
import Constants from "../../../core/libraries/Constants";
import Helper from "../../../core/libraries/Helper";
import { ResponsiveLine } from "@nivo/line";
import SystemService from "../../../services/SystemService";
import Environment from "../../../Environment";
import SearchService from "../../../services/SearchService";
import ExcelService from "../../../services/ExcelService";
import { IUserProfile } from "../../../store/permission/types";
import { showDialog, showToastMessage } from "../../../store/util/actions";
import { updateField } from "../../../store/system/actions";
import { connect } from "react-redux";
import { RootState } from "../../../store/configureStore";
import _ from "lodash";
import RbLabel, {
  LabelSize,
} from "../../../bosch-react/components/label/RbLabel";
import RbButton, {
  ButtonSize,
} from "../../../bosch-react/components/button/RbButton";
import RbRadio, {
  IRbRadioItem,
} from "../../../bosch-react/components/radio/RbRadio";

interface Statistic_ReportProps {
  userProfile: IUserProfile | undefined;
  showDialog: typeof showDialog;
  showToastMessage: typeof showToastMessage;
  type: string;
  updateField: typeof updateField;
  exportMode: any;
}

class Statistic_Report extends React.Component<Statistic_ReportProps, any> {
  systemListsSrv: SystemService = new SystemService();

  searchSrv: SearchService = new SearchService();

  excelSrv: ExcelService = new ExcelService(Environment.rootWeb);

  constructor(props: Statistic_ReportProps) {
    super(props);
    this.state = {
      fromMonth: 1,
      fromYear: new Date().getFullYear(),
      toMonth: 12,
      toYear: new Date().getFullYear(),
      drawData: null,
      chartData: null,
      filteredChartData: null,
      selectedDivison: "",
      divisons: [],
      statisticType: "",
    };
    this.view = this.view.bind(this);
    // this.generateChartData = this.generateChartData.bind(this);
    // this.ensureLineChart = this.ensureLineChart.bind(this);
    // this.genergrateDivisionsList = this.genergrateDivisionsList.bind(this);
    // this.changeDivision = this.changeDivision.bind(this);
    this.downloadReport = this.downloadReport.bind(this);
  }

  render() {
    if (this.state.statisticType !== this.props.exportMode) {
      this.setState({
        filteredChartData: null,
        statisticType: this.props.exportMode,
      });
    }
    const redioItems: IRbRadioItem[] = [
      { value: "download", label: "Downloads data" },
      { value: "upload", label: "Uploads data" },
      { value: "order", label: "Orders data" },
      { value: "search", label: "Searches data" },
      { value: "delete", label: "Deletes data" },
    ];
    let element = (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <RbRadio
            itemWidth={12}
            items={redioItems}
            isHorizontal={true}
            defaultValue={"download"}
            onChange={(selectedValue) => {
              this.props.updateField("exportMode", selectedValue);
            }}
          />
          <div className="ms-Grid-col ms-sm6">
            <div className="ms-Grid" style={{ paddingTop: "15px" }}>
              {/* From */}
              <div className="ms-Grid-row common-padding-row">
                <div className="ms-Grid-col ms-sm3">
                  <RbLabel hasPadding={true}>From</RbLabel>
                </div>
                <div className="ms-Grid-col ms-sm6">
                  <Dropdown
                    selectedKey={this.state.fromMonth}
                    options={Constants.DD_MONTH_OPTIONS}
                    onChange={(event, option: any) => {
                      this.setState({ fromMonth: option.key });
                    }}
                  ></Dropdown>
                </div>
                <div className="ms-Grid-col ms-sm3">
                  <Dropdown
                    selectedKey={this.state.fromYear}
                    options={Helper.generateYearsArray()}
                    onChange={(event, option: any) => {
                      this.setState({ fromYear: option.key });
                    }}
                  ></Dropdown>
                </div>
              </div>

              {/* To */}
              <div className="ms-Grid-row common-padding-row">
                <div className="ms-Grid-col ms-sm3">
                  <RbLabel hasPadding={true}>To</RbLabel>
                </div>
                <div className="ms-Grid-col ms-sm6">
                  <Dropdown
                    selectedKey={this.state.toMonth}
                    options={Constants.DD_MONTH_OPTIONS}
                    onChange={(event, option: any) => {
                      this.setState({ toMonth: option.key });
                    }}
                  ></Dropdown>
                </div>
                <div className="ms-Grid-col ms-sm3">
                  <Dropdown
                    selectedKey={this.state.toYear}
                    options={Helper.generateYearsArray()}
                    onChange={(event, option: any) => {
                      this.setState({ toYear: option.key });
                    }}
                  ></Dropdown>
                </div>
              </div>

              {/* Buttons */}
              <div className="ms-Grid-row common-padding-row">
                <RbButton
                  label="Download report"
                  size={ButtonSize.Small}
                  onClick={this.view}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart
                {(!_.isNil(this.state.filteredChartData)) ?
                    <div className="ms-Grid-row common-padding-row" style={{ height: "80vh", textAlign: "center", marginBottom: "50px" }}>
                        <RbLabel size={LabelSize.Large} isInline={false}>The number of {this.props.type + ((this.props.type !== "search") ? "s" : "es")} in FEBER</RbLabel>
                        <RbLabel size={LabelSize.Large} isInline={false}>from {
                            ((this.state.fromMonth < 10) ? "0" : "") + this.state.fromMonth + "/" + this.state.fromYear
                        } to {
                                ((this.state.toMonth < 10) ? "0" : "") + this.state.toMonth + "/" + this.state.toYear
                            }</RbLabel>
                        <div className="ms-Grid">
                            <div className="ms-Grid-row common-padding-row">
                                <div className="ms-Grid-col ms-sm1">
                                    <RbLabel style={{ textAlign: "right" }} hasPadding={true}>Division&nbsp;</RbLabel>
                                </div>
                                <div className="ms-Grid-col ms-sm3" style={{ textAlign: "left" }}>
                                    <Dropdown
                                        selectedKey={this.state.selectedDivison}
                                        options={this.state.divisions}
                                        onChange={(event, option) => {
                                            if (!_.isUndefined(option)) {
                                                this.setState({ selectedDivison: option.key }, () => {
                                                    this.changeDivision();
                                                });
                                            }
                                        }} />
                                </div>
                                <div className="ms-Grid-col ms-sm8" />
                            </div>
                        </div>
                        <ResponsiveLine
                            data={this.state.filteredChartData}
                            enablePoints={false}
                            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                orient: 'bottom',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Months',
                                legendOffset: 36,
                                legendPosition: 'middle'
                            }}
                            axisLeft={{
                                orient: 'left',
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: 'Times',
                                legendOffset: -40,
                                legendPosition: 'middle'
                            }}
                            colors={{ scheme: 'set1' }}
                            pointSize={10}
                            pointColor={{ theme: 'background' }}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            pointLabel="y"
                            pointLabelYOffset={-12}
                            useMesh={true}
                        />
                    </div> : ""}
                <div className="ms-Grid-row common-padding-row">&nbsp;</div>*/}
      </div>
    );
    return element;
  }

  view() {
    if (
      (this.state.fromMonth >= this.state.toMonth &&
        this.state.fromYear === this.state.toYear) ||
      this.state.fromYear > this.state.toYear
    ) {
      this.props.showToastMessage(
        Constants.TOAST_MESSAGE_CODE.ERROR,
        Constants.STATISTIC_REPORT.INVALID_DATE
      );
    } else {
      this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIVE);
      let functionToRun: Promise<any> = new Promise(() => {});
      switch (this.props.exportMode) {
        case "download":
        case "order":
        case "delete":
        case "search": {
          functionToRun = this.systemListsSrv.getAllListItems(
            Constants.STATISTICS[
              (this.props.exportMode as string).toUpperCase()
            ],
            Environment.rootWeb,
            "ID",
            false,
            "",
            this.props.exportMode !== "search"
              ? ["*", "Submitter/Title"]
              : ["*", "Author/Title"],
            this.props.exportMode !== "search" ? ["Submitter"] : ["Author"]
          );
          break;
        }
        case "upload": {
          functionToRun = new Promise((resolve: any) => {
            this.searchSrv.searchAllResults(
              "FeberApproveDate=" +
                (this.state.fromMonth +
                  "/1/" +
                  this.state.fromYear +
                  ".." +
                  this.state.toMonth +
                  "/" +
                  Helper.getLastDate(
                    this.state.toYear,
                    this.state.toMonth - 1
                  ) +
                  "/" +
                  this.state.toYear) +
                " ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper",
              1,
              [],
              null,
              (results: any[]) => {
                resolve(results);
              }
            );
          });
          break;
        }
      }
      functionToRun
        .then((results: any[]) => {
          let rs: any[] = results.filter((item: any) => {
            if (
              this.props.exportMode === "download" ||
              this.props.exportMode === "order" ||
              this.props.exportMode === "delete" ||
              this.props.exportMode === "search"
            ) {
              if (item.EventDate !== null) {
                return (
                  new Date(item.EventDate) >=
                    new Date(
                      this.state.fromYear,
                      this.state.fromMonth - 1,
                      1,
                      0,
                      0,
                      0
                    ) &&
                  new Date(item.EventDate) <=
                    new Date(
                      this.state.toYear,
                      this.state.toMonth - 1,
                      Helper.getLastDate(
                        this.state.toYear,
                        this.state.toMonth - 1
                      ),
                      23,
                      59,
                      59
                    )
                );
              }
              return false;
            }
            return true;
          });
          this.setState({ drawData: rs }, () => {
            this.generateChartData();
          });
          this.props.showDialog(false);
          this.downloadReport();
        })
        .catch((err: any) => {
          this.props.showDialog(false);
        });
    }
  }

  generateChartData() {
    let results: any[] = [];
    let drawData = Helper.sortObjects(
      this.state.drawData,
      this.props.exportMode !== "upload" ? "EventDate" : "FeberApproveDate"
    );
    drawData.forEach((item: any) => {
      let date = new Date(
        this.props.exportMode !== "upload"
          ? item.EventDate
          : item.FeberApproveDate
      );
      let monthString =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) +
        "/" +
        date.getFullYear();
      let division =
        this.props.exportMode !== "upload" ? item.Division : item.FeberDivision;
      if (
        results.length === 0 ||
        (results.length > 0 &&
          results.filter((rs) => rs.id === division).length === 0)
      ) {
        results.push({
          id: division,
          data: [
            {
              x: monthString,
              y: 1,
            },
          ],
        });
      } else {
        results.forEach((rs: any) => {
          if (rs.id === division) {
            let foundMonth = false;
            rs.data.forEach((r: any) => {
              if (r.x === monthString) {
                r.y += 1;
                foundMonth = true;
              }
            });
            if (foundMonth === false) {
              rs.data.push({
                x: monthString,
                y: 1,
              });
            }
          }
        });
      }
    });
    let rs = this.ensureLineChart(results);
    let divisions = this.genergrateDivisionsList(rs);
    this.setState(
      {
        chartData: rs,
        selectedDivison: "",
        divisions: divisions,
      },
      () => {
        this.changeDivision();
      }
    );
  }

  ensureLineChart(results: any[]) {
    let monthList: string[] = [];
    results.forEach((item: any) => {
      item.data.forEach((dataRow: any) => {
        monthList.push(dataRow.x);
      });
    });
    // distinct
    monthList = monthList.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
    // sort
    let sortObjs: any[] = [];
    for (let index = 0; index < monthList.length; index++) {
      let monthYear = monthList[index].split("/");
      let month = parseInt(monthYear[0]);
      let year = parseInt(monthYear[1]);
      sortObjs.push({
        date: new Date(year, month - 1, 1, 0, 0, 0).toISOString(),
        stringMonth: monthList[index],
      });
    }
    sortObjs = Helper.sortObjects(sortObjs, "date");
    // fill empty data
    let minDate = new Date(
      this.state.fromYear,
      this.state.fromMonth - 1,
      1,
      0,
      0,
      0
    );
    let maxDate = new Date(
      this.state.toYear,
      this.state.toMonth - 1,
      Helper.getLastDate(this.state.toYear, this.state.toMonth - 1),
      23,
      59,
      59
    );
    do {
      if (minDate < maxDate) {
        let found: any = false;
        sortObjs.forEach((obj: any) => {
          if (minDate.toISOString() === obj.date) {
            found = true;
          }
        });
        if (found === false) {
          let month = minDate.getMonth();
          let year = minDate.getFullYear();
          sortObjs.push({
            date: new Date(year, month, 1).toISOString(),
            stringMonth:
              (month + 1 < 10 ? "0" + (month + 1) : month + 1) + "/" + year,
          });
        }
      }
      minDate.setMonth(minDate.getMonth() + 1);
    } while (minDate < maxDate);
    sortObjs = Helper.sortObjects(sortObjs, "date");
    // Get month list again
    monthList = [];
    sortObjs.forEach((obj: any) => {
      monthList.push(obj.stringMonth);
    });
    results.forEach((item: any) => {
      // Rename null division
      item.id = !_.isNil(item.id) ? item.id : "Not found division";
      // Fill missing data
      let newData: any[] = [];
      monthList.forEach((month: string) => {
        let found: boolean = false;
        item.data.forEach((dataRow: any) => {
          if (month === dataRow.x) {
            newData.push(dataRow);
            found = true;
          }
        });
        if (found === false) {
          newData.push({ x: month, y: 0 });
        }
      });
      item.data = newData;
    });
    results = Helper.sortObjects(results, "id");
    return results;
  }

  genergrateDivisionsList(rs: any[]) {
    let list: any[] = [{ key: "", text: "--- All ---" }];
    rs.forEach((result: any) => {
      list.push({ key: result.id, text: result.id });
    });
    return list;
  }

  changeDivision() {
    let chartData: any[] = this.state.chartData;
    if (chartData.length > 0) {
      if (this.state.selectedDivison === "") {
        let sumData: any[] = JSON.parse(
          JSON.stringify(chartData[0].data)
        ) as any[];
        let index: number = 0;
        if (chartData.length > 1) {
          do {
            ++index;
            for (let i = 1; i < sumData.length; i++) {
              sumData[i].y += chartData[index].data[i].y;
            }
          } while (index < chartData.length - 1);
        }
        this.setState({ filteredChartData: [{ id: "All", data: sumData }] });
      } else {
        let filteredData = (this.state.chartData as any[]).filter(
          (x) => x.id === this.state.selectedDivison
        );
        this.setState({ filteredChartData: filteredData });
      }
    }
  }

  downloadReport() {
    // let functionToRun: Promise<any> = new Promise(() => { });
    // functionToRun.then(async (results: any[]) => {
    //     let rs: any[] = results.filter((item: any) => {
    //         if (this.props.type === "download" || this.props.type === "order"
    //             || this.props.type === "delete" || this.props.type === "search") {
    //             if (item.EventDate !== null) {
    //                 return ((new Date(item.EventDate) >= new Date(this.state.fromYear, this.state.fromMonth - 1, 1, 0, 0, 0))
    //                     && (new Date(item.EventDate) <= new Date(this.state.toYear, this.state.toMonth - 1, Helper.getLastDate(this.state.toYear, this.state.toMonth - 1), 23, 59, 59)));
    //             }
    //             return false;
    //         }
    //         return true;
    //     });
    //     this.setState({ drawData: rs })
    // })
    //console.log(this.state.drawData)
    //console.log(this.props.exportMode)
    this.excelSrv
      .exportStatistics(this.props.exportMode, this.state.drawData)
      .then(() => {
        this.props.showToastMessage(
          Constants.TOAST_MESSAGE_CODE.SUCCESS,
          Constants.STATISTIC_REPORT.EXPORT_SUCCESS
        );
      })
      .catch(() => {
        this.props.showToastMessage(
          Constants.TOAST_MESSAGE_CODE.ERROR,
          Constants.STATISTIC_REPORT.EXPORT_FAILED
        );
      });
  }
}

const mapStateToProps = (state: RootState) => ({
  userProfile: state.permission.userProfile,
  exportMode: state.system.exportMode,
});

export default connect(mapStateToProps, {
  showDialog,
  showToastMessage,
  updateField,
})(Statistic_Report);
