import * as React from 'react';
import IDMService from '../../../../services/IDMService';
import RbLabel from '../../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonType, ButtonSize } from '../../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../../bosch-react/components/text-field/RbTextField';
import { RootState } from '../../../../store/configureStore';
import { connect } from 'react-redux';

class Search_Refinement_Department extends React.Component<any, any> {
    departmentRef: React.RefObject<any> = React.createRef();
    idmSrv: IDMService = new IDMService();

    constructor(props: any) {
        super(props);
        this.state = {
            departmentText: ""
        };
        this.handleSearch = this.handleSearch.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.setDefaultValues = this.setDefaultValues.bind(this);
    }

    render() {
        return (
            <div className="ms-Grid" style={{ marginBottom: "1.5rem" }}>
                <div className="ms-Grid-row">
                    <RbLabel>Department</RbLabel>
                </div>
                <div className="ms-Grid-row">
                    <RbTextField className="placeholder-text" ref={this.departmentRef} placeholder="Type in department..." value={this.state.departmentText}
                        onChange={(event) => {
                            this.setState({ departmentText: event.currentTarget.value });
                        }}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                            if (event.keyCode === 13) {
                                this.handleSearch();
                            }
                        }} />
                </div>
                <div className="ms-Grid-row" style={{ marginTop: "10px" }}>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Refine" style={{ minWidth: "3rem" }} onClick={this.handleSearch} />
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Clear" style={{ minWidth: "3rem" }} onClick={this.clearSearch} />
                </div>
            </div>
        );
    }

    handleSearch() {
        this.idmSrv.getSubDepartments(this.props.userProfile.userToken, this.state.departmentText).then((results) => {
            this.props.handleSearch("department", JSON.stringify(results));
        });
    }

    clearSearch() {
        this.props.handleSearch("department", "");
        this.setState({
            departmentText: ""
        });
        this.departmentRef.current.setValue("");
    }

    setDefaultValues(value: any) {
        if (value !== "") {
            let departmentArr = JSON.parse(value);
            this.setState({
                departmentText: departmentArr[departmentArr.length - 1]
            });
        }
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
});
export default connect(mapStateToProps, { }, null, { forwardRef: true })(Search_Refinement_Department);