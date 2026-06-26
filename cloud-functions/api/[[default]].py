"""
Paham Kades — re-export from self-contained index.py.
EdgeOne Pages entry point: api.[[default]].app
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from index import app, main_handler
