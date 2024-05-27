
// @ts-ignore
let mailboxItem: Office.Item & Office.ItemCompose & Office.ItemRead & Office.Message & Office.MessageCompose & Office.MessageRead & Office.Appointment & Office.AppointmentCompose & Office.AppointmentRead;

Office.initialize = function () {
    mailboxItem = Office.context.mailbox.item;

}
// @ts-ignore
function loglogWhileSending(event: any) {
    console.log('mail envoyé');
}