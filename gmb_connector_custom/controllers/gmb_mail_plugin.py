# -*- coding: utf-8 -*-
from odoo.addons.mail_plugin.controllers.mail_plugin import MailPluginController

class GmbMailPluginController(MailPluginController):

    def _mail_content_logging_models_whitelist(self):
        return super(MailPluginController, self)._mail_content_logging_models_whitelist() + ['gmb_connector_custom']
