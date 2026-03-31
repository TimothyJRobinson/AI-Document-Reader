import pytest
import os
import io
from main import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_upload_txt(client):
    data = {
        "file": (io.BytesIO(b"This is a test document with some content."), "test.txt")
    }
    response = client.post("/upload", content_type="multipart/form-data", data=data)
    assert response.status_code == 200
    assert "document_id" in response.get_json()

def test_upload_no_file(client):
    response = client.post("/upload", content_type="multipart/form-data", data={})
    assert response.status_code == 400

def test_upload_unsupported_type(client):
    data = {
        "file": (io.BytesIO(b"some content"), "test.csv")
    }
    response = client.post("/upload", content_type="multipart/form-data", data=data)
    assert response.status_code == 400

def test_faiss_index_saved(client):
    data = {
        "file": (io.BytesIO(b"This is a test document with some content."), "test.txt")
    }
    response = client.post("/upload", content_type="multipart/form-data", data=data)
    document_id = response.get_json()["document_id"]

    index_path = f"tmp/indexes/{document_id}"
    assert os.path.exists(os.path.join(index_path, "index.faiss"))
    assert os.path.exists(os.path.join(index_path, "index.pkl"))