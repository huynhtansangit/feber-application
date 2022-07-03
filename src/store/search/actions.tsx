import { ISearchResultsObj, IRefinement, ISearchHandling } from "./types";
import Helper from "../../core/libraries/Helper";

export enum Types {
    SHOW_LOADING = "SHOW_LOADING",
    HIDE_LOADING = "HIDE_LOADING",
    SHOW_ERROR = "SHOW_ERROR",
    SEARCH_NEW_KEYWORD = "SEARCH_NEW_KEYWORD",
    REFINE_RESULTS = "REFINE_RESULTS",
    HANDLE_SEARCH = "HANDLE_SEARCH"
}

export const searchNewKeyWork = (data: ISearchResultsObj | undefined) => {
    return {
        type: Types.SEARCH_NEW_KEYWORD,
        data
    };
}

export const showHideLoading = (status: string) => {
    return {
        type: status
    };
}

export const addRefinements = (refinements: IRefinement[]) => {
    return {
        type: Types.REFINE_RESULTS,
        data: refinements
    };
}

export const handleSearch = (property: string, value: any, hrefSplitter: string, dispatch: any, callback: any = null) => {
    return {
        type: Types.HANDLE_SEARCH,
        data: {
            property: property,
            value: value,
            hrefSplitter: hrefSplitter,
            callback: (href: string) => {
                Helper.runNewTask(() => {
                    dispatch();
                    Helper.runNewTask(() => {
                        callback(href);
                    });
                });
            }
        } as ISearchHandling
    };
}