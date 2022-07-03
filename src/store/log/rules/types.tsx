import { IColumn } from "@fluentui/react";

export interface IRule {
    keyword: string,
    filteredData: any[],
    data: any[] | null,
    columns: IColumn[];
}

export interface IRuleList {
    result: any[],
    callbacks: any[]
}