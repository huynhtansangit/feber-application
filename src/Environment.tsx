import React from "react";
import { Switch, Route } from "react-router";
import RbLoadingSpinner from "./bosch-react/components/loading-spinner/RbLoadingSpinner";
// // Search
const Home = React.lazy(() => import('./projects/Search/views/Home'));
const SearchResults = React.lazy(() => import('./projects/Search/views/SearchResults'));
// // Admin
const MoveReport = React.lazy(() => import('./projects/Admin/views/MoveReport'));
const MoveReports = React.lazy(() => import('./projects/Admin/views/MoveReports'));
const GrantAccess = React.lazy(() => import('./projects/Admin/views/GrantAccess'));
const Divisions = React.lazy(() => import('./projects/Admin/views/Divisions'));
const Departments = React.lazy(() => import('./projects/Admin/views/Departments'));
const Management = React.lazy(() => import('./projects/Admin/views/Management'));
const Statistics = React.lazy(() => import('./projects/Admin/views/Statistics'));
const Groups = React.lazy(() => import('./projects/Admin/views/Groups'));
const Logs = React.lazy(() => import("./projects/Admin/views/Logs"));
// // Account
const MyBookmarks = React.lazy(() => import('./projects/Account/views/MyBookmarks'));
const MySubscriptions = React.lazy(() => import('./projects/Account/views/MySubscriptions'));
const MyPendingOrders = React.lazy(() => import('./projects/Account/views/MyReports/MyPendingOrders'));
const MyPendingReports = React.lazy(() => import('./projects/Account/views/MyReports/MyPendingReports'));
const MyClosedUploads = React.lazy(() => import('./projects/Account/views/MyReports/MyClosedUploads'));
const MyApprovedUploads = React.lazy(() => import('./projects/Account/views/MyReports/MyApprovedUploads'));
const MyApprovedOrders = React.lazy(() => import('./projects/Account/views/MyReports/MyApprovedOrders'));
// // Access
const AccessLoader = React.lazy(() => import('./projects/Access/views/AccessLoader'));
// // Upload
const Upload = React.lazy(() => import('./projects/Upload/views/Upload'));

/* For Test Only */
// import AccessLoader from "./projects/Access/views/AccessLoader";
// import MyPendingOrders from "./projects/Account/views/MyReports/MyPendingOrders";
// import MyPendingReports from "./projects/Account/views/MyReports/MyPendingReports";


class Environment {

    /* ------------------------------ CONFIGURATIONS ------------------------------ */

    static setupRouter(renderRoute: any) {
        return (
            <Switch>
                <React.Suspense fallback={
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12" style={{ textAlign: "center", paddingTop: "35vh" }}>
                                <RbLoadingSpinner size="1.5" />
                            </div>
                        </div>
                    </div>
                }>
                {/* Search */}
                <Route exact={true} path="/" render={(props) => renderRoute(props, <Home />)} />
                <Route path="/Search" render={(props) => renderRoute(props, <Home />)} />
                <Route path="/SearchResults" render={(props) => renderRoute(props, <SearchResults />)} />
                {/* Admin */}
                <Route exact={true} path="/Management" render={(props) => renderRoute(props, <Management />)} />
                <Route exact={true} path="/Management/Statistics" render={(props) => renderRoute(props, <Statistics />)} />
                <Route exact={true} path="/Management/MoveReports" render={(props) => renderRoute(props, <MoveReports />)} />
                <Route exact={true} path="/Management/GrantAccess" render={(props) => renderRoute(props, <GrantAccess />)} />
                <Route exact={true} path="/Management/Divisions" render={(props) => renderRoute(props, <Divisions />)} />
                <Route exact={true} path="/Management/Departments" render={(props) => renderRoute(props, <Departments />)} />
                <Route exact={true} path="/Management/Groups" render={(props) => renderRoute(props, <Groups />)} />
                <Route exact={true} path="/Management/Logs" render={(props) => renderRoute(props, <Logs />)} />
                <Route exact={true} path="/MoveReport" render={(props) => renderRoute(props, <MoveReport />)} />
                {/* Account */}
                <Route path="/MyBookmarks" render={(props) => renderRoute(props, <MyBookmarks />)} />
                <Route path="/MySubscriptions" render={(props) => renderRoute(props, <MySubscriptions />)} />
                <Route path="/MyPendingOrders" render={(props) => renderRoute(props, <MyPendingOrders />)} />
                <Route path="/MyPendingReports" render={(props) => renderRoute(props, <MyPendingReports />)} />
                <Route path="/MyClosedUploads" render={(props) => renderRoute(props, <MyClosedUploads />)} />
                <Route path="/MyApprovedUploads" render={(props) => renderRoute(props, <MyApprovedUploads />)} />
                <Route path="/MyApprovedOrders" render={(props) => renderRoute(props, <MyApprovedOrders />)} />
                {/* Access */}
                <Route path="/AccessMediator" render={(props) => renderRoute(props, <AccessLoader />)} />
                {/* Upload */}
                {<Route path="/Upload" render={(props) => renderRoute(props, <Upload />)} />}
                {<Route path="/AdminUpload" render={(props) => renderRoute(props, <Upload mode="admin" />)} />}

                </React.Suspense>
            </Switch >
        );
    }

