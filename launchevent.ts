function onMessageSendHandler(event): void {
  console.log(event + "ok")
}

if (Office.context.platform === Office.PlatformType.PC || Office.context.platform === null) {
  Office.actions.associate("onMessageSendHandler", onMessageSendHandler)
}