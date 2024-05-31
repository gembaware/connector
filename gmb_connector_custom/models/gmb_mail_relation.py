from odoo import fields, models, api

class GmbMailRelation(models.Model):
    # model property
    _name = "gmb.mail.relation"
    _description = "Mail contenant des relations"
    _order = "id desc"

    # model fields
    date_mail = fields.Date(string="Date d'envoi", required=True, default=lambda self: self.create_date)
    destinataire = fields.Many2one("res.partner", required=True, string="Destinataire")
    body = fields.Html(string="Message")
    # TODO peut etre mettre le sujet

    # model methods
    # def create(self):
    #     pass

    def action_MER(self):
        return True