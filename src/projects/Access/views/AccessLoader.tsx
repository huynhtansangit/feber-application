import * as React from 'react';
import querystring from 'querystring';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { IUserProfile } from '../../../store/permission/types';
import { changeMode } from '../../../store/access-mediator/actions';
import { getData, getReportTypes } from '../../../store/access-mediator/thunks';
import _ from 'lodash';
import { PageName } from '../../../store/access-mediator/types';
import AccessMediator from '../components/AccessMediator';
import Order from '../components/Order';
import NonRnDUser from '../components/NonRnDUser';
import RbLoadingSpinner from '../../../bosch-react/components/loading-spinner/RbLoadingSpinner';
import NotFound from '../components/NotFound';

interface AccessLoaderProps {
    userProfile: IUserProfile | undefined,
    page: string
    data: any,
    changeMode: typeof changeMode,
    getData: any,
    getReportTypes: any,
    location: any,
    history: any
};

class AccessLoader extends React.Component<AccessLoaderProps, any> {

    constructor(props: AccessLoaderProps) {
        super(props);
        // Helper functions
        this.getMode = this.getMode.bind(this);
    }

    componentDidMount() {
        let parameters: any = querystring.parse(this.props.location.search);
        let guid = parameters["?Guid"];
        let mode = this.getMode(parameters["Mode"]);
        this.props.changeMode(mode);
        this.props.getData(this.props.userProfile.userToken, guid, (result: any) => {
            if (!_.isNil(result)) {
                this.props.getReportTypes(result.UploadType);
            }
        });
    }

    render() {
        let element = null;
        switch (this.props.page) {
            case PageName.ACCESS_MEDIATOR: {
                element = <AccessMediator />
                break;
            }
            case PageName.ORDER: {
                element = <Order />
                break;
            }
            case PageName.NON_RND_USER: {
                element = <NonRnDUser />;
                break;
            }
            case PageName.NOT_FOUND: {
                let parameters: any = querystring.parse(this.props.location.search);
                let guid = parameters["?Guid"];
                element = <NotFound guid={guid} />;
                break;
            }
        }
        if (!_.isNil(this.props.data) || (this.props.page === PageName.NOT_FOUND)) {
            return (
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm1" />
                        <div className="ms-Grid-col ms-sm10">
                            {element}
                        </div>
                        <div className="ms-Grid-col ms-sm1" />
                    </div>
                </div>
            );
        }
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12" style={{ textAlign: "center", paddingTop: "35vh" }}>
                        <RbLoadingSpinner size="1.5" />
                    </div>
                </div>
            </div>
        );
    }

    // Helper fucntions
    getMode(mode: string = "") {
        let result = "";
        switch (mode.toLowerCase()) {
            case "edit": {
                result = "Edit";
                break;
            }
            default: {
                result = "View";
                break;
            }
        }
        return result;
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    page: state.accessMediator.page,
    data: state.accessMediator.data
});

export default connect(mapStateToProps, {
    changeMode,
    getData,
    getReportTypes
})(AccessLoader);