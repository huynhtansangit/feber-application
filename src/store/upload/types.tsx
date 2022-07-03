export interface IUpload{
    steps: IStep[],
    commonReport: any,
    mode: string,
    validation:any,
    RnDReportTypes:any[],
    ThesisReportTypes:any[],
    PaperReportTypes:any[],
    rouLists: IResponibleDepartment[],
    changedAuthor?: boolean,
    //checkBoxChecked?: any
    GroupManagerList: IResponibleDepartment[]
}

export interface IResponibleDepartment {
    Division?: string,
    Department?: string,
    ROU?: { Id: number, Title: string }
}

export interface IStep {

      label: string,
      icon: string,
      valid?: boolean,
      isSelected?: boolean

}


//Mode?