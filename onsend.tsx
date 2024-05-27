
let mailboxItem;

Office.initialize = function () {
    mailboxItem = Office.context.mailbox.item;

}
function loglogWhileSending() {
    console.log('mail envoyé');
}