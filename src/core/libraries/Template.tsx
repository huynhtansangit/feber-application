import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import Color from './Color';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import _ from 'lodash';
import RbLabel, { LabelSize } from '../../bosch-react/components/label/RbLabel';
import RbTag from '../../bosch-react/components/tag/RbTag';
class Template {

    static renderCommonTemplate(label: any, field: any, isOptional: boolean = false, labelWidth: number = 2, fieldWidth: number = 10, parentWidth: number = 12) {
        return (
            <div className={"ms-Grid-col ms-sm" + parentWidth}>
                <div className="ms-Grid">
                    <div className="ms-Grid-row common-padding-row">
                        <div className={"ms-Grid-col ms-sm" + labelWidth} style={{ verticalAlign: "top" }}>
                            <RbLabel hasPadding={true}>{label}{isOptional === true ? " (Optional)" : ""}</RbLabel>
                        </div>
                        <div className={"ms-Grid-col ms-sm" + fieldWidth}>
                            {field}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    static renderUploadTemplate(label: string, isRequired: boolean, labelMoreInformation: string = "", field: any, tooltipMessage: any = "", moreInformation: any = "") {
        return (
            <div>
                <div className="ms-Grid-row common-padding-row">
                    <div className="ms-Grid-col ms-sm3"><RbLabel hasPadding={true}>{label}{(isRequired === false) ? <span> (Optional)</span> : ""}{labelMoreInformation}</RbLabel></div>
                    <div className="ms-Grid-col ms-sm5">
                        {field}
                    </div>
                    {(tooltipMessage !== "") ? <div className="ms-Grid-col ms-sm4 upload-tooltip">
                        <div className="ms-Grid-col ms-sm1 upload-icon-tooltip"><Icon iconName="AlertSolid" /></div>
                        <div className="ms-Grid-col ms-sm3 upload-message-tooltip"><RbLabel>{tooltipMessage}</RbLabel></div>
                    </div> : ""}
                </div>
                {(moreInformation !== "") ?
                    <div className="ms-Grid-row common-padding-row">
                        <div className="ms-Grid-col ms-sm3" />
                        <div className="ms-Grid-col ms-sm5"><RbLabel style={{ color: Color.GREY }}>{moreInformation}</RbLabel></div>
                    </div> : ""}
            </div>
        );
    }

    static renderAccessMediatorRowTemplate(mode: string, label: string, viewField: any, editField: any, errorTxt: string = "", isOptional: boolean = false, customizedOptionalText: string = "",
        labelWidth: number = 4, fieldWidth: number = 8) {
        let field: any = (mode === "Edit") ? <React.Fragment>
            {editField}
            {!!errorTxt ? <RbLabel className="error-txt" size={LabelSize.Small} isInline={false} hasPadding={true}> {errorTxt}</RbLabel> : null}
        </React.Fragment> : viewField;
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row common-padding-row">
                    {/* Label */}
                    <div className={"ms-Grid-col ms-sm" + labelWidth}>
                        <RbLabel hasPadding={true}>{label}</RbLabel>
                        {(isOptional === true) ? <React.Fragment>
                            <RbLabel size={LabelSize.Small}>{(customizedOptionalText === "") ? "(Optional)" : customizedOptionalText}</RbLabel>
                        </React.Fragment> : null}
                    </div>
                    {/* Field */}
                    <div className={"ms-Grid-col ms-sm" + fieldWidth}>
                        {field}
                    </div>
                </div>



            </div>
        );
    }

    static renderReadOnlyPeoplePickerValues(text: string) {
        if (!_.isNil(text) && text !== "") {
            if (text.indexOf(";") > -1) {
                let authorsArray = text.split(";");
                return (
                    <Stack tokens={{ childrenGap: 5 }}>
                        {authorsArray.map((author: string) => <Persona text={author} size={PersonaSize.size24} key={author} />)}
                    </Stack>
                );
            }
            else {
                return (<Persona text={text} size={PersonaSize.size24} />);
            }
        }
        else {
            return "";
        }
    }

    static renderReadOnlyPeoplePickerTags(text: string) {
        if (!_.isNil(text) && text !== "") {
            if (text.indexOf(";") > -1) {
                let authorsArray = text.split(";");
                return (
                    <Stack tokens={{ childrenGap: 5 }}>
                        {authorsArray.map((author: string) => <RbTag>{author}</RbTag>)}
                    </Stack>
                );
            }
            else {
                return (<RbTag>{text}</RbTag>);
            }
        }
        else {
            return "";
        }
    }


    static renderUploadTypeInfoRowTemplate(hoverstate: boolean, currenticon: string, entervar: any, closevar: any, iconid: string, field: any) { // show ,close info in Upload Choose
        return (
            <div className="ms-Grid upload-type-info">
                <div className="ms-Grid-row block-info">

                    <div className="select-info-icon">
                        <span className="rb-ic rb-ic-info-i-frame" onMouseEnter={entervar} id={iconid} />
                    </div>

                    {(hoverstate && (currenticon === iconid)) ?
                        <React.Fragment>
                            <div className="text-info">
                                <RbLabel size={LabelSize.Small}>{field}</RbLabel>
                                <div className="closed-info-icon" onClick={closevar}>
                                    <span className="rb-ic rb-ic-close" />
                                </div>
                            </div>

                        </React.Fragment>
                        : null}
                </div>
            </div>
        );

    }

    static renderUploadRowTemplate(label: string, field: any, info: string, smalltxt: string = null, infobox: boolean = true, errortxt: string = null, hasSmallTxt: boolean = true) {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm2" style={{ marginTop: "1rem" }}>
                        <RbLabel isInline={true} hasPadding={true}>{label}</RbLabel>
                        {hasSmallTxt ? <RbLabel isInline={true} size={LabelSize.Small}> &nbsp;{smalltxt}</RbLabel> : null}                        
                    </div>
                    <div className="ms-Grid-col ms-sm5" style={{ padding: "1rem 0px" }}>
                        <div className="ms-Grid">
                            <div className={"ms-Grid-row " + (!!errortxt ? "error-field" : "")}>
                                {field}
                            </div>

                        </div>
                        {!!errortxt ? <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <RbLabel className="error-txt" size={LabelSize.Small} isInline={true} hasPadding={true}> {errortxt}</RbLabel>
                            </div>

                        </div> : null}



                    </div>
                    <div className="ms-Grid-col ms-sm5">
                        {infobox ? <div className="upload-info-icon">
                            <span className="rb-ic rb-ic-info-i-frame" />
                        </div> : null}

                        <div className="upload-info">
                            <RbLabel size={LabelSize.Small}>{info}</RbLabel>
                        </div>



                    </div>

                </div>
            </div>
        );
    }

