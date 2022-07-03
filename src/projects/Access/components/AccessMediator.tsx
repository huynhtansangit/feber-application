import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import CommandBar from './AccessMediator/CommandBar';
import RightColumn from './AccessMediator/RightColumn';
import LeftColumn from './AccessMediator/LeftColumn';
import Color from '../../../core/libraries/Color';
import _ from 'lodash';
import Helper from '../../../core/libraries/Helper';
import Environment from '../../../Environment';
import { ReportStatus } from '../../../store/access-mediator/types';
import Constants from '../../../core/libraries/Constants';
import { IUserProfile } from '../../../store/permission/types';
import { changeMode } from '../../../store/access-mediator/actions';
import RbLabel from '../../../bosch-react/components/label/RbLabel';

interface AccessMediatorProps {
    userProfile: IUserProfile | undefined,
    report: any,
    status: string,
    changeMode: typeof changeMode
};

class AccessMediator extends React.Component<AccessMediatorProps, any> {

    constructor(props: AccessMediatorProps) {
        super(props);
        this.hasAdminPermission = this.hasAdminPermission.bind(this);
    }

    componentDidMount() {
        if (this.hasAdminPermission() === false && this.props.status === ReportStatus.PUBLISHED) {
            this.props.changeMode("View");
        }
    }

    render() {
        if (!_.isNil(this.props.report)) {
            return (
                <React.Fragment>
                    <div className="ms-Grid">

                        {/* WorkOn Info */}
                        {(this.props.status === ReportStatus.PENDING) ?
                            <div className="ms-Grid-col ms-sm12">
                                <RbLabel style={{ fontSize: "16px", color: Color.GREEN }}>
                                    Pending Approval. You can check the status of the approval directly in WorkOn&nbsp;
                            <span style={{ color: "#0000ff", cursor: "pointer", textDecoration: "underline" }} onClick={() => {
                                        Helper.openNewTab(Environment.workOnItemUrl + this.props.report.WorkflowId);
                                    }}>
                                        {this.props.report.WorkflowId}
                                    </span>
                                </RbLabel>
                            </div>
                            : null}

                        {/* Left column */}
                        <div className="ms-Grid-col ms-lg12 ms-xl6">
                            <LeftColumn hasAdminPermission={this.hasAdminPermission()} />
                        </div>

                        {/* Right column */}
                        <div className="ms-Grid-col ms-lg12 ms-xl6">
                            <RightColumn hasAdminPermission={this.hasAdminPermission()} />
                        </div>

                        {/* Command Bar */}
                        <div className="ms-Grid-col ms-sm12">
                            <CommandBar hasAdminPermission={this.hasAdminPermission()} />
                        </div>
                    </div>
                </React.Fragment>
            );
        }
        return null;
    }

    hasAdminPermission() {
        let { permissions } = this.props.userProfile;
        let division = this.props.report.Division;
        let uploadType = this.props.report.UploadType;
        return (
            // Super Admin
            permissions.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])
            // RnD Divison Admin
            || (permissions.checkHasPermission([Constants.PERMISSIONS.RND_DIVISION_ADMIN]) && uploadType === Constants.DOCUMENT_TYPE.RnD
                && (permissions.checkRnDDivisionAdmin.divisionCode === division || permissions.checkRnDDivisionAdmin.divisionTitle === division))
            // LL Division Admin
            || (permissions.checkHasPermission([Constants.PERMISSIONS.LL_DIVISION_ADMIN]) && uploadType === Constants.DOCUMENT_TYPE.LL
                && (permissions.checkLLDivisionAdmin.divisionCode === division || permissions.checkLLDivisionAdmin.divisionTitle === division))
            // LL Admin
            || (permissions.checkHasPermission([Constants.PERMISSIONS.LL_ADMIN]) && uploadType === Constants.DOCUMENT_TYPE.LL)
            // Thesis Admin
            || (permissions.checkHasPermission([Constants.PERMISSIONS.THESIS_ADMIN]) && uploadType === Constants.DOCUMENT_TYPE.Thesis)
            // Paper Admin
            || (permissions.checkHasPermission([Constants.PERMISSIONS.PAPER_ADMIN]) && uploadType === Constants.DOCUMENT_TYPE.Paper)
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    report: state.accessMediator.data,
    status: state.accessMediator.status
});

export default connect(mapStateToProps, {
    changeMode
})(AccessMediator);