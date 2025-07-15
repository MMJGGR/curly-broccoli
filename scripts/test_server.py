from fastapi.testclient import TestClient
from app.main import app
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import sys

client = TestClient(app)

class Handler(BaseHTTPRequestHandler):
    def _handle(self, method):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b''
        try:
            json_body = json.loads(body.decode()) if body else None
        except json.JSONDecodeError:
            json_body = None
        headers = {k: v for k, v in self.headers.items()}
        if method == 'GET':
            resp = client.get(self.path, headers=headers)
        elif method == 'POST':
            resp = client.post(self.path, json=json_body, headers=headers)
        elif method == 'PUT':
            resp = client.put(self.path, json=json_body, headers=headers)
        elif method == 'DELETE':
            resp = client.delete(self.path, headers=headers)
        elif method == 'HEAD':
            resp = client.get(self.path, headers=headers)
        else:
            self.send_response(405)
            self.end_headers()
            return
        self.send_response(resp.status_code)
        for k, v in resp.headers.items():
            self.send_header(k, v)
        self.end_headers()
        if method != 'HEAD':
            data = resp.json()
            if isinstance(data, (dict, list)):
                out = json.dumps(data).encode()
            else:
                out = str(data).encode()
            self.wfile.write(out)

    def do_GET(self):
        self._handle('GET')
    def do_POST(self):
        self._handle('POST')
    def do_PUT(self):
        self._handle('PUT')
    def do_DELETE(self):
        self._handle('DELETE')
    def do_HEAD(self):
        self._handle('HEAD')

    def log_message(self, format, *args):
        sys.stdout.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format%args))


def run(host='0.0.0.0', port=8000):
    httpd = HTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run(host, port)
