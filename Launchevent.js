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
            authenticationRequestError: AuthenticationRequestError.None,
            email_partner: undefined,
        }
    }

    login = () => {
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

        fetch("https://demoasoi.gembaware.dev/odoo_connect", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        }
    }

    get_partner = () => {

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

    requester.login();
    let emailAddress;
    await Office.context.mailbox.item.to.getAsync((result) => {emailAddress = result.value[0].emailAddress})
    console.log(emailAddress)


}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}