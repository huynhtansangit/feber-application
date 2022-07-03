import { IColumn } from "@fluentui/react";

export interface ISystem {
    isAdminMode: boolean,
    keyword: string,
    filteredData: any[],
    data: any[] | null,
    columns: IColumn[],
    exportMode: string
}

export interface ISystemList {
    result: any[],
    callbacks: any[]
}