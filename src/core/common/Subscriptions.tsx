import * as React from 'react';
import Axios from 'axios';
import SearchService from '../../services/SearchService';
import SystemService from '../../services/SystemService';
import Helper from '../libraries/Helper';
import Environment from '../../Environment';
import Constants from '../libraries/Constants';
import { RootState } from '../../store/configureStore';
import { connect } from 'react-redux';
import { confirmDialog, showToastMessage } from '../../store/util/actions';
import { IUserProfile } from '../../store/permission/types';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';
import RbLoadingSpinner from '../../bosch-react/components/loading-spinner/RbLoadingSpinner';
import RbTextExpandable from '../../bosch-react/components/text-expandable/RbTextExpandable';
import RbList, { IRbListItem } from '../../bosch-react/components/list/RbList';
import RbLink from '../../bosch-react/components/link/RbLink';

interface SubscriptionsProps {
    userProfile: IUserProfile | undefined,
    confirmDialog: typeof confirmDialog,
    showToastMessage: typeof showToastMessage
}

class Subscriptions extends React.Component<SubscriptionsProps, any> {

    searchSrv: SearchService = new SearchService();

    systemListsSrv: SystemService = new SystemService();

    constructor(props: SubscriptionsProps) {
        super(props);

        this.state = {
            isLoading: true,
            subscriptions: []
        };
        this.convertData = this.convertData.bind(this);
        this.searchText = this.searchText.bind(this);
        this.openAccessMediator = this.openAccessMediator.bind(this);
        this.getSubscriptions = this.getSubscriptions.bind(this);
        this.removeSubscription = this.removeSubscription.bind(this);
    }

    componentDidMount() {
        this.getSubscriptions();
    }

    render() {
        let element: any = "";
        if (this.state.isLoading === true) {
            element = (
                <div className="ms-Grid">
                    <div className="ms-Grid-col ms-sm12" style={{ textAlign: "center" }}>
                        <RbLoadingSpinner />
                    </div>
                </div>
            );
        }
        else {
            element = (<div className="ms-Grid-col ms-sm12 home-subscriptions-description">
                <RbLabel>You have not subscribed for any searched keyword. Kindly subscribe to get your favorite search results.</RbLabel>
            </div>);
            if (this.state.subscriptions.length > 0) {
                element = (
                    <div className="ms-Grid">
                        <div className="ms-Grid-col ms-sm1" />
                        <div className="ms-Grid-col ms-sm10">
                            <div className="ms-Grid">
                                <div className="ms-Grid-row">
                                    {this.state.subscriptions.map((item: any) =>
                                        <div className="ms-Grid-col ms-sm4">
                                            <RbTextExpandable title={item.subscription} size={LabelSize.Large} isExpanded={true}
                                                isClosable={true} onClose={() => { this.removeSubscription(item.subscription) }}>
                                                <RbList items={this.convertData(item.results)} />
                                                <br />
                                                <RbLink label={"View more"} size={LabelSize.Large} hasIcon={true} onClick={() => { this.searchText(item.subscription); }} />
                                            </RbTextExpandable>
                                        </div>)}
                                </div>
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm1" />
                    </div>
                );
            }
        }
        return element;
    }

    convertData(data: any[]): IRbListItem[] {
        const result: IRbListItem[] = [];
        data.forEach(item => {
            result.push({
                text: item.Title,
                onClick: () => {
                    this.openAccessMediator(item.Guid);
                }
            } as IRbListItem);
        });
        return result;
    }

    searchText(value: any) {
        window.location.href = Environment.spaRootPageUrl + "index.aspx#/SearchResults?keyword=" + value;
    }

    openAccessMediator(guid: any) {
        Helper.openDialog(Environment.spaRootPageUrl + "index.aspx?#/AccessMediator?Guid=" + guid);
    }

    getSubscriptions() {
        this.systemListsSrv.getAllSubscriptionsByUser(this.props.userProfile?.id as number).then((results: any[]) => {
            let fns: any[] = [];
            results.forEach(subscription => {
                fns.push(this.searchSrv.callSearch(subscription + " ContentType:ResearchReports ContentType:LessonsLearned ContentType:Thesis ContentType:Paper",
                    "", 5, "", "", 0, [{ Property: "CreatedOWSDATE", Direction: 1 }], null));
            });
            Axios.all(fns).then(rs => {
                let objs = [];
                for (let index = 0; index < results.length; index++) {
                    objs.push({
                        subscription: results[index],
                        results: rs[index].results
                    });
                }
                this.setState({
                    isLoading: false,
                    subscriptions: objs
                });
            });
        });
    }

    removeSubscription(value: any) {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.SUBSCRIPTION_REMOVE.TITLE,
            Constants.CONFIRMATION_MESSAGE.SUBSCRIPTION_REMOVE.CONTENT.replace("{0}", value),
            false, () => {
                this.systemListsSrv.removeSubscription(this.props.userProfile?.id as number, value).then((rs: any) => {
                    if (rs === true) {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.SUCCESS,
                            Constants.SUBSCRIPTION_MESSAGE.REMOVE.SUCCESS.replace("{0}", value)
                        );
                        this.setState({ isLoading: true }, () => {
                            this.getSubscriptions();
                        });
                    }
                    else {
                        this.props.showToastMessage(
                            Constants.TOAST_MESSAGE_CODE.ERROR,
                            Constants.SUBSCRIPTION_MESSAGE.REMOVE.FAILED.replace("{0}", value)
                        );
                    }
                }).catch(() => {
                    this.props.showToastMessage(Constants.TOAST_MESSAGE_CODE.ERROR,
                        Constants.SUBSCRIPTION_MESSAGE.REMOVE.FAILED.replace("{0}", value)
                    );
                });
            });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { confirmDialog, showToastMessage })(Subscriptions);