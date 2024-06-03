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
    requests: '/send_request',
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
            dateEmail: undefined,
            emailPartner: undefined,
            namePartner: undefined,
            idPartner: undefined,
            mailContent: undefined,
        };
        this.setMailDate();
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

    setName = (name) => {
        this.state.namePartner = name
        console.log(name)
    }

    setMailContent = (mailContent) => {
        this.state.mailContent = mailContent
    }

    setMailDate = () => {
        const today = new Date().toISOString()
        const date = today.substring(0, 10) + " " + today.substring(11, 19)
        console.log(date)
        this.state.dateEmail = date
    }

    getIdPartner = async (fields, domain) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const body = {
            "login": this.props.login,
            "password": this.props.pwd,
            "api_key": this.state.api_key,
            "fields": fields,
            "domain": domain,
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };

        const response =
            await fetch(api.baseURL + api.searchPartner + "?model=" + this.state.model, requestOptions)
        const result = await response.text()
        const records = await JSON.parse(result).records
        if (records.length === 0) {
            console.log("no partner found, creation")
            const createFields = ["name", "email"]
            const createValues = {
                "name": this.state.namePartner,
                "email": this.state.emailPartner,
            }
            let res = await this.create(createFields, createValues);
            if (res) {
                return await this.getIdPartner(fields, domain)
            } else {
                return false
            }
        } else {
            this.state.idPartner = records[0].id
            console.log(this.state.idPartner)
            return true
        }
    }

    create = async (fields, values) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const body = {
            "login": this.props.login,
            "password": this.props.pwd,
            "api_key": this.state.api_key,
            "fields": fields,
            "values": values,
        };

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
            redirect: "follow"
        };


        const response =
            await fetch(api.baseURL + api.requests + "?model=" + this.state.model, requestOptions)
        const result = await response.text()
        console.log(result)
        return true
    }
}

async function onMessageSendHandler(event) {
    console.log(event + "ok")
    const requester = new Requester({
        db_name: 'gemba_demoasoi_db',
        login: 'admin',
        pwd: 'admin',
        model: 'res.partner',
        id: 0,
    });
    const item = Office.context.mailbox.item
    let res = await requester.login();
    if (res) {
        await item.to.getAsync(async (result) => {
            requester.setEmail(result.value[0].emailAddress)
            requester.setName(result.value[0].displayName)
            const domain = [
                ["email", "=", requester.state.emailPartner]
            ]
            res = await requester.getIdPartner(["id"], domain)
            if (res) {
                requester.state.model = "gmb.mail.relation"
                await item.body.getAsync(
                    Office.CoercionType.Text,
                    { asyncContext: { currentItem: item } },
                    async (result) =>
                    {
                        requester.setMailContent(result.value) // remove the history and keep only the most recent message
                        const fields = ["date_mail", "destinataire", "body"]
                        const values = {
                            "date_mail": requester.state.dateEmail,
                            "destinataire": requester.state.idPartner,
                            "body": requester.state.mailContent,
                        }
                        res = await requester.create(fields, values)
                        if (res) {
                            console.log("Mail logged")
                        }
                    })
            }
        })
    }
}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}