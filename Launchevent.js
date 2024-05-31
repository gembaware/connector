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
            emailPartner: undefined,
            namePartner: undefined,
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

    setName = (name) => {
        this.state.namePartner = name
        console.log(name)
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

        const response = await fetch(api.baseURL + api.searchPartner + "?model=" + this.props.model, requestOptions)
        const result = await response.text()
        const records = await JSON.parse(result).records
        if (records.length === 0) { // TODO tester
            console.log("no partner found")
            alert("No partner found, creation")
            let res = await this.createPartner();
            if (res) {
                return await this.getIdPartner()
            } else {
                return false
            }
        } else {
            this.state.idPartner = records[0].id
            console.log(this.state.idPartner)
            return true
        }
    }

    createPartner = async (fields, values) => {
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
          body: body,
          redirect: "follow"
        };

        const response = await fetch(api.baseURL + api.requests + "?model=" + this.props.model, requestOptions)
        const result = response.text()
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

    let res = await requester.login();
    if (res) {
        await Office.context.mailbox.item.to.getAsync(async (result) => {
            requester.setEmail(result.value[0].emailAddress)
            requester.setName(result.value[0].displayName)
            const domain = [
                ["email", "=", requester.state.emailPartner]
            ]
            res = await requester.getIdPartner(["id"], domain)
            if (res) {
                // TODO Descendre le mail
            }
        })
    }


}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}