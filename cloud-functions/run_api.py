"""Helper script to run the WSGI backend for development."""
import os, sys, importlib.util

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

# Load [[default]].py by file path (bracket name can't use normal import)
spec = importlib.util.spec_from_file_location(
    "api_entry",
    os.path.join(os.path.dirname(__file__), "api", "[[default]].py"),
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
app = mod.app

if __name__ == "__main__":
    from wsgiref.simple_server import make_server

    host, port = "0.0.0.0", 8088
    print(f"Paham Kades API running at http://{host}:{port}", flush=True)
    make_server(host, port, app).serve_forever()
