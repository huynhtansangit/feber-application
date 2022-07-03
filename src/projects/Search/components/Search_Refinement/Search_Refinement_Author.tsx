import * as React from 'react';
import RbLabel from '../../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonType, ButtonSize } from '../../../../bosch-react/components/button/RbButton';
import RbTextField from '../../../../bosch-react/components/text-field/RbTextField';

class Search_Refinement_Author extends React.Component<any, any> {
    authorsRef: React.RefObject<any> = React.createRef();

    constructor(props: any) {
        super(props);
        this.state = {
            authorText: ""
        };
        this.handleSearch = this.handleSearch.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.setDefaultValues = this.setDefaultValues.bind(this);
    }

    render() {
        return (
            <div className="ms-Grid" style={{ marginBottom: "1.5rem" }}>
                <div className="ms-Grid-row">
                    <RbLabel>Author</RbLabel>
                </div>
                <div className="ms-Grid-row">
                    <RbTextField className="placeholder-text" ref={this.authorsRef} placeholder="Type in author..." value={this.state.authorText}
                        onChange={(event) => {
                            this.setState({ authorText: event.currentTarget.value });
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
        if (this.state.authorText.trim() !== "") {
            this.props.handleSearch("author", this.state.authorText.trim());
        }
    }

    clearSearch() {
        this.props.handleSearch("author", "");
        this.setState({
            authorText: ""
        });
        this.authorsRef.current.setValue("");
    }

    setDefaultValues(value: any) {
        this.setState({
            authorText: value
        });
    }

}

export default Search_Refinement_Author;