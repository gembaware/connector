import * as React from "react";
import {HttpVerb} from "../utils/httpRequest";
import {api} from './api.js'

type DomainElt = {
    elt: string | number | Array<DomainElt>
}

export type Domain = {
    domain: DomainElt
}

enum AuthenticationRequestError {
    None,
    InvalidScheme,
    AuthenticationCodeExpired,
}

type RequesterState = {
    model: string
    id: number
    api_key: string
    authenticationRequestError: AuthenticationRequestError
}

type RequesterProps = {
    db_name: string
    login: string
    pwd: string
    model: string
    id: number
    fields: Array<string>
    domain: Domain
    values: Object
}

class Requester extends React.Component<RequesterProps, RequesterState> {
    constructor(props) {
        super(props);
        this.state = {
            model: props.model,
            id: props.id,
            api_key: undefined,
            authenticationRequestError: AuthenticationRequestError.None
        }
    }

    login = () => {
        const requestOptions = {
            method: HttpVerb.GET,
            headers: {
                'db': this.props.db_name,
                'login': this.props.login,
                'password': this.props.pwd
            }
        }

        fetch(api.baseURL + api.auth, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data.data)
                this.setState({
                    api_key: data.data['api-key']
                })
            })
            .catch(error => {
                this.setState({
                    authenticationRequestError: AuthenticationRequestError.InvalidScheme,
                });
                console.log(error)
            })
    }
}



async function onMessageSendHandler(event) {
    console.log(event + "ok")
    new Requester({
        db_name: 'gemba_demoasoi_db',
        login: 'admin',
        pwd: 'admin',
        model: '',
        id: 0,
        fields: [],
        domain: [],
        values: {},
    }).login();
}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}