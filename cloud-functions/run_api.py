"""Helper script to run the FastAPI backend for development."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

import uvicorn

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    uvicorn.run(
        "api.[[default]]:app",
        host="0.0.0.0",
        port=8088,
        reload=True,
        reload_dirs=["api", "lib"],
    )
