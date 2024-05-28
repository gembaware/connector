import * as Login from './login'
async function onMessageSendHandler(event) {
  console.log(event + "ok")
  let loginState = await Login.login();
  console.log('[LOGED IN]')
}

Office.initialize = () => {
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}
