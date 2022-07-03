import * as React from 'react';
import { DatePicker as FluentUIDatePicker } from '@fluentui/react';
import Helper from '../libraries/Helper';
import _ from 'lodash';

interface IDatePicker {
    value?: any,
    onSelectDate?: any,
    errorMessage?: string | undefined
}

class DatePicker extends React.Component<IDatePicker, any> {

    render() {
        return (
            <div className={(!_.isUndefined(this.props.errorMessage)) ? "customized-error-message" : ""}>
                <FluentUIDatePicker
                    showGoToToday={false} placeholder="Select a date..." formatDate={(data) => Helper.getDateTimeFormatForUI(data)}
                    value={this.props.value} onSelectDate={(date: Date) => {
                        if (this.props.onSelectDate !== undefined) {
                            this.props.onSelectDate(date);
                        }
                    }}
                />
                {
                    (!_.isUndefined(this.props.errorMessage)) ?
                        <div role="alert">
                            <p className="ms-TextField-errorMessage">
                                <span data-automation-id="error-message">{this.props.errorMessage}</span>
                            </p>
                        </div> : ""
                }
            </div >
        );
    }

}

export default DatePicker;