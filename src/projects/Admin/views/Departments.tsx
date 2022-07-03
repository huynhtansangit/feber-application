/* eslint react/jsx-pascal-case: 0 */
import * as React from 'react';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import AdminWrapper from './AdminWrapper';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog } from '../../../store/util/actions';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbTabs, { IRbTabItem } from '../../../bosch-react/components/tabs/RbTabs';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';
const DeptMgm_CleanUp = React.lazy(() => import('../components/DeptMgm_CleanUp'));
const DeptMgm_Validation = React.lazy(() => import('../components/DeptMgm_Validation'));
const DeptMgm_Create = React.lazy(() => import('../components/DeptMgm_Create'));
const DeptMgm_AIMReport = React.lazy(() => import('../components/DeptMgm_AIMReport'));

interface DepartmentsProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog
}

class Departments extends React.Component<DepartmentsProps, any> {

    constructor(props: DepartmentsProps) {
        super(props);

        this.state = {
        };
    }

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
                label: "Create",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <DeptMgm_Create />
                    </React.Suspense>
                )
            },
            {
                label: "Clean up",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <DeptMgm_CleanUp />
                    </React.Suspense>
                )
            },
            {
                label: "Validation",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <DeptMgm_Validation />
                    </React.Suspense>
                )
            },
            {
                label: "AIM Report",
                content: (
                    <React.Suspense fallback={<RbLoadingSpinner />}>
                        <DeptMgm_AIMReport />
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
                                        <RbLabel className="header-title" size={LabelSize.Large} >Departments</RbLabel>
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
        return element;
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog })(Departments);