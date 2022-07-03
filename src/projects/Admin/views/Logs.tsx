/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import AdminWrapper from './AdminWrapper';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { init as initView } from '../../../store/log/view/actions';
import { init as initRules } from '../../../store/log/rules/actions';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbTabs, { IRbTabItem } from '../../../bosch-react/components/tabs/RbTabs';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';
const Logs_View = React.lazy(() => import('../components/Logs_View'));
const Logs_Rules = React.lazy(() => import('../components/Logs_Rules'));

interface LogsProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    initView: typeof initView,
    initRules: typeof initRules,
}

class Logs extends React.Component<LogsProps, any> {

    componentDidMount() {
        if (!this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
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
                label: "View",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <Logs_View />
                    </React.Suspense>
                )
            },
            {
                label: "Rules",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <Logs_Rules />
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
                                        <RbLabel className="header-title" size={LabelSize.Large}>Logs</RbLabel>
                                    </div>
                                    <div className="ms-Grid-row">
                                        <RbTabs items={items} onClick={() => {
                                            this.props.initView();
                                            this.props.initRules();
                                        }} />
                                    </div>
                                </div>

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                    </div>
                </AdminWrapper>
            );
        }
        return element;
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, initView, initRules })(Logs);