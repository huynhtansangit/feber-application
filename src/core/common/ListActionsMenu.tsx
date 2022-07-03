import * as React from 'react';
import Constants from '../libraries/Constants';
import ExcelService from '../../services/ExcelService';
import Environment from '../../Environment';
import { connect } from 'react-redux';
import { RootState } from '../../store/configureStore';
import { IUserProfile } from '../../store/permission/types';
import { showDialog, showToastMessage } from '../../store/util/actions';
import RbButton, { ButtonSize, ButtonType } from '../../bosch-react/components/button/RbButton';
import RbSearchField from '../../bosch-react/components/search-field/RbSearchField';
import RbLabel from '../../bosch-react/components/label/RbLabel';

interface ListActionsMenuProps {
    userProfile: IUserProfile | undefined,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    showAdminResults: any,
    getData: any,
    searchText: any,
    items: any[],
    columns: any[]
}

class ListActionsMenu extends React.Component<ListActionsMenuProps, any> {

    excelSrv: ExcelService = new ExcelService(Environment.rootWeb);

    constructor(props: ListActionsMenuProps) {
        super(props);
        this.exportToExcel = this.exportToExcel.bind(this);
    }

    render() {
        let menu: any;
        if (this.props.userProfile?.permissions?.checkHasPermission([Constants.PERMISSIONS.SUPER_ADMIN])) {

            menu = <div className="right-menu-button">
                <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label="Export To Excel" style={{ minWidth: "3rem" }} onClick={this.exportToExcel} />
                <RbButton type={ButtonType.Secondary} size={ButtonSize.Tiny} label={(this.props.showAdminResults === false) ? 'Show Admin Mode' : 'Show User Mode'} style={{ minWidth: "3rem" }} onClick={this.props.getData} />

            </div>;
        }
        let element =
            <React.Fragment>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm1 total-list-action-menu">
                            <RbLabel hasPadding={true}> Total: {this.props.items.length} </RbLabel>
                        </div>
                        <div className="ms-Grid-col ms-sm4">
                            <RbSearchField placeholder="Search..." onChange={(event) => this.props.searchText(event.currentTarget.value)} />
                        </div>
                        <div className="ms-Grid-col ms-sm7">
                            {menu}
                        </div>

                    </div>

                </div>
            </React.Fragment>
        return element;
    }

    exportToExcel() {

        //Replace Author with FeberAuthorDisplayName if it empty
        this.props.items.forEach((item: any) => {
            if(item.Authors === '') {
                item.Authors = item.FeberAuthorDisplayName
            }
        })

        this.props.showDialog(Constants.DIALOG_MESSAGE.EXPORT_RESULT);
        this.excelSrv.exportSystemListData(this.props.columns, this.props.items).then(() => {
            this.props.showToastMessage(Constants.TOAST_MESSAGE_CODE.SUCCESS, "The report" + Constants.POSTFIX_MESSAGE.EXPORT.SUCCESS);
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(Constants.TOAST_MESSAGE_CODE.ERROR, "The report" + Constants.POSTFIX_MESSAGE.EXPORT.FAILED);
            this.props.showDialog(false);
        });
    }
}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile
});

export default connect(mapStateToProps, { showDialog, showToastMessage })(ListActionsMenu);