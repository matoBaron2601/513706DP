import os
from flask import Flask, json, request, jsonify
from chunking_evaluation.chunking import RecursiveTokenChunker
from analyze_chunks import analyze_chunks

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



    # print(analysis_results)
    # print(recursive_character_chunks)
    return jsonify(recursive_character_chunks)

if __name__ == '__main__':
    app.run(debug=True)