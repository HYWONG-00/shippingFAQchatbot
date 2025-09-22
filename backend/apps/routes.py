from flask import Blueprint, request, jsonify
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
print(os.getenv('OPENAI_API_KEY'))
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

api_bp = Blueprint('api', __name__)

@api_bp.route('/chat', methods=['POST'])
def chat():
    try:
        # Get prompt from request body
        data = request.json
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # Read FAQ file
        faq_path = os.path.join(os.path.dirname(__file__), '../faq.txt')
        try:
            with open(faq_path, 'r', encoding='utf-8') as file:
                faq_data = file.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return jsonify({'error': 'Error reading FAQ file'}), 500

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful online shipping customer service AI chatbot that only answers questions based on provided FAQ documents with friendly tones. "
                        "If the answer is not in the context, do NOT make up information. "
                        "Instead, politely say that you don’t have the information but offer to help with other questions."
                    )
                },
                {"role": "user", "content": f"Context: {faq_data}\n\nQuestion: {prompt}"}
            ],
            temperature=0,  # Deterministic responses
            max_tokens=100,  # Limit response length
            top_p=1,  # Nucleus sampling
            frequency_penalty=0.5,  # Reduce repetition
            presence_penalty=0  # Encourage new topics
        )

        # Extract the response text
        bot_response = response.choices[0].message.content

        return jsonify({
            'status': 200,
            'bot': bot_response
        })

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': str(e)}), 500