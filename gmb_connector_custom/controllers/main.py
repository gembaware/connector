# custom_middleware/controllers/main.py

from werkzeug.wrappers import Request, Response
from odoo.http import root
from odoo import http

class CORSMiddleware(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)
        if request.method == 'OPTIONS':
            response = Response()
            response.headers.add('Access-Control-Allow-Origin', 'https://gembaware.github.io')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, login, password, bd')
            response.headers.add('Access-Control-Max-Age', '3600')
            return response(environ, start_response)

        def custom_start_response(status, headers, exc_info=None):
            headers.append(('Access-Control-Allow-Origin', 'https://gembaware.github.io'))
            headers.append(('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'))
            headers.append(('Access-Control-Allow-Headers', 'Content-Type, Authorization, login, password, bd'))
            return start_response(status, headers, exc_info)

        return self.app(environ, custom_start_response)

root.app = CORSMiddleware(root.app)