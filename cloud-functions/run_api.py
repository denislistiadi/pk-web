"""Helper script to run the WSGI backend for local development."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from index import app

if __name__ == "__main__":
    from wsgiref.simple_server import make_server
    host, port = "0.0.0.0", 8088
    print(f"Paham Kades API at http://{host}:{port}", flush=True)
    make_server(host, port, app).serve_forever()
