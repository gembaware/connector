# -*- coding: utf-8 -*-
from odoo import models, fields

class GmbMailMessage(models.Model):
    # model property
    _inherit = 'mail.message'

    # model fields
    gmb_val_from_connector = fields.Char(string="Val from connector", default='', readonly=True)
