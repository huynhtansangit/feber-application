import * as React from 'react';
import FeberLogoSrc from '../../../assets/pictures/FEBERLogo.png';
import Subscriptions from '../../../core/common/Subscriptions';
import SystemService from '../../../services/SystemService';
import Helper from '../../../core/libraries/Helper';
import { RootState } from '../../../store/configureStore';
import { connect } from 'react-redux';
import { IUserProfile } from '../../../store/permission/types';
import RbSearchField from '../../../bosch-react/components/search-field/RbSearchField';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';
import RbDivider from '../../../bosch-react/components/divider/RbDivider';

interface HomeProps {
    userProfile: IUserProfile | undefined,
    history: any
}

class Home extends React.Component<HomeProps, any> {

    systemListsSrv: SystemService = new SystemService();

    constructor(props: HomeProps) {
        super(props);
        this.searchText = this.searchText.bind(this);
        this.addToSearchedStatistics = this.addToSearchedStatistics.bind(this);
    }

    render() {
        let element = (
            <div className="ms-Grid">

                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 feber-home-logo">
                        <img src={FeberLogoSrc} alt="FEBER Logo" />
                    </div>

                    <div className="ms-Grid-col ms-sm4" />
                    <div className="ms-Grid-col ms-sm4 text-center">
                        <RbSearchField placeholder="Search..." onSearch={(event, newValue) => this.searchText(newValue)} />
                        <RbLabel className="home-hint">Hint: Type * to search everything</RbLabel>
                    </div>
                    <div className="ms-Grid-col ms-sm4" />
                </div>

                <div className="ms-Grid-row">
                    <RbDivider />
                </div>

                <div className="ms-Grid-row subscription-area">
                    <div className="ms-Grid-col ms-sm12 text-left">
                        <RbLabel size={LabelSize.XLarge} className="subscription-title">Subscriptions</RbLabel>
                    </div>

                    {/* Subscriptions */}
                    <div className="ms-Grid-col ms-sm12">
                        <Subscriptions {...this.props} />
                    </div>
                </div>

            </div>
        );
        return element;
    }

    searchText(text: string) {
        let searchedText = (text.trim() !== "") ? text.trim() : "*";
        this.addToSearchedStatistics(searchedText);
        this.props.history.push("/SearchResults?keyword=" + encodeURIComponent(Helper.encodeCustomized(searchedText)));
    }

    addToSearchedStatistics(searchedText: string) {
        let data = {
            Title: searchedText,
            EventDate: new Date(),
            Division: this.props.userProfile?.division,
            Department: this.props.userProfile?.department
        };
        this.systemListsSrv.addNewStatisticRecord("SearchedStatistics", data).then((rs: any) => {
            if (rs === true) {
                console.log("Added keyword \"" + searchedText + "\" to searched statistic");
            }
            else {
                console.log("Error in adding keyword \"" + searchedText + "\" to searched statistic");
            }
        }).catch(() => {
            console.log("Error in adding keyword \"" + searchedText + "\" to searched statistic");
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps)(Home);