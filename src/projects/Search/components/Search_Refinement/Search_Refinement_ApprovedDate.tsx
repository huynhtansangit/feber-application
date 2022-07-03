import * as React from "react";
import Helper from "../../../../core/libraries/Helper";
import { DatePicker } from "@fluentui/react/lib/DatePicker";
import _ from "lodash";
import RbLabel, {
  LabelSize,
} from "../../../../bosch-react/components/label/RbLabel";
import RbButton, {
  ButtonType,
  ButtonSize,
} from "../../../../bosch-react/components/button/RbButton";

class Search_Refinement_ApprovedDate extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      MinDate: null,
      MaxDate: null,
    };
    this.setLimitation = this.setLimitation.bind(this);
    this.setDefaultValues = this.setDefaultValues.bind(this);

    this.handleSearch = this.handleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  setDefaultValues(value: any) {
    if (value !== "") {
      if (value.indexOf("..") > -1) {
        // Range
        value = value.replace("=", "");
        let updatedObj: any = {};
        let minDateArr = value.split("..")[0].split("/");
        let maxDateArr = value.split("..")[1].split("/");
        updatedObj["MinDate"] = new Date(
          parseInt(minDateArr[2]),
          parseInt(minDateArr[0]) - 1,
          parseInt(minDateArr[1])
        );
        updatedObj["MaxDate"] = new Date(
          parseInt(maxDateArr[2]),
          parseInt(maxDateArr[0]) - 1,
          parseInt(maxDateArr[1])
        );
        this.setState(updatedObj);
      } else {
        if (value.indexOf(">=") > -1) {
          // Min
          value = value.replace(">=", "");
          value = value.split("/");
          this.setState({
            MinDate: new Date(
              parseInt(value[2]),
              parseInt(value[0]) - 1,
              parseInt(value[1])
            ),
          });
        } else if (value.indexOf("<=") > -1) {
          // Max
          value = value.replace("<=", "");
          value = value.split("/");
          this.setState({
            MaxDate: new Date(
              parseInt(value[2]),
              parseInt(value[0]) - 1,
              parseInt(value[1])
            ),
          });
        }
      }
    }
  }

  render() {
    return (
      <div className="ms-Grid" style={{ marginBottom: "15px" }}>
        <div className="ms-Grid-row">
          <RbLabel>Approved Date</RbLabel>
        </div>
        <div className="ms-Grid-row">
          <RbLabel size={LabelSize.Small}>From</RbLabel>
        </div>
        <div className="ms-Grid-row">
          <DatePicker
            showGoToToday={false}
            placeholder="Select a date..."
            formatDate={(data) => Helper.getDateTimeFormatForUI(data)}
            onSelectDate={(data) => this.setLimitation("min", data)}
            maxDate={
              _.isNil(this.state.MaxDate) ? undefined : this.state.MaxDate
            }
            value={this.state.MinDate}
          />
        </div>
        <div className="ms-Grid-row">
          <RbLabel size={LabelSize.Small}>To</RbLabel>
        </div>
        <div className="ms-Grid-row">
          <DatePicker
            showGoToToday={false}
            placeholder="Select a date..."
            formatDate={(data) => Helper.getDateTimeFormatForUI(data)}
            onSelectDate={(data) => this.setLimitation("max", data)}
            minDate={
              _.isNil(this.state.MinDate) ? undefined : this.state.MinDate
            }
            value={this.state.MaxDate}
          />
        </div>
        <div className="ms-Grid-row" style={{ marginTop: "10px" }}>
          <RbButton
            type={ButtonType.Secondary}
            size={ButtonSize.Tiny}
            label="Refine"
            style={{ minWidth: "3rem" }}
            onClick={this.handleSearch}
          />
          <RbButton
            type={ButtonType.Secondary}
            size={ButtonSize.Tiny}
            label="Clear"
            style={{ minWidth: "3rem" }}
            onClick={this.clearSearch}
          />
        </div>
      </div>
    );
  }

  setLimitation(limitPoint: any, value: any) {
    if (!_.isNil(value)) {
      let property = limitPoint === "min" ? "MinDate" : "MaxDate";
      let updatedObj: any = {};
      updatedObj[property] = value;
      this.setState(updatedObj);
    }
  }

  handleSearch() {
    if (!_.isNil(this.state.MinDate) && !_.isNil(this.state.MaxDate)) {
      let queryText = "=";
      queryText +=
        this.state.MinDate.getMonth() +
        1 +
        "/" +
        this.state.MinDate.getDate() +
        "/" +
        this.state.MinDate.getFullYear();
      queryText += "..";
      queryText +=
        this.state.MaxDate.getMonth() +
        1 +
        "/" +
        this.state.MaxDate.getDate() +
        "/" +
        this.state.MaxDate.getFullYear();
      this.props.handleSearch("approveddate", queryText);
    } else {
      if (!_.isNil(this.state.MinDate)) {
        let queryText = ">=";
        queryText +=
          this.state.MinDate.getMonth() +
          1 +
          "/" +
          this.state.MinDate.getDate() +
          "/" +
          this.state.MinDate.getFullYear();
        this.props.handleSearch("approveddate", queryText);
      } else if (!_.isNil(this.state.MaxDate)) {
        let queryText = "<=";
        queryText +=
          this.state.MaxDate.getMonth() +
          1 +
          "/" +
          this.state.MaxDate.getDate() +
          "/" +
          this.state.MaxDate.getFullYear();
        this.props.handleSearch("approveddate", queryText);
      }
    }
  }

  clearSearch() {
    this.props.handleSearch("approveddate", "");
    this.setState({
      MinDate: null,
      MaxDate: null,
    });
  }
}

export default Search_Refinement_ApprovedDate;
