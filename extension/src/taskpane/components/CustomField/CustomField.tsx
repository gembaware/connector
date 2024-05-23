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


