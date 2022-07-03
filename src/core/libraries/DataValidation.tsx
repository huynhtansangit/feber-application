import _ from "lodash";

/* eslint no-useless-escape: 0 */
class DataValidation {

    static validationMessageTemplate = {
        Empty: "",
        Text: {
            Required: "Please fill in the {0}.",
            Min: "The minimum number of characters in this field is {0}.",
            Max: "The maximum number of characters in this field is {0}."
        },
        Dropdown: {
            Required: "Please choose the {0}."
        },
        Link: {
            Required: "Please fill in the {0}.",
            Format: "Please fill in a valid link."
        }
    };

    static textValidation(value: string, fieldName: string, isRequired: boolean = false, min: number | null = null, max: number | null = null) {
        let rs = this.validationMessageTemplate.Empty;
        if (isRequired === true) {
            if (value.length === 0) {
                rs = this.validationMessageTemplate.Text.Required.replace("{0}", fieldName.toLocaleLowerCase());
            }
            else {
                if (!_.isNil(min)) {
                    if (value.length < min) {
                        rs = this.validationMessageTemplate.Text.Min.replace("{0}", min.toString());
                    }
                }
                if (!_.isNil(max)) {
                    if (value.length > max) {
                        rs = this.validationMessageTemplate.Text.Max.replace("{0}", max.toString());
                    }
                }
            }
        }
        else {
            if (!_.isNil(min)) {
                if (value.length < min) {
                    rs = this.validationMessageTemplate.Text.Min.replace("{0}", min.toString());
                }
            }
            if (!_.isNil(max)) {
                if (value.length > max) {
                    rs = this.validationMessageTemplate.Text.Max.replace("{0}", max.toString());
                }
            }
        }
        return rs;
    }

    static dropdownValidation(value: any, fieldName: string, isRequired: boolean = false) {
        let rs = this.validationMessageTemplate.Empty;
        if (isRequired === true) {
            if (_.isNil(value) || value.length === 0) {
                rs = this.validationMessageTemplate.Dropdown.Required.replace("{0}", fieldName.toLocaleLowerCase());
            }
        }
        return rs;
    }

    static linkValidation(value: string, fieldName: string, isRequired: boolean = false) {
        let rs = this.validationMessageTemplate.Empty;
        let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (value.trim() === "") {
            rs = ((isRequired === true) ? this.validationMessageTemplate.Link.Required.replace("{0}", fieldName) : "");
        }
        else {
            rs = ((regexp.test(value)) ? "" : this.validationMessageTemplate.Link.Format);
        }
        return rs;
    }

}

export default DataValidation;