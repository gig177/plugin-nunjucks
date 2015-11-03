from flask import Flask, render_template, request, send_from_directory

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index(module=False):
    dev = request.args.get('dev')
    if dev is None: dev = 1
    print('dev:', dev)
    return render_template('index.html', DEV=int(dev), tpl=request.args.get('tpl'))

@app.route('/<path>')
def static_proxy(path):
    return send_from_directory('.', path)
