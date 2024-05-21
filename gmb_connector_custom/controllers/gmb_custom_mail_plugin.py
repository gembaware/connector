# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from markupsafe import Markup
from werkzeug.exceptions import Forbidden
import base64
import logging

_logger = logging.getLogger(__name__)

class GmbMailPluginController(http.Controller):
    @http.route('/mail_plugin/custom_log_single_mail', type='json', auth='outlook', cors="*")
    def custtom_log_single_mail(self, model, res_id, message, attachments=None):
        """Log the email on the given record.

        :param model: Model of the record on which we want to log the email
        :param res_id: ID of the record
        :param message: Body of the email
        :param attachments: List of attachments of the email.
            List of tuple: (filename, base 64 encoded content)
        """
        if model not in ['res.partner', 'project.task', 'crm.lead', 'helpdesk.ticket']:
            raise Forbidden()

        if attachments:
            attachments = [(name, base64.b64decode(content)) for name, content in attachments]

        if message[1] != '':
            _logger.warning('value = ' + message[1])

        request.env[model].browse(res_id).message_post(body=Markup(message[0]), attachments=attachments, gmb_val_from_connector=message[1])
        return True