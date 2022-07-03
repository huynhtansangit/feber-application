export interface ISearch {
    isLoading: boolean | null,
    searchResultsObj: ISearchResultsObj | undefined,
    refinements: IRefinements
}

export interface ISearchResultsObj {
    results: any[];
    count: string;
    total: number;
    pageNumber: number;
    sortList: any[];
    drawResults: any;
    callback?: any;
}

export interface ISearchHandling {
    property: string,
    value: any,
    hrefSplitter: string,
    callback?: any
}

export interface IRefinements {
    keyword: string,
    division: string,
    reportDate: string,
    approvedDate: string
    reportType: string,
    author: string,
    department: string,
    sortList: any[],
    numberOfResults: number,
    pageNumber: number
}

export interface IRefinement {
    name: string,
    value: any
}