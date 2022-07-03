import * as React from 'react';
import SystemService from '../../../../services/SystemService';
import Helper from '../../../../core/libraries/Helper';
import { Dropdown, IDropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import RbLabel from '../../../../bosch-react/components/label/RbLabel';
import RbButton, { ButtonSize, ButtonType } from '../../../../bosch-react/components/button/RbButton';
import { ElementType } from 'office-ui-fabric-react';

class Search_Refinement_Division extends React.Component<any, any> {

    systemListsSrv: SystemService = new SystemService();
    //public options: any[] = [];
    constructor(props: any) {
        super(props);
        this.state = {
            IsShown: false,
            Divisions: [],
            SelectedDivision: [],
            isClickToRemove: false      
        };
        //this.handleSearch = this.handleSearch.bind(this);      
        this.onChange  = this.onChange.bind(this);
        this.handleSearch  = this.handleSearch.bind(this); 
        this.clearSearch  = this.clearSearch.bind(this);
    }
    
    componentDidMount() {
        //this.setState({SelectedDivision: [{key: "BSH"},{key: "RBEI"}]});
        this.systemListsSrv.getDivisionsList().then((results: any[]) => {
            results = Helper.sortObjects(results, "DivisionName");
            let rs: any[] = [];
            results.forEach((division) => {
                rs.push({
                    key: division.Title,
                    text: division.DivisionName
                });
            });
            rs.unshift({ key: "All", text: "--- All ---" });
            let updatedObj: any = {
                Divisions: rs
            };

            
            updatedObj["SelectedDivision"] = (this.props.inputDivision !== "") ? this.props.inputDivision.split(",") : ["All"];
            this.setState(updatedObj);
            //console.log(updatedObj)
        });   
    }

    render() {
        const onRenderTitle = (options: IDropdownOption[]): JSX.Element => {
            //const option = options[0];
            let result: JSX.Element[] = [];
            options.forEach(option => {
                // if(option.key === "All"){
                //     result = [];
                //     result.push(<span style={{
                //         backgroundColor: "#fff",
                //         border: "1px solid #000",
                //         borderRadius: "0!important",
                //         padding: ".25rem",
                //         marginRight: "5px",
                //         marginBottom: "5px",
                //         width: "110px",
                //         textAlign: "center"
                //     }}>{option.key}</span>)
                // }
                // else
                // {
                //     result.push(<span style={{
                //         backgroundColor: "#fff",
                //         border: "1px solid #000",
                //         borderRadius: "0!important",
                //         padding: ".25rem",
                //         marginRight: "6px",
                //         marginBottom: "5px",
                //         paddingLeft: "10px",
                //         paddingRight: "10px"
                //     }}>{option.key}</span>)
                // }

                if(option.key === "All"){
                    result = [];
                    result.push(
                        <div style={{marginRight: "5px",
                        marginBottom: "5px",
                        textAlign: "center"}} className="a-chip -btnClose" role="button" aria-labelledby="chip-label-id"
                        onClick = { e =>
                            {
                                if(e.currentTarget.innerText === "All"){
                                    this.setState({
                                        SelectedDivision: []
                                    });
                                }
                            }
                        }>
                            <span id="chip-label-id" className="a-chip__label">{option.key}</span>
                        <div className="a-chip__close"></div>
                        </div>
                    )
                    // result.push(<span style={{
                    //     color: "#fff",
                    //     backgroundColor: "#0078D4",
                    //     border: "1px solid #0078D4",
                    //     borderRadius: "30px",
                    //     padding: ".25rem",
                    //     marginRight: "5px",
                    //     marginBottom: "5px",
                    //     width: "110px",
                    //     textAlign: "center"
                    // }}>{option.key}</span>)
                }
                else
                {
                    result.push(
                        <div style={{marginRight: "5px",
                        marginBottom: "5px",
                        textAlign: "center"}} className="a-chip -btnClose" role="button" aria-labelledby="chip-label-id"
                        onClick = { e =>
                            {
                                let divisions = [];
                                divisions = this.state.SelectedDivision.filter((item: any) => item !== e.currentTarget.innerText)
                                this.setState({
                                    SelectedDivision: divisions,
                                });
                            }
                        }
                        >
                            <span id="chip-label-id" className="a-chip__label">{option.key}</span>
                        <div className="a-chip__close"></div>
                        </div>
                    )
                    // result.push(<span style={{
                    //     color: "#fff",
                    //     backgroundColor: "#0078D4",
                    //     border: "1px solid #0078D4",
                    //     borderRadius: "30px",
                    //     marginRight: "6px",
                    //     marginBottom: "5px",
                    //     paddingLeft: "10px",
                    //     paddingRight: "10px",
                    // }}>{option.key}</span>)
                }
            })
            return (
                <React.Fragment>
                    {result}
                </React.Fragment>
            )
        };

        let element: any[];
        const dropdownStyles: Partial<IDropdownStyles> = {
            title: [
                {flexWrap: "wrap"},
                {display: "flex"},
                {position: "relative"},
                {flexWrap: "wrap"},
                {alignItems: "center"},
                {boxSizing: "border-box"},
                {minHeight: "30px"},
                {minWidth: "180px"},
                {height: "auto !important"},
                {minHeight: "66px !important"}
            ],
            //title: [{display: "table-cell"}, {whiteSpace: "break-spaces"}, {backgroundColor: "white !important"}, {borderBottom: "0px !important"}],
            //dropdown: [{borderBottom: "0px"}],
            label: {height: "auto !important"}
            //dropdown: [{borderRadius: "2px"}]
        }
        const dropdownRef = React.createRef<any>();
        const onSetFocus = () => {
            console.log(dropdownRef)
            dropdownRef.current.state.isOpen = this.state.isClickToRemove;
        }
        return (
            <React.Fragment>
            <div className="ms-Grid" style={{ marginBottom: "1.5rem"}}>
                <div className="ms-Grid-row">
                    <RbLabel>Division</RbLabel>
                    <Dropdown
                        multiSelect = {true}
                        selectedKeys={this.state.SelectedDivision}
                        //placeholder="--- All ---"
                        options={this.state.Divisions}
                        onChange={
                            this.onChange  
                        }
                        styles={dropdownStyles}
                        onRenderTitle = {onRenderTitle}
                        onClick = {event => {
                            onSetFocus()
                        }}
                        componentRef={dropdownRef}
                    />  
                </div>
                <div className="ms-Grid-row" style={{ marginTop: "10px" }}>
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Refine" style={{ minWidth: "3rem" }} onClick={this.handleSearch} />
                    <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Clear" style={{ minWidth: "3rem" }} onClick={this.clearSearch} />
                </div>
            </div>
            </React.Fragment>

            
        );
    }
    onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        let options: any[] = [];
        
        if(item.key === "All") {

          this.setState({
            SelectedDivision:
              item.selected
                ? [item.key]
                : this.state.SelectedDivision.filter((key: string | number) => key !== item.key),
          });
        }
        else{
            if(this.state.SelectedDivision[0] === "All")
            {
                this.setState({
                    SelectedDivision:
                      item.selected
                        ? [item.key as string]
                        : this.state.SelectedDivision.filter((key: string | number) => key !== item.key),
                  });
            }
            else{
            this.setState({
                SelectedDivision:
                  item.selected
                    ? [...this.state.SelectedDivision, item.key as string]
                    : this.state.SelectedDivision.filter((key: string | number) => key !== item.key),
              });
            }
        }
    };
    handleSearch() {
        let options: any[] = [];
        if(this.state.SelectedDivision.length === 1){
            if(this.state.SelectedDivision[0] === "All"){
                this.props.handleSearch("division","");
            }
            else{
                this.props.handleSearch("division", this.state.SelectedDivision[0]);
            }
        }
        else if(this.state.SelectedDivision.length === 0){
            this.props.handleSearch("division","");
        }    
        else{
            for(let i = 0; i < this.state.SelectedDivision.length; i++){
                options.push(this.state.SelectedDivision[i])
            }
            this.props.handleSearch("division", options);
        }
    }

    clearSearch() {
        this.setState({
            SelectedDivision: ["All"]
        });
        this.props.handleSearch("division","");
    }  
}

export default Search_Refinement_Division;