import os
from flask import Flask, json, request, jsonify
from chunking_evaluation.chunking import RecursiveTokenChunker, KamradtModifiedChunker
from analyze_chunks import analyze_chunks
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Handles file upload and performs recursive token-based chunking
@app.route('/rtc', methods=['POST'])
def rtc():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    document = file.read().decode('utf-8')

    recursive_character_chunker = RecursiveTokenChunker(
        chunk_size=1000,
        chunk_overlap=400,
        length_function=len,
        separators=["\n\n", "\n", ".", "?", "!", " ", ""]
    )

    recursive_character_chunks = recursive_character_chunker.split_text(document)
    return jsonify(recursive_character_chunks)


# Creates embeddings for a single string or a list of strings
def get_embedding(text, model="text-embedding-3-large"):
    if isinstance(text, list):
        texts = [t.replace("\n", " ") for t in text]
        response = client.embeddings.create(input=texts, model=model)
        return [res.embedding for res in response.data]
    else:
        cleaned = text.replace("\n", " ")
        response = client.embeddings.create(input=[cleaned], model=model)
        return response.data[0].embedding

# Performs semantic chunking using embeddings and analyzes the chunks
@app.route('/semantic', methods=['POST'])
def semantic():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    document = file.read().decode('utf-8')

    kamradt_chunker = KamradtModifiedChunker(
        avg_chunk_size=600,
        min_chunk_size=400,
        embedding_function=get_embedding
    )

    kamradt_chunks = kamradt_chunker.split_text(document)
    return jsonify(kamradt_chunks)

if __name__ == '__main__':
    app.run(debug=True)
