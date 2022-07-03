import * as React from 'react';
import { IDetailsListProps, IColumn } from '@fluentui/react/lib/DetailsList';
import SystemService from '../../../services/SystemService';
import Constants from '../../../core/libraries/Constants';
import Table from '../../../core/components/Table';
import ListActionsMenu from '../../../core/common/ListActionsMenu';
import { IUserProfile } from '../../../store/permission/types';
import { confirmDialog, showDialog, showToastMessage } from '../../../store/util/actions';
import { connect } from 'react-redux';
import { RootState } from '../../../store/configureStore';
import { getBookmarks } from '../../../store/system/thunks';
import { searchText, changeMode, init } from '../../../store/system/actions';
import Helper from '../../../core/libraries/Helper';
import RbLabel, { LabelSize } from '../../../bosch-react/components/label/RbLabel';

interface MyBookmarksProps {
    userProfile: IUserProfile | undefined,
    isAdminMode: boolean,
    items: any[],
    columns: IColumn[],
    confirmDialog: typeof confirmDialog,
    showDialog: typeof showDialog,
    showToastMessage: typeof showToastMessage,
    init: typeof init,
    changeMode: typeof changeMode,
    searchText: typeof searchText,
    getBookmarks: any,
}

class MyBookmarks extends React.Component<MyBookmarksProps, any> {

    systemListsSrv: SystemService = new SystemService();

    constructor(props: MyBookmarksProps) {
        super(props);
        this.getUserBookmarks = this.getUserBookmarks.bind(this);
        this.openRemoveBookmarkDialog = this.openRemoveBookmarkDialog.bind(this);
        this.removeBookmark = this.removeBookmark.bind(this);
    }

    componentDidMount() {
        this.props.init();
        Helper.runNewTask(() => {
            this.getUserBookmarks();
        });
    }

    render() {
        let detailsListProps: IDetailsListProps = {
            items: this.props.items,
            columns: this.props.columns,
            onShouldVirtualize: () => { return true; }
        };
        let element = (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm1" />
                    <div className="ms-Grid-col ms-sm10">
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <RbLabel className="header-title" size={LabelSize.Large}> Bookmarks</RbLabel>
                                <ListActionsMenu
                                    columns={detailsListProps.columns}
                                    items={detailsListProps.items}
                                    searchText={(value: any) => { this.props.searchText(value); }}
                                    showAdminResults={this.props.isAdminMode}
                                    getData={() => {
                                        this.props.changeMode();
                                        Helper.runNewTask(() => {
                                            this.getUserBookmarks();
                                        });
                                    }}></ListActionsMenu>
                            </div>
                                <Table detailsListProps={detailsListProps}></Table>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm1" />
                </div>
            </div>
        );
        return element;
    }

    getUserBookmarks() {
        this.props.showDialog(Constants.DIALOG_MESSAGE.RETRIEVE_BOOKMARKS);
        let userId = (this.props.isAdminMode === true) ? null : this.props.userProfile?.id;
        this.props.getBookmarks(userId, [this.removeBookmark, () => {
            this.props.showDialog(false);
        }]);
    }

    openRemoveBookmarkDialog(item: any) {
        this.props.confirmDialog(
            Constants.CONFIRMATION_MESSAGE.REMOVE_BOOKMARK.TITLE,
            Constants.CONFIRMATION_MESSAGE.REMOVE_BOOKMARK.CONTENT.replace("{0}", item.Title), false,
            () => {
                this.removeBookmark(item);
            }
        );
    }

    removeBookmark(item: any) {
        this.props.showDialog(Constants.DIALOG_MESSAGE.REMOVE_BOOKMARK);
        this.systemListsSrv.removeBookmark(item.Id).then((result: any) => {
            if (result === true) {
                this.getUserBookmarks();
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.SUCCESS,
                    Constants.BOOKMARK_MESSAGE.REMOVE.SUCCESS.replace("{0}", item.Title)
                );
            }
            else {
                this.props.showToastMessage(
                    Constants.TOAST_MESSAGE_CODE.ERROR,
                    Constants.BOOKMARK_MESSAGE.REMOVE.FAILED.replace("{0}", item.Title)
                );
            }
            this.props.showDialog(false);
        }).catch(() => {
            this.props.showToastMessage(
                Constants.TOAST_MESSAGE_CODE.ERROR,
                Constants.BOOKMARK_MESSAGE.REMOVE.FAILED.replace("{0}", item.Title)
            );
            this.props.showDialog(false);
        });
    }

}

const mapStateToProps = (state: RootState) => ({
    userProfile: state.permission.userProfile,
    isAdminMode: state.system.isAdminMode,
    items: state.system.filteredData,
    columns: state.system.columns
});

export default connect(mapStateToProps, {
    confirmDialog,
    showDialog,
    showToastMessage,
    init,
    changeMode,
    searchText,
    getBookmarks,
})(MyBookmarks);