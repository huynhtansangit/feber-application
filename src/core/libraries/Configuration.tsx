import { IDetailsHeaderProps, IDetailsColumnRenderTooltipProps } from '@fluentui/react/lib/DetailsList';
import { IRenderFunction } from '@uifabric/utilities';
import * as React from 'react';
import { StickyPositionType, Sticky } from '@fluentui/react/lib/Sticky';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import _ from 'lodash';

class Configuration {

    static dayPickerStrings = {
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        goToToday: 'Go to today',
        prevMonthAriaLabel: 'Go to previous month',
        nextMonthAriaLabel: 'Go to next month',
        prevYearAriaLabel: 'Go to previous year',
        nextYearAriaLabel: 'Go to next year'
    };

    static webAPIHeader = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Origin,X-Requested-With, Content-Type,Accept, Authorization, X-Custom-Header",
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose"
    };

    static onRenderStickyDetailsHeader(props: IDetailsHeaderProps | undefined, defaultRender?: IRenderFunction<IDetailsHeaderProps>): JSX.Element | null {
        if (!_.isUndefined(props)) {
            return (
                <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
                    {defaultRender!({
                        ...props,
                        onRenderColumnHeaderTooltip: (tooltipHostProps: IDetailsColumnRenderTooltipProps | undefined) => <TooltipHost {...tooltipHostProps} />
                    })}
                </Sticky>
            );
        }
        return null;
    }

}

export default Configuration;