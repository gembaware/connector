# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime, date

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


def generate_response(method, model, rec_id):
    """This function is used to generate the response based on the type
    of request and the parameters given"""
    option = request.env['connection.api'].search(
        [('model_id', '=', model)], limit=1)
    model_name = option.model_id.model
    if method != 'DELETE':
        data = json.loads(request.httprequest.data)
    else:
        data = {}
    fields = []
    if data:
        for field in data['fields']:
            fields.append(field)
    if not fields and method != 'DELETE':
        return ("<html><body><h2>No fields selected for the model"
                "</h2></body></html>")
    if not option:
        return ("<html><body><h2>No Record Created for the model"
                "</h2></body></html>")
    try:
        if method == 'GET':
            fields = []
            for field in data['fields']:
                fields.append(field)
            if not option.is_get:
                return ("<html><body><h2>Method Not Allowed"
                        "</h2></body></html>")
            else:
                datas = []
                if rec_id != 0:
                    partner_records = request.env[
                        str(model_name)].search_read(
                        domain=[('id', '=', rec_id)],
                        fields=fields
                    )
                    data = json.dumps({
                        'records': partner_records
                    })
                    datas.append(data)
                    return request.make_response(data=datas)
                else:
                    domain = []
                    if data['domain']:
                        domain = data['domain']
                    partner_records = request.env[
                        str(model_name)].search_read(
                        domain=domain,
                        fields=fields
                    )
                    data = json.dumps({
                        'records': partner_records
                    })
                    datas.append(data)
                    return request.make_response(data=datas)
    except Exception as error:
        _logger.warning("Error: " + str(error))
        return ("<html><body><h2>Invalid JSON Data"
                "</h2></body></html>")
    if method == 'POST':
        if not option.is_post:
            return ("<html><body><h2>Method Not Allowed"
                    "</h2></body></html>")
        else:
            try:
                data = json.loads(request.httprequest.data)
                datas = []
                new_resource = request.env[str(model_name)].create(
                    data['values'])
                partner_records = request.env[
                    str(model_name)].search_read(
                    domain=[('id', '=', new_resource.id)],
                    fields=fields
                )
                for k, v in partner_records[0].items():
                    if type(v) is datetime:
                        partner_records[0][k] = partner_records[0][k].strftime("%m/%d/%Y %H:%M:%S")
                    if type(v) is date:
                        partner_records[0][k] = partner_records[0][k].strftime("%m/%d/%Y")
                new_data = json.dumps({'created_record': partner_records, })
                datas.append(new_data)
                return request.make_response(data=datas)
            except Exception as error:
                _logger.warning("Error: " + str(error))
                return ("<html><body><h2>Invalid JSON Data"
                        "</h2></body></html>")
    if method == 'PUT':
        if not option.is_put:
            return ("<html><body><h2>Method Not Allowed"
                    "</h2></body></html>")
        try:
            datas = []
            data = json.loads(request.httprequest.data)
            domain = []
            resource = False
            if rec_id == 0:
                if 'domain' in data and data['domain']:
                    domain = data['domain']
                    resource = request.env[str(model_name)].search(domain)
                    if len(resource) > 1:
                        return ("<html><body><h2>Invalid domain : only one resource is expected"
                                "</h2></body></html>")
                else:
                    return ("<html><body><h2>No ID or domain Provided"
                            "</h2></body></html>")
            else:
                resource = request.env[str(model_name)].browse(int(rec_id))
                domain = [('id', '=', resource.id)]
            if not resource.exists():
                return ("<html><body><h2>Resource not found"
                        "</h2></body></html>")
            resource.write(data['values'])
            partner_records = request.env[
                str(model_name)].search_read(
                domain=domain,
                fields=fields
            )
            new_data = json.dumps(
                {'updated_records': partner_records,
                 })
            datas.append(new_data)
            return request.make_response(data=datas)
        except Exception as error:
            _logger.warning("Error: " + str(error))
            return ("<html><body><h2>Invalid JSON Data"
                    "</h2></body></html>")
    if method == 'DELETE':
        if not option.is_delete:
            return ("<html><body><h2>Method Not Allowed"
                    "</h2></body></html>")
        else:
            if rec_id == 0:
                return ("<html><body><h2>No ID Provided"
                        "</h2></body></html>")
            else:
                resource = request.env[str(model_name)].browse(
                    int(rec_id))
                if not resource.exists():
                    return ("<html><body><h2>Resource not found"
                            "</h2></body></html>")
                else:

                    records = request.env[
                        str(model_name)].search_read(
                        domain=[('id', '=', resource.id)],
                        fields=['id', 'display_name']
                    )
                    remove = json.dumps(
                        {"deleted_records": records,
                         })
                    resource.unlink()
                    return request.make_response(data=remove)


