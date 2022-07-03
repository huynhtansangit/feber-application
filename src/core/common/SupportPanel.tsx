import * as React from 'react';
import { DirectionalHint, TooltipHost } from '@fluentui/react';
import { IUserProfile } from '../../store/permission/types';
import { RootState } from '../../store/configureStore';
import { connect } from 'react-redux';

interface SupportPanelProps {
    userProfile: IUserProfile | undefined
}

class SupportPanel extends React.Component<SupportPanelProps, any> {

    constructor(props: SupportPanelProps) {
        super(props);
        this.state = {
            showScrollToTop: false,
            showSupportMessage: false
        };
        this.handleScroll = this.handleScroll.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        document.body.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        return (
            <div className="support-panel">

                {/* Scroll to top */}
                {(this.state.showScrollToTop === true) ? <div className="scroll-to-top" onClick={this.scrollToTop}>
                    <TooltipHost directionalHint={DirectionalHint.topCenter} content="Scroll to Top">
                        <span className="rb-ic rb-ic-arrow-up-frame" style={{ width: "2.5rem", height: "2.5rem" }} />
                    </TooltipHost>
                </div> : null}

            </div>
        );
    }

    handleScroll() {
        this.setState({
            showScrollToTop: document.body.scrollTop !== 0
        });
    }

    scrollToTop() {
        document.body.scrollTop = 0;
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps)(SupportPanel);