from flask import Flask, render_template, request

app = Flask(__name__, template_folder='view/templates',
            static_folder='view')

@app.route('/')
def index(module=False):
    dev = request.args.get('dev')
    if dev is None: dev = 1
    print('dev:', dev)
    return render_template('index.html', DEV=int(dev), tpl=request.args.get('tpl'))

