const HttpVerb = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
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
            "db": "gemba_demoasoi_db",
            "login": "admin",
            "password": "admin"
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

    getEmailPartner = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${this.state.api_key}`);

        const body = {
            "email": this.state.emailPartner
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };

        const response = await fetch(api.baseURL + api.getPartner, requestOptions)
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
            requester.getEmailPartner()
        })
    }


}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}