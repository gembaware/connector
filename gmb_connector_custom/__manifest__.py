# -*- coding: utf-8 -*-
{
    'name': 'gmb_connector_custom',
    'version': '1.0',
    'category': 'Sales/CRM',
    'summary': 'Customize Odoo mail plugin',
    'description': 'Customize Odoo mail plugin to add new functionnalities on Odoo for Outlook',
    'depends': [
        'mail',
        'mail_plugin',
    ],
    'data': [
        'views/mail_message_views.xml',
        'views/gmb_mail_relation_views.xml'
    ],
    'installable': True,
    'license': 'LGPL-3',
}