    static spaSiteName: string = "/SPA";

    /* ------------------------------ INTERNAL LINK ------------------------------ */ //--Uncomment block for deploy

    static rootWeb = Environment._getRootWeb(window.location.protocol + "//" + window.location.host);

    static appUrl: string = Environment.rootWeb + Environment.spaSiteName + "/Pages/index.aspx#/";

    static isLocalhost: boolean = Environment.rootWeb === "http://localhost:1000";

    static spaSiteUrl: string = Environment.rootWeb + Environment.spaSiteName;

    static spaRootPageUrl: string = Environment.spaSiteUrl + "/Pages/";

    static spaCommonPageUrl: string = Environment.spaRootPageUrl + "common/";

    /* ------------------------------ CURRENT ENVIRONMENT ------------------------------ */

    static currentEnvironment: string = Environment._getCurrentEnvironment(Environment.rootWeb);

    /* ------------------------------ PHA & WCF LINK ------------------------------ */

    static phaUrl: string = Environment._getFeberPHAUrl() + "FEBER/";

    static phaPageUrl: string = Environment.phaUrl + "FeberApp/Pages/";

    static feberWebServiceUrl: string = Environment._getFeberWebServiceUrl() + "/FEBER/FeberWebAPI/";
    // // Test
    // static feberWebServiceUrl: string = "http://localhost:50614/";

    static feberWCFUrl: string = Environment._getFeberWebServiceUrl() + "/FEBER/FeberWorkOnConnector/FeberWorkOnConnector.svc/";


    /* ------------------------------ USE TO RUN ON LOCAL (WITH SANDBOX ENVIRONMENT)------------------------------ */

        // static local = 'http://localhost:3000';

        // //static rootWeb = 'https://feber.sp-apps-d1.bosch.com';
        // static rootWeb = 'http://feber.inside-apps-sandbox.bosch.com';
        // //static rootWeb = "https://feber.inside-appsd.bosch.com";
        // static appUrl: string = Environment.local + Environment.spaSiteName + "/Pages/index.aspx#/";

        // static isLocalhost: boolean = Environment.local === "http://localhost:1000";

        // //static spaSiteUrl: string = Environment.local + Environment.spaSiteName;
        // static spaSiteUrl: string = Environment.rootWeb + Environment.spaSiteName;

        // static spaRootPageUrl: string = Environment.local + Environment.spaSiteName + "/Pages/";

        // static spaCommonPageUrl: string = Environment.spaRootPageUrl + "common/";

        // /* ------------------------------ CURRENT ENVIRONMENT ------------------------------ */

        // static currentEnvironment: string = 'S';
        // //static currentEnvironment: string = 'D';
        // /* ------------------------------ PHA & WCF LINK ------------------------------ */

        // static phaUrl: string = 'http://localhost:50614/';
        // //static phaUrl: string = 'http://inside-hosted-apps-sandbox.bosch.com/' + "FEBER/";
        // //static phaUrl: string = 'https://inside-hosted-appsd.bosch.com/' + "FEBER/";
        // static phaPageUrl: string = Environment.phaUrl + "FeberApp/Pages/";

