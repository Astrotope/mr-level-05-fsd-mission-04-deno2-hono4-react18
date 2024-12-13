# Gemini Model Fine-Tuning Documentation

## Overview
This documentation covers the fine-tuning process of the Gemini model for the Tina AI insurance chatbot. The model was trained to provide enthusiastic, car-focused responses while maintaining accurate insurance policy recommendations based on vehicle characteristics.

## Dataset

### Structure
The training data is stored in `training_data.json` and follows this format:
```json
{
    "text_input": "User message",
    "output": "Tina's response"
}
```

### Dataset Characteristics
- **Size**: 388 conversation pairs - Sythetically generated using GPT-4o
- [ChatGPT - Data Generation Conversation](https://chatgpt.com/share/675808bc-1034-800d-9115-3b2690c40262)
- **Format**: JSON
- **Language Style**: Casual, enthusiastic, car-focused
- **Coverage**:
  - Vehicle type identification (trucks, racing cars, regular cars)
  - Age-based classifications (over/under 10 years)
  - Policy recommendations (MBI, CCI, 3RDP)
  - General insurance queries
  - Edge cases and special scenarios

### Key Conversation Flows
1. **Vehicle Type Identification**
   - Truck confirmation
   - Racing car verification
   - Regular car classification

2. **Age Determination**
   - Over 10 years old
   - Under 10 years old
   - Ambiguous age responses

3. **Policy Recommendations**
   - Trucks → Third Party only
   - Racing cars → Third Party only
   - Regular cars:
     - Over 10 years → MBI or Third Party
     - Under 10 years → MBI or CCI

## Training Notebook

The training process is documented in `train_gemin_02.ipynb` and includes:

## Google AI Studio Training

I also tuned the model through Google AI Studio (for practice) 
- You have to conver the JSONL to CSV for this.
- I used this Colab notebook to do the conversion [Delete Models / Convert JSONL to CSV Notebook](https://colab.research.google.com/drive/1FL6W-iUHIP_rcNz4CEju1IUUpUhULe0y?usp=sharing)

![image](https://github.com/user-attachments/assets/18571bfd-5cfb-4c96-b821-24735f10d706)

