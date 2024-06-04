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
    relations = fields.One2many("gmb.mise.en.relation", "message", string="Relations")
    analyzed = fields.Boolean(string="Déjà analyser", readonly=True)
    analyze_response = fields.Text(string="Retour d'analyse", readonly=True)
    # TODO peut etre mettre le sujet

    # model methods
    def action_MER(self, manual: bool = True):
        prompt = ("fais moi une liste des personnes en cités dans le mail suivant en excluant le destinataire du mail '"
                  + self.destinataire.name + "'. La liste doit être une chaine de caractère où le nom et uniquement "
                                             "le nom, pas de titre honorifique (Mr, Dr, etc...), des personnes est "
                                             "séparé par une virgule, exemple : 'jean Marie,Pierre Paul'. "
                                             "\n Corps du mail : " + self.body)
        if not manual:
            try:
                self._analyse_mail(prompt)
            except Exception as error:
                _logger.error(error)
                return False
        else:
            self._analyse_mail(prompt)
        self.analyzed = True
        return True

    def _analyse_mail(self, prompt):
        self.analyze_response = str(Web_Editor().generate_text(prompt, []))
        relation_list = self.analyze_response.split(',')
        for name in relation_list:
            self.env['gmb.mise.en.relation'].create({
                "date_mail": self.date_mail,
                "qui": self.destinataire.id,
                "avec_qui": name,
                "message": self.id,
            })

    @api.model
    def create(self, vals):
        if vals.get('name', "Nouveau") == "Nouveau":
            vals['name'] = self.env['ir.sequence'].next_by_code(
                'gmb.mise.en.relation') or "Nouveau"
        res = super(GmbMailRelation, self).create(vals)
        self.action_MER(False)
        return res