def _fetch(auth_api, http_method, kw, model):
    model_id = request.env['ir.model'].search(
        [('model', '=', model)])
    if not model_id:
        return ("<html><body><h3>Invalid model, check spelling or maybe "
                "the related "
                "module is not installed"
                "</h3></body></html>")
    if type(auth_api) is bool:
        if not kw.get('Id'):
            rec_id = 0
        else:
            rec_id = int(kw.get('Id'))
        result = generate_response(http_method, model_id.id, rec_id)
        return result
    else:
        return auth_api


def auth_api_key(api_key):
    """This function is used to authenticate the api_key when sending a
    request"""
    user_id = request.env['res.users'].sudo().search([('api_key', '=', api_key)])
    if api_key is not None and user_id:
        response = True
    elif not user_id:
        response = ('<html><body><h2>Invalid <i>API Key</i> '
                    '!</h2></body></html>')
    else:
        response = ("<html><body><h2>No <i>API Key</i> Provided "
                    "!</h2></body></html>")
    return response


def _authenticate():
    data = json.loads(request.httprequest.data)
    # authenticate
    api_key = data['api_key']
    auth_api = auth_api_key(api_key)
    username = data['login']
    password = data['password']
    request.session.authenticate(request.session.db, username, password)
    return auth_api


class RestApi(http.Controller):
    """This is a controller which is used to generate responses based on the
    api requests"""

    @http.route(['/send_request'], type='http',
                auth='none',
                methods=['POST', 'PUT', 'DELETE'], csrf=False, cors="*")
    def fetch_data(self, **kw):
        """This controller will be called when sending a request to the
        specified url, and it will authenticate the api_key and then will
        generate the result"""
        http_method = request.httprequest.method
        data = json.loads(request.httprequest.data)
        api_key = data['api_key']
        auth_api = auth_api_key(api_key)
        model = kw.get('model')
        username = data['login']
        password = data['password']
        request.session.authenticate(request.session.db, username,
                                     password)
        return _fetch(auth_api, http_method, kw, model)

    @http.route(['/send_get'], type='http', methods=['POST'], auth="none", lang="fr", csrf=False, cors="*")
    def fetch_data_get(self, **kw):
        """This controller will be called when sending a request to the
        specified url, and it will authenticate the api_key and then
        will generate the result"""
        http_method = 'GET'
        auth_api = _authenticate()

        # prepare data
        model = kw.get('model')
        return _fetch(auth_api, http_method, kw, model)

    @http.route(['/print_document'], type="http", method=['POST'], auth="none", csrf=False, cors="*")
    def print_document(self, **kw):
        auth_api = _authenticate()

        # prepare data
        model_id = kw.get('model')
        model = request.env['ir.model'].search([('id', '=', model_id)])
        if not model:
            return ("<html><body><h3>Invalid model, check spelling or maybe "
                    "the related "
                    "module is not installed"
                    "</h3></body></html>")
        if type(auth_api) is bool:
            record_id = kw.get('id')
            report_id = kw.get('report_id')
            record = request.env[model.name].search([('id', '=', record_id)])
            if not record:
                return ("<html><body><h3>Record does not exist or no id provided (0)</h3></body></html>")
            report = request.env['ir.actions.report'].search([('id', '=', report_id)])
            if report:
                if report.model != model.name:
                    return (f"<html><body><h3>No report {report_id} for model {model.id}</h3></body></html>")
            else:
                report = request.env['ir.action.report'].search([('model', '=', model.name)], limit=1)
            # TODO : appel de impression


    @http.route(['/odoo_connect'], type="http", auth="none", csrf=False,
                methods=['GET', 'POST'], cors="*")
    def odoo_connect(self, **kw):
        """This is the controller which initializes the api transaction by
        generating the api_key for specific user and database"""
        # get body datas
        data = json.loads(request.httprequest.data)
        try:
            request.session.update(http.get_default_session(), db=data['db'])
            auth = request.session.authenticate(request.session.db, data['login'],
                                                data['password'])
            user = request.env['res.users'].browse(auth)
            api_key = request.env.user.generate_api(data['login'])
            datas = json.dumps({"Status": "auth successful",
                                "User": user.name,
                                "api_key": api_key})
            return request.make_response(data=datas)
        except Exception as error:
            _logger.warning("Error: " + str(error))
            return ("<html><body><h2>wrong login credentials"
                    "</h2></body></html>")