    static renderUploadSummaryTemplate(label: string, field: any, smalltxt: string = null) {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm4" style={{ marginTop: "1rem" }}> <RbLabel isInline={true} style={{ fontWeight: "bold" }}>{label}</RbLabel> <RbLabel isInline={true} size={LabelSize.Small}>{smalltxt}</RbLabel> </div>
                    <div className="ms-Grid-col ms-sm8" style={{ padding: "1rem 0px" }}> {field} </div>


                </div>
            </div>
        );
    }

    static renderNote(note: string) {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm2">  </div>
                    <div className="ms-Grid-col ms-sm5"> <RbLabel isInline={true} size={LabelSize.Small} style={{ color: "#767676" }}> {note} </RbLabel>  </div>
                    <div className="ms-Grid-col ms-sm5">  </div>

                </div>
            </div>
        );
    }

    
    static renderCoordinatorNote(note: string) {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm2">  </div>
                    <div className="ms-Grid-col ms-sm5" style={{marginTop: "-30px"}}> <RbLabel isInline={true} size={LabelSize.Small} style={{ color: "#767676" }}> {note} </RbLabel>  </div>
                    <div className="ms-Grid-col ms-sm5">  </div>

                </div>
            </div>
        );
    }

    static renderNoteCustom(note: string) {
        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">

                    <div className="ms-Grid-col ms-sm2">  </div>
                    <div className="ms-Grid-col ms-sm5" style={{marginTop: "-15px"}}> <RbLabel isInline={true} size={LabelSize.Small} style={{ color: "#767676" }}> {note} </RbLabel>  </div>
                    <div className="ms-Grid-col ms-sm5">  </div>

                </div>
            </div>
        );
    }
}

export default Template;