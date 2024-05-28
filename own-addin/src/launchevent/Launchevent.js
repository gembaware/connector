const HttpVerb = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
}

const api = {
    baseURL: 'https://demoasoi.gembaware.dev',

    searchPartner: '/mail_plugin/partner/search',
    createPartner: '/mail_plugin/partner/create',
    logMail: '/mail_plugin/log_mail_content',

    auth: '/odoo_connect',
}

const AuthenticationRequestError = {
    None: 'None',
    InvalidScheme: 'InvalidScheme',
    AuthenticationCodeExpired: 'AuthenticationCodeExpired',
}

// type RequesterState = {
//     model: string
//     id: number
//     api_key: string
//     authenticationRequestError: string
// }
//
// type RequesterProps = {
//     db_name: string
//     login: string
//     pwd: string
//     model: string
//     id: number
//     fields: Array<string>
//     domain: any
//     values: Object
// }

class Requester {
    state
    props
    constructor(props) {
        this.props = props
        this.state = {
            model: props.model,
            id: props.id,
            api_key: undefined,
            authenticationRequestError: AuthenticationRequestError.None
        }
    }

    login = () => {
        const headers = new Headers();
        headers.append("db", this.props.db_name);
        headers.append("login", this.props.login);
        headers.append("password", this.props.pwd);

        const requestOptions = {
            method: HttpVerb.GET,
            headers: headers,
            redirect: "follow",
        }

        fetch(api.baseURL + api.auth, requestOptions)
            .then(response => {
                console.log(response);
                return response.json()
            })
            .then(data => {
                console.log(data.data);
                this.state.api_key = data.data['api-key'];
            })
            .catch(error => {
                this.state.authenticationRequestError = AuthenticationRequestError.InvalidScheme;
                console.log(error);
            });
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