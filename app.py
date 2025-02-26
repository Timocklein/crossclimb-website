import os
import json
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
print(client)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate_puzzle', methods=['GET'])
def generate_puzzle():
    prompt = (
        "Generate a word ladder puzzle with 5 words for a game called Crossclimb. "
        "Each word must differ by exactly one letter from the previous word. "
        "For each word, provide a brief clue to help guess the word. "
        "Output the result as JSON in the following format:\n"
        "{\n"
        '  "words": ["word1", "word2", "word3", "word4", "word5"],\n'
        '  "clues": ["clue for word1", "clue for word2", "clue for word3", "clue for word4", "clue for word5"]\n'
        "}"
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Adjust model if needed
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=512
        )
        text_output = response.choices[0].message.content.strip()
        puzzle_data = json.loads(text_output)
    except Exception as e:
        print(e)
        return jsonify({"error": "Puzzle generation failed", "details": str(e)})
    
    return jsonify(puzzle_data)

if __name__ == '__main__':
    app.run(debug=True)
