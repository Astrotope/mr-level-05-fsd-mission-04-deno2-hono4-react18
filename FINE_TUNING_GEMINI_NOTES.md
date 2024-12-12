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
- **Size**: 344 conversation pairs - Sythetically generated using GPT-4o
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

### Setup and Configuration
```python
# Key configurations
MODEL_NAME = "gemini-1.5-flash"
TEMPERATURE = 0.1
MAX_OUTPUT_TOKENS = 200
TOP_P = 1
TOP_K = 1
```
