
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
load_dotenv()
hf_token = os.getenv("HF_TOKEN")
client = InferenceClient(
    provider="replicate",
    api_key=hf_token,
)

# output is a PIL.Image object
image = client.text_to_image(
    "A dark futuristic dashboard background with matte black and deep blue gradient. Subtle glowing connection lines and abstract circuit patterns in low opacity. Clean, minimal design with structured areas for charts and analysis. Professional, modern, and tech-inspired. High resolution, 16:9 aspect ratio.",
    model="Qwen/Qwen-Image",
)
image.save("dashboard_background.png")