        // static feberWebServiceUrl: string = 'http://localhost:50614/';
        // //static feberWebServiceUrl: string = 'http://inside-hosted-apps-sandbox.bosch.com' + "/FEBER/FeberWebAPI/";
        // //static feberWebServiceUrl: string = 'https://inside-hosted-appsd.bosch.com' + "/FEBER/FeberWebAPI/";
        // //static feberWebServiceUrl: string = 'https://fe0vmc2540.de.bosch.com' + "/FEBER/FeberWebAPI/"; 
        // // // Test
        // // static feberWebServiceUrl: string = "http://localhost:50614/";

        // static feberWCFUrl: string = 'http://localhost:50614' + "/FeberWorkOnConnector.svc/";
        // //static feberWCFUrl: string = 'http://inside-hosted-apps-sandbox.bosch.com' + "/FEBER/FeberWorkOnConnector/FeberWorkOnConnector.svc/";
        // //static feberWCFUrl: string = 'https://inside-hosted-appsd.bosch.com' + "/FEBER/FeberWorkOnConnector/FeberWorkOnConnector.svc/";
    /* ------------------------------ EXTERNAL LINK ------------------------------ */

    static workOnUrl: string = Environment._getWorkOnUrl();

    static workOnItemUrl: string = Environment._getWorkOnItemUrl();

    static boschConnectUrl: string = Environment._getBoschConnectUrl();

    static feedbackUrl: string = Environment._getFeberFeedbackUrl();

    static feedbackManagementUrl: string = "https://survey.bosch.com/cgi-bin/e.app?V=6LkwU2yLbH";

    static faqUrl: string = "https://connect.bosch.com/wikis/home?lang=en#!/wiki/W7cbb882c1f55_499c_8e33_16b044230cc9/page/FEBER%20FAQ";

    static userManualUrl: string = "https://connect.bosch.com/wikis/home?lang=en#!/wiki/W7cbb882c1f55_499c_8e33_16b044230cc9/page/FEBER%20User%20Manual";

    static serviceSpecSheetUrl: string = "https://inside-share-hosted-apps.bosch.com/DMS/GetDocumentService/Document.svc/GetDocumentURL?documentID=P01S005204-1-548";

    static rssUrl: string = "https://connect.bosch.com/connections/opensocial/basic/rest/activitystreams/urn:lsid:lconn.ibm.com:communities.community:66db0241-4c1b-469b-9f4d-80fdaff0cd55/@all/@all?rollup=true&shortStrings=true&format=atom";

    /* ------------------------------ PRIVATE FUNCTIONS ------------------------------ */
    private static _getFeberPHAUrl() {
        let result: string = "";
        let environment = "";
        // Case SP2019

        var s = "";
        if (Environment.rootWeb.includes("feber.sp-apps")) {
            s = "feber.sp-apps"
        }
        else {
            s = "feber.inside-apps"
        }
        try {
            environment = Environment.rootWeb.split(s)[1].split(".bosch.com")[0];
        }
        catch{
            environment = "O";
        }
        switch (environment.toLowerCase()) {
            case "-sandbox": { // Sandbox
                result = "http://inside-hosted-apps-sandbox.bosch.com/";
                break
            }
            case "-d2": {// D2
                result = "https://inside-share-hosted-apps-d2.bosch.com/";
                break;
            }
            case "-q": { // Q
                result = "https://inside-share-hosted-apps-q.q9-bcd-de.q9-bcd-bosch.test-bosch.com/";
                break;
            }
            case "": { // Production
                result = "https://inside-share-hosted-apps.bosch.com/";
                break;
            }
            default: { // Dev
                result = "http://localhost:1000/";
                break;
            }
        }
        return result;
    }

