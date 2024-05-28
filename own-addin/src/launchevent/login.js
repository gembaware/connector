import {api} from './api'
import {HttpVerb, sendHttpRequest, ContentType} from '../utils/httpRequest'

enum AuthenticationRequestError {
    None,
    DatabaseNotReachable,
    PermissionRefused,
    AuthenticationCodeExpired,
}

async function _isOdooDatabaseReachable() {
    const request = sendHttpRequest(
        HttpVerb.POST,
        api.baseURL + api.getAccessToken,
        ContentType.Json,
        null,
        {},
        true,
    );

    try {
        await request.promise;
        console.log('2');
        return true;
    } catch {
        return false;
    }
}

/**
 * Open a dialog and ask the permission on the Odoo side.
 *
 * Return null if the user refused the permission and return the authentication
 * code if the user accepted the permission.
 */
async function _openOdooLoginDialog() {
    const options = {
        height: 65,
        width: 30,
        promptBeforeOpen: true,
    };

    const redirectToAddin = encodeURIComponent(api.addInBaseURL + '/loader.html');
    const redirectToAuthPage = encodeURIComponent(
        api.authCodePage +
            '?scope=' +
            api.outlookScope +
            '&friendlyname=' +
            api.outlookFriendlyName +
            '&redirect=' +
            redirectToAddin,
    );
    const loginURL = api.baseURL + api.loginPage + '?redirect=' + redirectToAuthPage;
    const url = `${api.addInBaseURL}/dialog.html?dialogredir=${loginURL}`;

    return new Promise((resolve, _) => {
        Office.context.ui.displayDialogAsync(url, options, (asyncResult) => {
            const dialog = asyncResult.value;
            dialog.addEventHandler(Office.EventType.DialogMessageReceived, (_arg) => {
                dialog.close();
                const searchParams = new URL(JSON.parse(_arg['message']).value).searchParams;
                const success = searchParams.get('success');
                if (success === '1') {
                    const authCode = searchParams.get('auth_code');
                    console.log('4');
                    resolve(authCode && authCode.length ? authCode : null);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

/**
 * Make an HTTP request to the Odoo database to exchange the authentication code
 * for a long term access token.
 *
 * Return the access token or null if something went wrong.
 */
async function _exchangeAuthCodeForAccessToken(authCode){
    try {
        return sendHttpRequest(
            HttpVerb.POST,
            api.baseURL + api.getAccessToken,
            ContentType.Json,
            null,
            { auth_code: authCode },
            true,
        ).promise.then((response) => {
            const parsed = JSON.parse(response);
            const accessToken = parsed.result.access_token;
            console.log('6');
            return accessToken && accessToken.length ? accessToken : null;
        });
    } catch {
        return null;
    }
}

const state = {
    authenticationRequestError: AuthenticationRequestError.None,
    accessToken: undefined,
    authCode: undefined,
}

export async function login() {
    console.log('1' + state);
    if (!(await _isOdooDatabaseReachable())) {
        state.authenticationRequestError = AuthenticationRequestError.DatabaseNotReachable;
        return state;
    }

    console.log('3' + state);
    const authCode = await _openOdooLoginDialog();
    if (!authCode) {
        state.authenticationRequestError = AuthenticationRequestError.PermissionRefused;
        return state;
    }

    console.log('5' + state);
    const accessToken = await _exchangeAuthCodeForAccessToken(authCode);
    if (!accessToken) {
        state.authenticationRequestError = AuthenticationRequestError.AuthenticationCodeExpired;
        return state;
    }

    state.accessToken = accessToken
    console.log('7' + state);
    return state;
}