export const api = {
    baseURL: 'https://demoasoi.gembaware.dev',

    searchPartner: '/mail_plugin/partner/search',
    createPartner: '/mail_plugin/partner/create',
    logMail: '/mail_plugin/log_mail_content',

    loginPage: '/web/login', // Should be the usual Odoo login page.
    authCodePage: '/mail_plugin/auth', // The page where to allow or deny access. You get an auth code.
    getAccessToken: '/mail_plugin/auth/access_token', // The address where to post to exchange an auth code for an access token.
    outlookScope: 'outlook',
    outlookFriendlyName: 'Outlook',
    addInBaseURL: 'https://' + __DOMAIN__,
}