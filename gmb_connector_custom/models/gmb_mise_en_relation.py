from odoo import fields, models, api

class GmbMiseEnRelation(models.Model):
    # model property
    _name = "gmb.mise.en.relation"
    _description = "Mise en relation"
    _order = "id desc"

    # model fields
    date_mail = fields.Datetime(string="Date de mise en relation", required=True, default=lambda self: self.create_date)
    qui = fields.Many2one("res.partner", required=True, string="Qui")
    avec_qui = fields.Many2one("res.partner", required=True, string="Avec qui")
    message = fields.Many2one("gmb.mail.relation", required=True, string="Mail de mise en relation")