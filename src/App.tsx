import React from 'react';
import './App.scss';
import { HashRouter } from 'react-router-dom';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// Pictures
import BoschBandSrc from './assets/pictures/BoschBand.png';
import BoschLogoSrc from './assets/pictures/BoschLogo.png';
// Fabric components
import { initializeIcons } from '@uifabric/icons';
import 'office-ui-fabric-react/dist/css/fabric.min.css';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import Environment from './Environment';
import Toaster from './core/components/Toaster';
import LoadingDialog from './core/components/LoadingDialog';
import ConfirmationDialog from './core/components/ConfirmationDialog';
import PermissionsService from './services/PermissionsService';
import IDMService from './services/IDMService';
import { getCurrentUserInfo } from './store/permission/thunks';
import { connect } from 'react-redux';
import { RootState } from './store/configureStore';
import TopNavigation from './core/common/TopNavigation';
import SupportPanel from './core/common/SupportPanel';
import _ from 'lodash';
import RbLabel from './bosch-react/components/label/RbLabel';
import RbDivider from './bosch-react/components/divider/RbDivider';
import RbButton, { ButtonSize } from './bosch-react/components/button/RbButton';
import './bosch-react/style.scss';
import './bosch-react/color.scss';
import './bosch-react/icon.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Color from './core/libraries/Color';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from 'office-ui-fabric-react';

interface AppState {
  isHomePage: boolean,
  routers: any,
}

class App extends React.Component<any, AppState> {

  permissionsSrv: PermissionsService = new PermissionsService();

  idmSrv: IDMService = new IDMService();

  constructor(props: any) {
    super(props);
    this.state = {
      isHomePage: false,
      routers: null
    };
    this.renderRoute = this.renderRoute.bind(this);
    this.getSupportTemplate = this.getSupportTemplate.bind(this);
  }

  componentDidMount() {
    if (Environment.isLocalhost) {
      initializeIcons();
    }
    else {
      initializeIcons(Environment.spaCommonPageUrl);
    }
    // Get current user information
    this.props.getCurrentUserInfo();
    this.setState({ routers: Environment.setupRouter(this.renderRoute) });
  }

  render() {
    let element: any = "";
    if (!_.isUndefined(this.props.userProfile)) {
      element = (
        <HashRouter basename="/" hashType="slash">
          <div className="Header">
            <div className="ms-Grid">
              <div className="ms-Grid-row">
                <img className="bosch-band" src={BoschBandSrc} alt="Bosch Brand" />
                <div className="ms-Grid-col left-area" >
                  <a href={Environment.rootWeb}><img src={BoschLogoSrc} alt="Bosch Logo" /></a>
                  <TopNavigation />
                </div>
                <div className="ms-Grid-col right-area">
                  <RbLabel style={{marginRight:"0.4rem"}} isInline={false}>{this.props.userProfile.name}</RbLabel>
                  <div style={{display: "inline-block"}}>
                    <RbButton spanClassName="support-icon pointer" label="Support" size={ButtonSize.Small} onClick={this.getSupportTemplate}></RbButton>
                  </div>
                  <RbButton style={{float: "right"}} label="Feedback" size={ButtonSize.Small} onClick={() => {
                    window.open(Environment.feedbackUrl, "_blank");}} />
                </div>
              </div>
              <div className="ms-Grid-row">
                <RbDivider />
              </div>
            </div>
          </div>

          <div className="Main-Content">
            {this.state.routers}
            <p style={{ marginTop: '40px' }} />
          </div>

          <div className="Footer">
            <div className="info">
              <RbLabel style={{ fontWeight: "bold" }}>© {new Date().getFullYear()} Robert Bosch GmbH</RbLabel>
              <RbLabel>Privacy Policy</RbLabel>
              <RbLabel>Sitemap</RbLabel>
              <RbLabel>Mobile Site</RbLabel>
              <a href={Environment.rssUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon style={{ color: Color.ORANGE, fontSize: "18px", marginBottom: "-2px" }} icon={faRssSquare} />
              </a>
            </div>
            <img className="bosch-band" src={BoschBandSrc} alt="Bosch Brand" />
          </div>

          <SupportPanel />
        </HashRouter >
      );
    }
    else {
      element = (
        <div className="ms-Grid" style={{ width: "100vw", height: "100vh" }}>
          <div className="ms-Grid-row" style={{ width: "100vw", height: "100vh", textAlign: "center" }}>
            <div style={{ width: "50vw", marginTop: "45vh", marginLeft: "25vw" }}>
              <ProgressIndicator label="FEBER is loading" description="Please wait for some seconds ..." />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="ms-Fabric" dir="ltr">
        {element}
        {/* Toaster */}
        <Toaster />
        {/* Loading Dialog */}
        <LoadingDialog />
        {/* Confirmation Dialog */}
        <ConfirmationDialog />
      </div>
    );
  }

  renderRoute(propsParam: any, element: any) {
    if (!_.isNil(element.type)) {
      let newElement = React.cloneElement(element, { ...propsParam });
      return newElement;
    }
    else {
      return "";
    }
  }

  getSupportTemplate() {
    let text: string = "mailto:Mailbox.FEBER@de.bosch.com?"
      + "subject=[FEBER][Brief description for your issue here]"
      + "&body="
      + "Please help us answer these questions for better/faster support:%0D%0A %0D%0A"
      + "Q: Please describe your issue in details. %0D%0A"
      + "A: %0D%0A %0D%0A"
      + "Q: If possible, please provide the screenshots of the issue. %0D%0A"
      + "A: %0D%0A %0D%0A"
      + "Q: Please provide us the link/url, which causes the issue. %0D%0A"
      + "A: %0D%0A %0D%0A"
      + "Q: Please provide the NTID of the user, who has the issue. %0D%0A"
      + "A: %0D%0A %0D%0A"
      + "Note: If you are going to update the attachment, please remember to attach it into this email %0D%0A";
    window.location.assign(text);
  }

}

const mapStateToProps = (state: RootState) => ({
  userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { getCurrentUserInfo: getCurrentUserInfo })(App);
