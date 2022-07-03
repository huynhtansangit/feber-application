import * as React from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { withRouter } from 'react-router-dom';
import Environment from '../../Environment';
import Constants from '../libraries/Constants';
import { connect } from 'react-redux';
import { RootState } from '../../store/configureStore';
import { IUserPermissions } from '../../store/permission/types';
import _ from 'lodash';
import RbTabNavigation, { INavItem } from '../../bosch-react/components/tab-navigation/RbTabNavigation';

class TopNavigation extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        initializeIcons();
        this.state = {
            type: {
                ROOT: 0,
                MODULE: 1,
                EXTERNAL: 2,
                PHA: 3
            },
            MenuItems: [],
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        let permissions: IUserPermissions = this.props.userProfile.permissions;
        // Load normal options
        let menuItems: INavItem[] = [
            {
                label: "Search",
                onClick: () => this.handleClick(this.state.type.MODULE, "/Search")
            },
            {
                label: "Upload",
                onClick: () => this.handleClick(this.state.type.MODULE, "/Upload")
            },
            {
                label: "Account",
                children: [
                    {
                        label: "Bookmarks",
                        onClick: () => this.handleClick(this.state.type.MODULE, "/MyBookmarks")
                    },
                    {
                        label: "Subscriptions",
                        hasDivider: true,
                        onClick: () => this.handleClick(this.state.type.MODULE, "/MySubscriptions")
                    },
                    {
                        label: "My Reports",
                        children: [
                            {
                                label: "Pending Uploads",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/MyPendingReports")
                            },
                            {
                                label: "Approved Uploads",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/MyApprovedUploads?keyword=*")
                            },
                            {
                                label: "Pending Orders",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/MyPendingOrders")
                            },
                            {
                                label: "Approved Orders",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/MyApprovedOrders?keyword=*")
                            },
                            {
                                label: "Cancelled/Rejected Uploads",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/MyClosedUploads")
                            }
                        ]
                    } as INavItem,
                    {
                        label: "My Workflow",
                        onClick: () => this.handleClick(this.state.type.EXTERNAL, "workOn")
                    }
                ]
            } as INavItem
        ];
        // Load options by permissions
        if (!_.isUndefined(permissions.checkHasPermission)) {
            // Super Admin
            if (permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {
                menuItems.push({
                    label: "Admin",
                    children: [
                        {
                            label: "Site Contents",
                            hasDivider: true,
                            onClick: () => this.handleClick(this.state.type.ROOT, "/_layouts/15/viewlsts.aspx")
                        },
                        {
                            label: "Admin Upload",
                            onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                        },
                        {
                            label: "Management",
                            onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                        },
                        {
                            label: "Feedback",
                            onClick: () => this.handleClick(this.state.type.EXTERNAL, "feedbackManagement")
                        }
                    ]
                } as INavItem);
            }
            else {
                // RnD Division Admin
                if (permissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN])) {
                    menuItems.push({
                        label: "Admin",
                        children: [
                            {
                                label: "Site Contents",
                                hasDivider: true,
                                onClick: () => this.handleClick(this.state.type.ROOT,
                                    "/RnD/" + ((permissions.checkRnDDivisionAdmin?.divisionCode !== "") ? permissions.checkRnDDivisionAdmin?.divisionCode
                                        : permissions.checkRnDDivisionAdmin.divisionTitle) + "/_layouts/15/viewlsts.aspx")
                            },
                            {
                                label: "Admin Upload",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                            },
                            {
                                label: "Management",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                            },
                        ]
                    } as INavItem);
                }
                // LL Admin
                else if (permissions.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN])) {
                    menuItems.push({
                        label: "Admin",
                        children: [
                            {
                                label: "Site Contents",
                                hasDivider: true,
                                onClick: () => this.handleClick(this.state.type.ROOT, "/LL/_layouts/15/viewlsts.aspx")
                            },
                            {
                                label: "Admin Upload",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                            },
                            {
                                label: "Management",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                            }
                        ]
                    } as INavItem);
                }
                // LL Division Admin
                else if (permissions.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN])) {
                    menuItems.push({
                        label: "Admin",
                        children: [
                            {
                                label: "Site Contents",
                                hasDivider: true,
                                onClick: () => this.handleClick(this.state.type.ROOT,
                                    "/LL/" + ((permissions.checkLLDivisionAdmin?.divisionCode !== "") ? permissions.checkLLDivisionAdmin?.divisionCode
                                        : permissions.checkLLDivisionAdmin.divisionTitle) + "/_layouts/15/viewlsts.aspx")
                            },
                            {
                                label: "Admin Upload",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                            },
                            {
                                label: "Management",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                            }
                        ]
                    } as INavItem);
                }
                // Thesis Admin
                else if (permissions.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN])) {
                    menuItems.push({
                        label: "Admin",
                        children: [
                            {
                                label: "Site Contents",
                                hasDivider: true,
                                onClick: () => this.handleClick(this.state.type.ROOT, "/Thesis/_layouts/15/viewlsts.aspx")
                            },
                            {
                                label: "Admin Upload",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                            },
                            {
                                label: "Management",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                            },
                        ]
                    } as INavItem);
                }
                // Paper Admin
                else if (permissions.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN])) {
                    menuItems.push({
                        label: "Admin",
                        children: [
                            {
                                label: "Site Contents",
                                hasDivider: true,
                                onClick: () => this.handleClick(this.state.type.ROOT, "/Paper/_layouts/15/viewlsts.aspx")
                            },
                            {
                                label: "Admin Upload",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/AdminUpload")
                            },
                            {
                                label: "Management",
                                onClick: () => this.handleClick(this.state.type.MODULE, "/Management")
                            },
                        ]
                    } as INavItem);
                }

            }
        }
        menuItems.push({
            label: "More",
            children: [
                {
                    label: "FAQ",
                    onClick: () => this.handleClick(this.state.type.EXTERNAL, "faq")
                },
                {
                    label: "User Manual",
                    onClick: () => this.handleClick(this.state.type.EXTERNAL, "userManual")
                },
                {
                    label: "FEBER Community",
                    onClick: () => this.handleClick(this.state.type.EXTERNAL, "boschConnect")
                },
                {
                    label: "Service Spec Sheet",
                    onClick: () => this.handleClick(this.state.type.EXTERNAL, "serviceSpecSheet")
                }
            ]
        } as INavItem);
        this.setState({
            MenuItems: menuItems
        });

    }

    render() {
        const TopNav = withRouter(({ history }) => {
            return (
                <div className="Nav">
                    <RbTabNavigation items={this.state.MenuItems} />
                </div>
            );
        });
        return <TopNav />;
    }

    handleClick(type: any, url: string) {
        switch (type) {
            case 0: { // Root site
                window.location.href = Environment.rootWeb + url;
                break;
            }
            case 1: { // Module site
                if (Environment.isLocalhost) {
                    window.location.href = Environment.rootWeb + "/#" + url;
                }
                else {
                    window.location.href = Environment.spaRootPageUrl + "index.aspx#" + url;
                }
                break;
            }
            case 2: { // External site
                window.open((Environment as any)[url + "Url"], "_blank");
                break;
            }
            case 3: { // PHA site
                window.location.href = Environment.phaUrl + url;
                break;
            }
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps)(TopNavigation);