import * as React from 'react';
import { Link } from '@fluentui/react';
import Color from '../../../core/libraries/Color';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { IUserProfile } from '../../../store/permission/types';
import Template from '../../../core/libraries/Template';
import Helper from '../../../core/libraries/Helper';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';

interface INonRnDUserProps {
    userProfile: IUserProfile,
    report: any
}

class NonRnDUser extends React.Component<INonRnDUserProps, any> {

    render() {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <RbLabel size={LabelSize.Large} style={{color: Color.BLUE}}>You are not RnD user</RbLabel>
                </div>
                <div className="ms-Grid-row">
                    <p><RbLabel>You are trying to access the following FEBER-Report:</RbLabel></p>
                    <div className="ms-Grid" style={{ padding: "20px 0px" }}>
                        {this.renderTemplate("Title", this.props.report.Title)}
                        {this.renderTemplate("Author(s)", Template.renderReadOnlyPeoplePickerTags(Helper.getPeoplePickerStringByObjectArray(this.props.report.ReportAuthor)))}
                        {this.renderTemplate("Report date", Helper.getDateTimeFormatForUI(this.props.report.DocumentDate))}
                        {this.renderTemplate("Keywords", <RbLabel isMultipleLines={true} maxLines={8}>{this.props.report.FeberKeywords}</RbLabel>)}
                    </div>

                    <p>
                        <RbLabel>To access R&amp;D-Reports in FEBER, the role "idm2bcd_feber_user" is required.</RbLabel>
                        <RbLabel>Send a email to your IdM-Administrator or&nbsp;
                                        <Link href={
                                "mailto:ITServiceDesk@bosch.com?"
                                + "subject=Request for IDM Role \"" + this.props.userProfile?.permissions?.rndGroup + "\""
                                + "&body="
                                + "Dear CI-Hotline, %0D%0A %0D%0A"
                                + "Please help grant the FEBER idm role \"" + this.props.userProfile?.permissions?.rndGroup + "\" to my account. %0D%0A"
                                + "Reason: Access to FEBER research and development reports. %0D%0A %0D%0A"
                                + "My NTID is " + this.props.userProfile?.loginName + " %0D%0A %0D%0A"
                                + "Best Regards, %0D%0A"
                                + this.props.userProfile.name
                            }>CI-Hotline</Link>
                                        &nbsp;and ask them to assign the role to your user.</RbLabel>
                    </p>
                    <p><RbLabel>For further information regarding FEBER, please visit the&nbsp;
                                    <Link href="https://connect.bosch.com/communities/community/feber/">FEBER-Community</Link>
                                    &nbsp;in Bosch Connect.</RbLabel></p>
                </div>
            </div >
        );
    }

    renderTemplate(title: string, value: any) {
        return (
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm2"><RbLabel>{title}</RbLabel></div>
                <div className="ms-Grid-col ms-sm10"><RbLabel>{value}</RbLabel></div>
            </div>
        );
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    report: state.accessMediator.data
});

export default connect(mapStateToProps)(NonRnDUser);