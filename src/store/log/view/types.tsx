import { IColumn } from "@fluentui/react";

export interface ILog {
    log: ILogTable,
    rule: IRuleTable
}

export interface ILogTable {
    type: string,
    file: string,
    files: any[],
    mode: string
    keyword: string,
    filteredData: any[],
    data: any[] | null,
    columns: IColumn[];
}

export interface IRuleTable {
    keyword: string,
    filteredData: any[],
    data: any[] | null,
    columns: IColumn[];
}

export interface ILogFilter {
    name: string,
    value: any
}

export interface ILogRow {
    Type: string,
    DateTime: string,
    Details: string,
    Error: string
}