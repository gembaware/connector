
let mailboxItem;

Office.initialize = function (reason) {
    mailboxItem = Office.context.mailbox.item;

}
function loglogWhileSending() {
    console.log('mail envoyé');
}