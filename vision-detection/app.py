from flask import Flask, jsonify

app = Flask(__name__)

@app.get('/health')
def health():
    return jsonify(status='ok')

@app.get('/readiness')
def readiness():
    return jsonify(ready=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
