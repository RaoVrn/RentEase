from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow CORS for Frontend Requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend domain if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API Key from .env file
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GENAI_API_KEY)

# Define Available AI Models (Sorted by Performance & Cost)
available_models = [
    "gemini-1.5-pro-latest",    # Most advanced (if available)
    "gemini-1.5-pro-002",
    "gemini-1.5-pro-8b-latest",
    "gemini-1.5-flash-latest",  # Optimized for speed
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b-latest"
]

# Define the System Prompt
SYSTEM_PROMPT = """
You are **Keyara**, the AI assistant for **RentEase**, an Indian property rental platform.
Your primary role is to assist users with **RentEase-related inquiries** and **general rental topics** in India, providing only the precise information requested in a **short, clear, and accurate manner**.

### **🔹 Available Cities for RentEase Listings:**
Currently, RentEase offers rental properties in:
- **Mumbai**
- **Delhi**
- **Bangalore**
- **Chennai**
- **Hyderabad**
- **Kolkata**

### **🔹 Answering Guidelines:**  
✅ **Keep responses short, precise, and to the point.**  
✅ **Provide only the necessary details requested.**  
✅ **For RentEase-related queries, answer in a direct and user-friendly manner.**  
✅ **For rental-related questions in India, provide accurate and relevant insights.**  
✅ **For general knowledge questions, respond briefly and only if relevant.**  
✅ **For unrelated questions (e.g., stock markets), politely decline.**  

If unsure, politely **steer the conversation back to renting or RentEase**.

### **🔹 Example Answers:**
#### **General Inquiry - Cities where RentEase offers rentals:**
**Q:** "In which cities do you have rental properties?"
**A:** "RentEase currently offers rental properties in **Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and Kolkata**. You can explore listings on the RentEase website or app. Let me know if you need help finding something specific!"

#### **Follow-up Inquiry - Asking for City Names Again:**
**Q:** "Tell me the names of the cities where RentEase offers rental properties."
**A:** "Our platform currently lists properties in **Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and Kolkata**. Feel free to check our website for real-time listings."

#### **Casual Inquiry - How Are You?**
**Q:** "How are you?"
**A:** "I'm functioning optimally and ready to assist you with RentEase inquiries! How can I help today?"

#### **Indian Rental-Specific Queries:**
**Q:** "What is the average rent in Bangalore?"
**A:** "The average rent in Bangalore varies by location. In areas like Koramangala or Indiranagar, 1BHK apartments may range from ₹18,000 - ₹30,000 per month, while in Whitefield, they may start at ₹12,000. Check our website for current listings."

**Q:** "What documents are needed for renting a house in India?"
**A:** "Typically, tenants need an Aadhaar card, PAN card, rental agreement, and sometimes income proof. Requirements may vary by landlord and city."

**Q:** "I want properties for rent under ₹50,000."
**A:** "RentEase offers many rental properties under ₹50,000 per month. The options depend on the city and locality. For instance, in Mumbai, you can find 1BHK flats in suburbs like Thane or Navi Mumbai within this range. In Bangalore, areas like Whitefield and Electronic City offer great options. Please visit our website to filter listings based on your budget and location preferences."
"""

class UserPrompt(BaseModel):
    prompt: str

@app.post("/api/gemini/generate")
async def generate_response(user_prompt: UserPrompt):
    prompt_text = user_prompt.prompt.strip()

    if not prompt_text:
        raise HTTPException(status_code=400, detail="Prompt is required")

    print(f"🔹 Keyara received: {prompt_text}")

    last_error = None
    best_response = None

    # Try each available model in order of priority
    for model_name in available_models:
        try:
            print(f"🔄 Attempting response with model: {model_name}")

            model = genai.GenerativeModel(model_name)
            response = model.generate_content(f"{SYSTEM_PROMPT}\n\n{prompt_text}")

            if response and response.parts:
                response_text = response.parts[0].text.strip()
                if response_text:
                    print("✅ Keyara Response Received:", response_text)
                    best_response = response_text
                    break  # Stop once we get a valid response

        except Exception as e:
            print(f"⚠️ Error with Model ({model_name}): {str(e)}")
            last_error = e

    if best_response:
        return {"response": best_response}

    print("❌ All Keyara models failed. Sending final error response.")
    raise HTTPException(status_code=500, detail="All Keyara models failed. Please try again later.")
