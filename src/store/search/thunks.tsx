import { Dispatch } from "redux";
import SearchService from "../../services/SearchService";
import { searchNewKeyWork, showHideLoading, Types } from "./actions";
import { ISearchResultsObj } from "./types";
import { ISort, SearchResults } from "@pnp/sp/search";

export const getSearchResults = (
    searchText: string = "", // searched text
    status: any = "", // "" --> New Ssearch, "prev" --> previous page, "next" --> next page
    numberOfResults: number, // The number of returned results
    inputSearchCount = "", // The text to display for pagination
    inputSearchTotal: number | string = 0, // The total number of all results
    pageNumber: number = 0, // The number of page to be loaded
    sortList: ISort[], // Conditions of sort
    currentDrawResults: SearchResults | null, // Draw results from previous search (if any)
    callback: any // callback
) => async (dispatch: Dispatch) => {
    dispatch(showHideLoading(Types.SHOW_LOADING));
    try {
        const searchResults: ISearchResultsObj | undefined = await new SearchService().callSearch(
            searchText, status, numberOfResults, inputSearchCount, inputSearchTotal, pageNumber, sortList, currentDrawResults
        );
        searchResults.callback = callback;
        dispatch(searchNewKeyWork(searchResults));
        dispatch(showHideLoading(Types.HIDE_LOADING));
    }
    catch{
        dispatch(showHideLoading(Types.SHOW_ERROR));
    }

};