import * as React from 'react';
import Constants from '../../../core/libraries/Constants';
import { Nav, INavLink } from '@fluentui/react/lib/Nav';
import Environment from '../../../Environment';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { IUserProfile } from '../../../store/permission/types';

interface AdminWrapperProps {
    userProfile: IUserProfile | undefined
}

class AdminWrapper extends React.Component<AdminWrapperProps, any>{

    constructor(props: AdminWrapperProps) {
        super(props);
        this.renderSideBar = this.renderSideBar.bind(this);
        this.getLink = this.getLink.bind(this);
    }

    render() {
        let element: any = "";
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            element = (
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm1" >
                            {this.renderSideBar()}
                        </div>
                        <div className="ms-Grid-col ms-sm11">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            );
        }
        return element;
    }

    renderSideBar() {
        let options: INavLink[] = [];
        // Statistics
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            options.push({ name: "Statistics", url: this.getLink("Statistics") });
        }
        // Move
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.ADMIN])) {
            options.push({ name: "Move", url: this.getLink("MoveReports") });
        }
        // Grant Access
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN,
        Constants.PERMISSIONS.RND_DIVISION_ADMIN, Constants.PERMISSIONS.THESIS_ADMIN])) {
            options.push({ name: "Grant Access", url: this.getLink("GrantAccess") });
        }
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
            // Divisions
            options.push({ name: "Divisions", url: this.getLink("Divisions") });
            // Departments
            options.push({ name: "Departments", url: this.getLink("Departments") });
            // Groups
            options.push({ name: "Groups", url: this.getLink("Groups") });
            // Logs
            options.push({ name: "Logs", url: this.getLink("Logs") });
        }
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row management-title">
                    <Nav
                        styles={{
                            root: {
                                width: "100%",
                                height: "calc(100vh - 140px)",
                                boxSizing: 'border-box',
                                borderRight: '1px solid #eee',
                                overflowY: 'auto',
                            }
                        }}
                        groups={[{
                            links: options
                        }]}
                    />
                </div>
            </div>
        );
    }

    getLink(target: string) {
        if (Environment.isLocalhost) {
            return (Environment.rootWeb + "#/Management/" + target);
        }
        else {
            return (Environment.spaRootPageUrl + "index.aspx#/Management/" + target);
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps)(AdminWrapper);