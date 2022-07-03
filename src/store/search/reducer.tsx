import { ISearch, ISearchResultsObj, IRefinements, IRefinement, ISearchHandling } from "./types";
import { Types } from "./actions";
import Helper from "../../core/libraries/Helper";
import _ from "lodash";

const initialState: ISearch = {
    isLoading: true,
    searchResultsObj: {
        results: [],
        count: "",
        total: 0,
        pageNumber: 1,
        sortList: [],
        drawResults: {}
    } as ISearchResultsObj,
    refinements: {
        keyword: "*",
        division: "",
        reportDate: "",
        approvedDate: "",
        reportType: "",
        author: "",
        department: "",
        sortList: [],
        numberOfResults: 10,
        pageNumber: 1
    } as IRefinements
};

type dataType = ISearchResultsObj | ISearchHandling | IRefinements | IRefinement[] | undefined;

export const SearchReducer = (state: ISearch = initialState, action: { type: string, data: dataType }) => {

    switch (action.type) {

        // ------------------------------ SEARCH ------------------------------
        case Types.SEARCH_NEW_KEYWORD: {
            let results: ISearch = Object.assign({}, state);
            if (typeof action.data === "undefined") {
                results.searchResultsObj = undefined;
            }
            else {
                results.searchResultsObj = action.data as ISearchResultsObj;
            }
            Helper.runNewTask(() => {
                if (!_.isUndefined(results.searchResultsObj.callback)) {
                    results.searchResultsObj.callback();
                }
            });
            return results;
        }
        case Types.SHOW_LOADING:
        case Types.HIDE_LOADING: {
            let results: ISearch = Object.assign({}, state);
            if ((action.type as string) !== Types.SHOW_ERROR) {
                results.isLoading = action.type === Types.SHOW_LOADING;
            }
            else {
                results.isLoading = null;
            }
            return results;
        }

        // ------------------------------ REFINE ------------------------------
        case Types.HANDLE_SEARCH: {
            let results: ISearch = Object.assign({}, state);
            let { property, value, hrefSplitter, callback } = action.data as ISearchHandling;
            let href = hrefSplitter + window.location.href.split(hrefSplitter)[1];
            if (value !== "") {

                let array = href.split("&");
                array.forEach(item => {
                    if (item.indexOf(property + "=") > -1) {
                        href = href.replace("&" + item, "");
                    }
                });
                href += "&" + property + "=" + encodeURIComponent(value);
            }
            else {
                let array = href.split("&");
                array.forEach(item => {
                    if (item.indexOf(property + "=") > -1) {
                        href = href.replace("&" + item, "");
                    }
                });
            }
            if (!_.isNil(callback)) {
                callback(href);
            }
            return results;
        }
        case Types.REFINE_RESULTS: {
            let results: ISearch = Object.assign({}, state);
            let refinements: IRefinement[] = action.data as IRefinement[];
            for (let key in results.refinements) {
                refinements.forEach((refinement: IRefinement) => {
                    if (key.toLowerCase() === refinement.name.toLowerCase()) {
                        (results.refinements as any)[key] = refinement.value;
                    }
                });
            }
            if (!_.isUndefined(results.searchResultsObj)) {
                results.searchResultsObj.sortList = results.refinements.sortList as any[];
            }

            //console.log(results)
            return results;
        }

    }
    return state;
};