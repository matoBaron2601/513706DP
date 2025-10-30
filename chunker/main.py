import os
from flask import Flask, json, request, jsonify
from chunking_evaluation.chunking import RecursiveTokenChunker, KamradtModifiedChunker
from analyze_chunks import analyze_chunks
from openai import OpenAI
from dotenv import load_dotenv
import os
app = Flask(__name__)

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

    # analysis_results = analyze_chunks(recursive_character_chunks, use_tokens=False)


    with open('./test.json', "w", encoding="utf-8") as f:
        json.dump({
            "content": recursive_character_chunks,
        }, f, ensure_ascii=False, indent=2)

    return jsonify(recursive_character_chunks)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def get_embedding(text, model="text-embedding-3-small"):
    if isinstance(text, list):  # batch mode
        texts = [t.replace("\n", " ") for t in text]
        response = client.embeddings.create(input=texts, model=model)
        return [res.embedding for res in response.data]  # list of embeddings
    else:  # single string
        cleaned = text.replace("\n", " ")
        response = client.embeddings.create(input=[cleaned], model=model)
        return response.data[0].embedding

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
    analyze_chunks(kamradt_chunks, use_tokens=True)

    return jsonify(kamradt_chunks)

if __name__ == '__main__':
    app.run(debug=True)