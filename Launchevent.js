const HttpVerb = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
}

const api = {
    baseURL: 'https://demoasoi.gembaware.dev',

    searchPartner: '/send_get',
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
            authenticationRequestError: AuthenticationRequestError.None,
            emailPartner: undefined,
            idPartner: undefined,
        }
    }

    login = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const body = {
            "db": this.props.db_name,
            "login": this.props.login,
            "password": this.props.pwd
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };

        const response = await fetch(api.baseURL + api.auth, requestOptions)
        const result = await response.text()
        console.log(result)
        this.state.api_key = await JSON.parse(result).api_key
        console.log(this.state.api_key)
        return true
    }

    setEmail = (email) => {
        this.state.emailPartner = email
        console.log(email)
    }

    getIdPartner = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const body = {
            "login": this.props.login,
            "password": this.props.pwd,
            "api_key": this.state.api_key,
            "fields": ["id"],
            "domain": [
                ["email", "=", this.state.emailPartner]
            ]
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };

        const response = await fetch(api.baseURL + api.searchPartner + "?model=res.partner", requestOptions)
        const result = await response.text()
        console.log(result)
        return true
    }

    // createPartner = async () => {
    // }

}

async function onMessageSendHandler(event) {
    console.log(event + "ok")
    const requester = new Requester({
        db_name: 'gemba_demoasoi_db',
        login: 'admin',
        pwd: 'admin',
        model: '',
        id: 0,
        fields: [],
        domain: [],
        values: {},
    });

    const res = await requester.login();
    if (res) {
        await Office.context.mailbox.item.to.getAsync((result) => {
            requester.setEmail(result.value[0].emailAddress)
            requester.getIdPartner()
        })
    }


}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}