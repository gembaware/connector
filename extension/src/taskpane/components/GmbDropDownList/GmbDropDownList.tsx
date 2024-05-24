import * as React from "react";

import AppContext from '../AppContext';
import {ComboBox, IComboBoxOption} from "office-ui-fabric-react/lib"

export type DropDownListProps = {
    data: string[];
    defaultValue?: string
    onchange: Function
}

export type DropDownListState = {
    selectedValue: IComboBoxOption
    data: IComboBoxOption[]
}

class GmbDropDownList extends React.Component<DropDownListProps, DropDownListState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedValue: this.props.defaultValue ? {key: this.props.defaultValue, text: this.props.defaultValue} : undefined,
            data: this.props.data.map(elt => ({key: elt, text: elt}))
        }
    }

    private onSelectedValueChanges = (_e, selectedItem, _value) => {
        let selectedValue =  selectedItem.text
        this.setState({
            selectedValue: selectedValue
        });
        this.props.onchange(selectedValue);
    }

    render() {

        let dropDownList
        if (this.props.defaultValue && !(this.props.defaultValue in this.props.data)) {
            dropDownList = (
                <div className={'drop-down-list-container'}>
                    <ComboBox
                        options={this.state.data}
                        defaultValue={this.props.defaultValue}
                        onChange={(e, selectedItem, value) =>
                            this.onSelectedValueChanges(e, selectedItem, value)}
                    />
                </div>
            )
        } else {
            dropDownList = (
                <div className={'drop-down-list-container'}>
                    <ComboBox
                        options={this.state.data}
                        onChange={(e, selectedItem, value) =>
                            this.onSelectedValueChanges(e, selectedItem, value)}
                    />
                </div>
            )
        }

        return (
            <div>
                {dropDownList}
            </div>
        )
    }
}

GmbDropDownList.contextType = AppContext;
export default GmbDropDownList;