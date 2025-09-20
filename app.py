#!/usr/bin/env python3

from flask import Flask, render_template, request, jsonify
import re
import random

app = Flask(__name__)

class TechGadgetChatbot:
    def __init__(self):
        self.patterns = {
            'greetings': [
                r'\b(hi|hello|hey|good morning|good afternoon|good evening)\b',
                r'\b(greetings|howdy)\b'
            ],
            'order_status': [
                r'\b(status|track|order|where is my order|order status|tracking)\b',
                r'\b(where is|when will|delivery|shipped|shipping)\b'
            ],
            'returns_refunds': [
                r'\b(return|refund|exchange|broken|defective|damaged)\b',
                r'\b(warranty|repair|replace|money back)\b'
            ],
            'contact_info': [
                r'\b(contact|call|phone|email|speak to someone|human|agent)\b',
                r'\b(support|help|assistance|representative)\b'
            ],
            'hours_operation': [
                r'\b(hours|open|close|time|operating|business hours)\b',
                r'\b(when.*open|what time|available)\b'
            ],
            'exit': [
                r'\b(quit|exit|bye|goodbye|see you|farewell)\b',
                r'\b(thanks|thank you|done|finished)\b'
            ]
        }
        
        self.responses = {
            'greetings': [
                "Hello! Welcome to TechGadget Support. How can I help you today?",
                "Hi there! Thanks for reaching out to TechGadget. What can I assist you with?",
                "Hey! Welcome to our customer service. How may I help you?"
            ],
            'order_status': [
                "To check your order status, please provide your order number or email address. You can also track your order in real-time through our website.",
                "I can help you track your order! Please share your order number, and I'll look up the current status for you.",
                "For order tracking, you can visit our website or provide me with your order details. Most orders are processed within 1-2 business days."
            ],
            'returns_refunds': [
                "We offer a 30-day return policy for all electronics. To process a return or refund, please provide your order number and reason for return.",
                "I can help you with returns and exchanges. What item would you like to return, and what's the reason?",
                "For defective items, we provide free return shipping and full refunds. Please describe the issue you're experiencing."
            ],
            'contact_info': [
                "You can reach our customer service team at:\n📞 Phone: +254-TECHGADGET\n📧 Email: support@techgadget.com\n💬 Live Chat: Available 24/7 on our website",
                "Our support team is available to help! Call us at +254-TECHGADGET or email support@techgadget.com for immediate assistance.",
                "For immediate help, you can call our number +254-TECHGADGET or use our live chat feature on the website."
            ],
            'hours_operation': [
                "Our customer service hours are:\n🕐 Monday-Friday: 8:00 AM - 8:00 PM EST\n🕐 Saturday: 9:00 AM - 6:00 PM EST\n🕐 Sunday: 10:00 AM - 4:00 PM EST\n\nLive chat is available 24/7!",
                "We're here to help! Our phone support is available Monday-Friday 8 AM to 8 PM EST, and our live chat is available 24/7.",
                "Customer service hours: Mon-Fri 8AM-8PM EST, Sat 9AM-6PM EST, Sun 10AM-4PM EST. Live chat is always available!"
            ],
            'exit': [
                "Thank you for contacting TechGadget. Have a great day!",
                "Thanks for reaching out! We appreciate your business. Take care!",
                "Goodbye! Feel free to contact us anytime if you need further assistance."
            ]
        }
    
    def match_intent(self, user_input):
        user_input_lower = user_input.lower().strip()
        
        for intent, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, user_input_lower, re.IGNORECASE):
                    return intent
        
        return None
    
    def get_response(self, intent):
        if intent and intent in self.responses:
            return random.choice(self.responses[intent])
        return None
    
    def process_message(self, user_input):
        if not user_input.strip():
            return "I didn't catch that. Could you please repeat your question?"
        
        intent = self.match_intent(user_input)
        if intent == 'exit':
            return random.choice(self.responses['exit'])
        
        response = self.get_response(intent)
        
        if response:
            return response
        else:
            return ("I'm sorry, I didn't understand that. Please try asking about order status, "
                   "returns, or how to contact us. You can also ask about our business hours!")

chatbot = TechGadgetChatbot()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    bot_response = chatbot.process_message(user_message)
    
    return jsonify({
        'response': bot_response,
        'is_exit': chatbot.match_intent(user_message) == 'exit'
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
