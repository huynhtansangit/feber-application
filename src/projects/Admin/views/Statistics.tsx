/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import Constants from '../../../core/libraries/Constants';
import AdminWrapper from './AdminWrapper';
import Environment from '../../../Environment';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbTabs, { IRbTabItem } from '../../../bosch-react/components/tabs/RbTabs';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';
import RbRadio, { IRbRadioItem } from '../../../bosch-react/components/radio/RbRadio';
const Statistic_Search = React.lazy(() => import('../components/Statistic_Search'));
const Statistic_Report = React.lazy(() => import('../components/Statistic_Report'));

interface StatisticsProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog
}

class Statistics extends React.Component<StatisticsProps, any> {

    componentDidMount() {
        if (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            /* Access Dialog */
            this.props.confirmDialog(
                Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.TITLE,
                Constants.CONFIRMATION_MESSAGE.NO_PERMISSION.CONTENT,
                true,
                () => {
                    window.location.href = Environment.rootWeb;
                }
            );
        }
    }

    render() {
        let element: any = "";
        const items: IRbTabItem[] = [
            {
                label: "Power BI",
                content: (
                    <React.Suspense fallback={
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12" style={{ textAlign: "center", paddingTop: "35vh" }}>
                                    <RbLoadingSpinner size="1.5" />
                                </div>
                            </div>
                        </div>
                    }>
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <iframe style={{width:"100%", minHeight: "80vh", overflow:"auto"}} src="https://app.powerbi.com/reportEmbed?reportId=6e12c79f-0fdb-484a-8be4-2f35460c75ba&autoAuth=true&ctid=0ae51e19-07c8-4e4b-bb6d-648ee58410f4&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLW5vcnRoLWV1cm9wZS1sLXByaW1hcnktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D"  allowFullScreen></iframe>
                            </div>
                        </div>
                    </React.Suspense>
                )
            },
            {
                label: "Export data to excel",
                content: (
                    <React.Suspense fallback={
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12" style={{ textAlign: "center", paddingTop: "35vh" }}>
                                    <RbLoadingSpinner size="1.5" />
                                </div>
                            </div>
                        </div>
                    }>
                        <Statistic_Report type="download"></Statistic_Report>
                    </React.Suspense>
                )
            }
        ];
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {

            element = (
                <AdminWrapper>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm1" />
                            <div className="ms-Grid-col ms-sm10">

                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <RbLabel className="header-title" size={LabelSize.Large}>Statistics</RbLabel>
                                    </div>
                                    <div className="ms-Grid-row">
                                        <RbTabs items={items} />
                                    </div>

                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                    </div>
                </AdminWrapper>
            );
        }
        else
        {
            if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {

                element = (
                    <AdminWrapper>
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm1" />
                                <div className="ms-Grid-col ms-sm10">
    
                                    <div className="ms-Grid">
                                        <div className="ms-Grid-row">
                                            <RbLabel className="header-title" size={LabelSize.Large}>Statistics</RbLabel>
                                        </div>
                                        <div className="ms-Grid-row">
                                            <RbTabs items={[items[0]]} />
                                        </div>
    
                                    </div>
    
                                </div>
                                <div className="ms-Grid-col ms-sm1" />
                            </div>
                        </div>
                    </AdminWrapper>
                );
            }
        }
        
        return element;
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog })(Statistics);