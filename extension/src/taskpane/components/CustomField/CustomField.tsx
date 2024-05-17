import * as React from 'react';
import AppContext from '../AppContext';
import {TextField} from "office-ui-fabric-react/lib-amd";
import "./CustomField.css"

export type FieldProps = {
    value?: string,
    onchange: any,
}

export type FieldState = {
    value: string,
}

class CustomField extends React.Component<FieldProps, FieldState> {
    constructor(props, context) {
        super(props, context);
        let value = props.value
        this.state = {
            value: value || '',
        };
    }

    private onValueChange = (event) => {
        let value = event.target.value
        this.setState({
            value: value,
        });
        this.props.onchange(value);
    }
    // private createElementRequest = (additionnalValues?) => {
    //     Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, async (result) => {
    //         const message = result.value.split('<div id="x_appendonsend"></div>')[0];
    //         const subject = Office.context.mailbox.item.subject;
    //
    //         const requestJSON = Object.assign(
    //             {
    //                 partner_id: this.props.partner.id,
    //                 email_body: message,
    //                 email_subject: subject
    //             },
    //             additionnalValues || {}
    //         )
    //
    //         let response = null;
    //         try {
    //             response = await sendHttpRequest(
    //                 HttpVerb.POST,
    //                 api.baseURL + this.state.apiEndPoint,
    //                 ContentType.Json,
    //                 this.context.getConnectionToken(),
    //                 requestJSON,
    //                 true
    //             ).promise;
    //         } catch (error) {
    //             this.context.showHttpErrorMessage(error);
    //             return;
    //         }
    //
    //         const cids = this.context.getUserCompaniesString();
    //         const parsed = JSON.parse(response);
    //         const recordId = parsed.result[this.state.idName]
    //         const url = `${api.baseURL}/web#action=${this.state.odooRedirectAction}&id=${recordId}&model=${this.state.queriedModel}&view_type=form${cids}`;
    //         window.open(url)
    //     });
    // }

    private onKeyDown = (event) => {
        if (event.key == "Enter") {
            console.log(this.state.value);
        }
    };

    render() {
        const customField = (
            <div className="custom-field-container">
                <TextField
                    className="input-search"
                    placeholder={"Value..."}
                    onChange={this.onValueChange}
                    onKeyDown={this.onKeyDown}
                    value={this.state.value}
                    onFocus={(e) => e.target.select}
                    autoFocus
                />
            </div>
        )

        return (
            <div>
                {customField}
            </div>
        )
    }
}

CustomField.contextType = AppContext;
export default CustomField;


