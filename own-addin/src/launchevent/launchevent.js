import { Authenticator } from '@microsoft/office-js-helpers';

function onMessageSendHandler(event) {
  console.log(event + "ok")
}

Office.initialize = () => {
  if (Authenticator.isAuthDialog()) return;
  if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
    Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
  }
}
