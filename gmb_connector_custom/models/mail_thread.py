# -*- coding: utf-8 -*-
from odoo import models, api
import logging

_logger = logging.getLogger(__name__)

class GmbMailThread(models.AbstractModel):
    _inherit = 'mail.thread'

    def _get_message_create_valid_field_names(self):
        """
        Some fields should not be given when creating a mail.message from
        mail.thread main API methods (in addition to some API specific check).
        Those fields are generally used through UI or dedicated methods. We
        therefore give an allowed field names list.
        """
        valid_field_names = super(GmbMailThread, self)._get_message_create_valid_field_names()
        valid_field_names.add('gmb_val_from_connector')
        _logger.warning(str(valid_field_names))
        return valid_field_names