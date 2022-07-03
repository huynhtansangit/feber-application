export enum Types {
    INITIALIZE = "INITIALIZE",
    SEARCH_TEXT = "SEARCH_TEXT",
    SET_RULES = "SET_RULES",
};

export const init = () => {
    return {
        type: Types.INITIALIZE
    };
}

export const searchText = (text: string) => {
    return {
        type: Types.SEARCH_TEXT,
        data: text.trim()
    };
};

export const setRules = (data: any[], callbacks: any[]) => {
    return {
        type: Types.SET_RULES,
        data: {
            result: data,
            callbacks
        }
    };
};