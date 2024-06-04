from odoo import fields, models, api
from odoo.addons.web_editor.controllers.main import Web_Editor

import logging

_logger = logging.getLogger(__name__)

class GmbMailRelation(models.Model):
    # model property
    _name = "gmb.mail.relation"
    _description = "Mail contenant des relations"
    _order = "id desc"

    # model fields
    name = fields.Char(string="Mail name", required=True, copy=False, readonly=False, index='trigram',
                       default="Nouveau")
    date_mail = fields.Datetime(string="Date d'envoi", required=True, default=lambda self: self.create_date)
    destinataire = fields.Many2one("res.partner", required=True, string="Destinataire")
    body = fields.Text(string="Message", readonly=True)
    # TODO peut etre mettre le sujet

    # model methods
    # def create(self):
    #     pass

    def action_MER(self):
        prompt = "fais moi une liste des relations cités dans le mail suivant : " + self.body
        response = Web_Editor().generate_text(prompt, [])
        _logger.warning(str(response))
        return True

    # model methods
    # @api.model_create_multi
    # def create(self, vals_list):
    #     # for vals in vals_list:
    #     #     if vals.get('name', "Nouveau") == "Nouveau":
    #     #         vals['name'] = self.env['ir.sequence'].next_by_code(
    #     #             'gmb.mise.en.relation') or "Nouveau"