import * as React from 'react';
import AdminWrapper from './AdminWrapper';
import Environment from '../../../Environment';
import Constants from '../../../core/libraries/Constants';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog } from '../../../store/util/actions';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';

interface ManagementProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog
}

class Management extends React.Component<ManagementProps, any>{

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
        let categories: any[] = [
            { icon: "statistics", title: "Statistics", link: "Statistics", permissions: [Constants.PERMISSIONS.ADMIN] },
            { icon: "move", title: "Move", link: "MoveReports", permissions: [Constants.PERMISSIONS.ADMIN] },
            {
                icon: "grant-access", title: "Grant Access", link: "GrantAccess", permissions: [Constants.PERMISSIONS.SUPER_ADMIN,
                Constants.PERMISSIONS.RND_DIVISION_ADMIN, Constants.PERMISSIONS.THESIS_ADMIN]
            },
            { icon: "divisions", title: "Divisions", link: "Divisions", permissions: [Constants.PERMISSIONS.SUPER_ADMIN] },
            { icon: "departments", title: "Departments", link: "Departments", permissions: [Constants.PERMISSIONS.SUPER_ADMIN] },
            { icon: "groups", title: "Groups", link: "Groups", permissions: [Constants.PERMISSIONS.SUPER_ADMIN] },
            { icon: "logs", title: "Logs", link: "Logs", permissions: [Constants.PERMISSIONS.SUPER_ADMIN] }
            // Old icon
            // Chart,FabricMovetoFolder,D365TalentHRCore,EMI,Quantity,Teamwork,ComplianceAudit

        ];
        let element: any = null;
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            element = (
                <AdminWrapper>
                    <div className="ms-Grid">
                        {/* Title */}
                        <div className="ms-Grid-row">
                            <RbLabel className="header-title" style={{ textAlign: "center", marginLeft: "3rem" }} size={LabelSize.Large}>
                                Management Dashboard
                            </RbLabel>
                        </div>
                        <div className="ms-Grid-row">
                            <div className="ms-Grid">
                                <div className="ms-Grid-row">
                                    <div className="ms-Grid-col ms-sm2" />
                                    <div className="ms-Grid-col ms-sm8">
                                        <div className="ms-Grid">
                                            <div className="ms-Grid-row">
                                                {categories.map((category: any) => {
                                                    return this.renderCategory(category);
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminWrapper >
            );
        }
        return element;
    }

    renderCategory(category: { icon: string, title: string, link: string, permissions: any[] }) {
        if (this.props.userProfile?.permissions?.checkHasPermission(category.permissions)) {
            return (
                <div className="ms-Grid-col ms-sm4" key={category.icon}>
                    <div className="ms-Grid" onClick={() => {
                        if (Environment.isLocalhost) {
                            window.location.assign(Environment.rootWeb + "#/Management/" + category.link);
                        }
                        else {
                            window.location.assign(Environment.spaRootPageUrl + "index.aspx#/Management/" + category.link);
                        }
                    }} style={{ cursor: "pointer", padding: "1rem" }}>
                        <div className="ms-Grid-row management-block">
                            {/* <Icon iconName={category.icon}></Icon> */}
                            <span className={"management-icon rb-ic rb-ic-" + category.icon}></span>
                        </div>
                        <div className="ms-Grid-row management-label" style={{ textAlign: "center" }}>
                            <RbLabel className="management-title">{category.title}</RbLabel>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return "";
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog })(Management);