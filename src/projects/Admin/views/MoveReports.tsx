import * as React from "react";
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import AdminWrapper from './AdminWrapper';
import { IUserProfile } from "../../../store/permission/types";
import { confirmDialog } from "../../../store/util/actions";
import { RootState } from "../../../store/configureStore";
import { connect } from "react-redux";
import { getMigrationData } from "../../../store/system/thunks";
import { init } from "../../../store/system/actions";
import Helper from "../../../core/libraries/Helper";
import _ from "lodash";
import RbLabel, { LabelSize } from "../../../bosch-react/components/label/RbLabel";
import RbLoadingSpinner from "../../../bosch-react/components/loading-spinner/RbLoadingSpinner";
const RetrieveData = React.lazy(() => import('../components/RetrieveData'));
const ProceedData = React.lazy(() => import('../components/ProceedData'));

interface MoveReportsProps {
    userProfile: IUserProfile | undefined,
    items: any[],
    confirmDialog: typeof confirmDialog,
    init: typeof init,
    getMigrationData: any
}

class MoveReports extends React.Component<MoveReportsProps, any> {

    constructor(props: MoveReportsProps) {
        super(props);
        this.refreshData = this.refreshData.bind(this);
        this.getBlockUser = this.getBlockUser.bind(this);
    }

    componentDidMount() {
        this.refreshData(() => {
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
            else {
                let blockUser = this.getBlockUser();
                if (blockUser !== "") {
                    /* Blocked Dialog */
                    this.props.confirmDialog(
                        Constants.CONFIRMATION_MESSAGE.BLOCKED_REPORT.TITLE,
                        Constants.CONFIRMATION_MESSAGE.BLOCKED_REPORT.CONTENT.replace("{0}", blockUser.split("\\")[1].toUpperCase()),
                        true,
                        () => {
                            window.location.href = Environment.rootWeb;
                        }
                    );
                }
            }
        });
    }

    render() {
        let element: any = "";
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN]) && this.getBlockUser() === "") {
            element = (
                <AdminWrapper>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm1" />
                            <div className="ms-Grid-col ms-sm10">

                                <div className="ms-Grid-row">
                                    <RbLabel className="header-title" size={LabelSize.Large}>Move Reports</RbLabel>&nbsp;
                                    <span className="rb-ic rb-ic-info-i-frame" />&nbsp;
                                    <RbLabel size={LabelSize.Small}>While moving reports, you should not edit, delete or move them from other pages.</RbLabel>
                                </div>

                                {(!_.isNil(this.props.items)) ?
                                    ((this.props.items.length === 0) ?
                                        <React.Suspense fallback={<RbLoadingSpinner />}>
                                            <RetrieveData refreshData={this.refreshData} />
                                        </React.Suspense>
                                        :
                                        <React.Suspense fallback={<RbLoadingSpinner />}>
                                            <ProceedData data={this.props.items} refreshData={this.refreshData} />
                                        </React.Suspense>)
                                    : <span>&nbsp;</span>}

                            </div>
                            <div className="ms-Grid-col ms-sm1" />
                        </div>
                    </div>
                </AdminWrapper>
            );
        }
        return element;
    }

    getBlockUser() {
        let blockUser = "";
        let checkOutUser = "";
        if (!_.isNil(this.props.items)) {
            if (this.props.items.length === 0) {
                blockUser = "";
            }
            else if (!_.isUndefined(this.props.items[0].CheckOutUser)) {
                checkOutUser = this.props.items[0].CheckOutUser.toLowerCase();
                let currentUser = this.props.userProfile?.loginName.toLowerCase();
                blockUser = (checkOutUser !== currentUser) ? checkOutUser : "";
            }
        }
        return blockUser;
    }

    refreshData(callback?: any | undefined) {
        if (_.isUndefined(callback)) {
            callback = () => { };
        }
        this.props.init();
        Helper.runNewTask(() => {
            this.props.getMigrationData([() => {
                callback();
            }]);
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    items: state.system.data
});

export default connect(mapStateToProps, {
    confirmDialog,
    init,
    getMigrationData
})(MoveReports);