    private static _getFeberWebServiceUrl() {
        let result: string = "";
        let environment = "";
        // Case SP2019
        var s = "";
        if (Environment.rootWeb.includes("feber.sp-apps")) {
            s = "feber.sp-apps"
        }
        else {
            s = "feber.inside-apps"
        }
        try {
            environment = Environment.rootWeb.split(s)[1].split(".bosch.com")[0];
        }
        catch{
            return "";
        }
        switch (environment.toLowerCase()) {
            case "-sandbox": { // Sandbox
                result = "http://inside-hosted-apps-sandbox.bosch.com/";
                break
            }
            case "-d2": {// D2
                result = "https://inside-share-hosted-apps-d2.bosch.com/";
                break;
            }
            case "-q": { // Q
                result = "https://inside-share-hosted-apps-q.q9-bcd-de.q9-bcd-bosch.test-bosch.com/";
                break;
            }
            case "": { // Production
                result = "https://inside-share-hosted-apps.bosch.com/";
                break;
            }
            default: { // Dev
                result = "http://localhost:1000/";
                break;
            }
        }
        return result;
    }

    private static _getWorkOnUrl() {
        try {
            let environment = Environment.rootWeb.split("feber.inside-apps")[1].split(".bosch.com")[0];
            if (environment === "") {
                return "https://rb-wam.bosch.com/workon01/workflow01/plugins/servlet/redir/search/FEBER";
            }
            else {
                return "https://rb-wam-q.bosch.com/workon01/workflow01q/secure/BoschIssueNavigator.jspa?pid=10011&reset=true";
            }
        }
        catch{
            return "";
        }
    }

    private static _getWorkOnItemUrl() {
        try {
            let environment = Environment.rootWeb.split("feber.inside-apps")[1].split(".bosch.com")[0];
            if (environment === "") {
                return "https://rb-wam.bosch.com/workon01/workflow01/browse/";
            }
            else {
                return "https://rb-wam-q.bosch.com/workon01/workflow01q/browse/";
            }
        }
        catch{
            return "";
        }
    }

    private static _getBoschConnectUrl() {
        try {
            let environment = Environment.rootWeb.split("feber.inside-apps")[1].split(".bosch.com")[0];
            if (environment === "") {
                return "https://connect.bosch.com/communities/service/html/communitystart?communityUuid=66db0241-4c1b-469b-9f4d-80fdaff0cd55";
            }
            else {
                return "https://rb-connect-q.bosch.com/communities/service/html/community/updates?communityUuid=f6e5bdfc-bf1a-4399-b9e6-3e6812b3ecf8";
            }
        }
        catch{
            return "";
        }
    }

    private static _getFeberFeedbackUrl() {
        let result: string = "";
        let environment = "";
        try {
            environment = Environment.rootWeb.split("feber.inside-apps")[1].split(".bosch.com")[0];
        }
        catch{
            environment = "-sandbox";
        }
        switch (environment.toLowerCase()) {
            case "-sandbox": // Sandbox
            case "d": // D2
            case "q": { // Q
                result = "https://survey.bosch.com/cgi-bin/s.app?A=9VGOY1Gl&S=SYS.Q";
                break;
            }
            case "": { // Production
                result = "https://survey.bosch.com/cgi-bin/s.app?A=9VGOY1Gl&S=SYS.P";
                break;
            }
        }
        return result;
    }

    private static _getRootWeb(originUrl: string) {
        let result = "";
        let environment = "";
        var s = "feber.sp-apps";
        try {
            environment = originUrl.split(s)[1].split(".bosch.com")[0];
        }
        catch{
            environment = "O";
        }
        result = originUrl + ((environment !== "O") ? "" : "");//"/sites/FEBER_Dev");
        return result;
    }

    private static _getCurrentEnvironment(environment: string) {
        let result: string = "";
        let eCode = "";
        // Case SP2019
        var s = "";
        if (Environment.rootWeb.includes("feber.sp-apps")) {
            s = "feber.sp-apps"
        }
        else {
            s = "feber.inside-apps"
        }

        try {
            eCode = environment.split(s)[1].split(".bosch.com")[0];
        }
        catch{
            eCode = "O";
        }
        switch (eCode.toLowerCase()) {
            case "-sandbox": { // Sandbox
                result = "S";
                break
            }
            case "-d2": {// D2
                result = "D";
                break;
            }
            case "-q": { // Q
                result = "Q";
                break;
            }
            case "": { // Production
                result = "P";
                break;
            }
            default: { // Dev
                result = "O";
                break;
            }
        }
        return result;
    }
}

export default Environment;