#!/bin/env python
from app import app

host = '0.0.0.0'
if __name__ == '__main__':
    app.run(debug=True, use_reloader=True, host=host)
