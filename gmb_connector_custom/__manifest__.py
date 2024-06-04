# -*- coding: utf-8 -*-
{
    'name': 'gmb_connector_custom',
    'version': '1.0',
    'category': 'Sales/CRM',
    'summary': 'Customize Odoo mail plugin',
    'description': 'Customize Odoo mail plugin to add new functionnalities on Odoo for Outlook',
    'depends': [
        'base_setup',
        'mail',
        'mail_plugin',
        'web_editor',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/gmb_mise_en_relation_views.xml',
        'views/gmb_mail_relation_views.xml',
        'views/mail_message_views.xml',
        'views/gmb_mise_en_relation_menus.xml',
        'data/ir_sequence_data.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
