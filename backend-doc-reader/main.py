from flask import Flask
from routes.upload import upload_bp
from routes.ask import ask_bp
from routes.documents import documents_bp
import os

app = Flask(__name__)

app.register_blueprint(upload_bp)
app.register_blueprint(ask_bp)
app.register_blueprint(documents_bp)

if __name__ == "__main__":
    os.makedirs("tmp/indexes", exist_ok=True)
    app.run(debug=True)


## `requirements.txt`

flask
pypdf
python-docx
langchain
langchain-community
faiss-cpu
sentence-transformers