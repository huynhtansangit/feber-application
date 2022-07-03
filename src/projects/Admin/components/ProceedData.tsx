/* eslint react/jsx-pascal-case: 0 */
import * as React from "react";
import RbTabs, { IRbTabItem } from "../../../bosch-react/components/tabs/RbTabs";
import RbLoadingSpinner from "../../../bosch-react/components/loading-spinner/RbLoadingSpinner";
const ProceedData_All = React.lazy(() => import('./ProceedData/ProceedData_All'));
const ProceedData_Complete = React.lazy(() => import('./ProceedData/ProceedData_Complete'));
const ProceedData_Unsuccessful = React.lazy(() => import('./ProceedData/ProceedData_Unsuccessful'));
const ProceedData_PendingAttachment = React.lazy(() => import('./ProceedData/ProceedData_PendingAttachment'));

class ProceedData extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.filterByStatus = this.filterByStatus.bind(this);
    }

    render() {
        const items: IRbTabItem[] = [
            {
                label: "All",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner/>}>
                        <ProceedData_All items={this.props.data} refreshData={this.props.refreshData} />
                    </React.Suspense>
                )
            },
            {
                label: "Complete",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner/>}>
                        <ProceedData_Complete items={this.filterByStatus("Complete")} refreshData={this.props.refreshData} />
                    </React.Suspense>
                )
            },
            {
                label: "Unsuccessful",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner/>}>
                        <ProceedData_Unsuccessful items={this.filterByStatus("Unsuccessful")} refreshData={this.props.refreshData} />
                    </React.Suspense>
                )
            },
            {
                label: "Pending Attachment",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner/>}>
                        <ProceedData_PendingAttachment items={this.filterByStatus("Pending Attachment")} refreshData={this.props.refreshData} />
                    </React.Suspense>
                )
            }
        ];
        return (
            <RbTabs items={items} />
        );
    }

    filterByStatus(status: any) {
        return this.props.data.filter((x: any) => x.Status === status);
    }

}

export default ProceedData;