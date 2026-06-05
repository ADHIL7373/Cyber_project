import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY        = os.getenv('SECRET_KEY', 'rce-lab-dev-key-2024')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    DATABASE_URL      = os.getenv('DATABASE_URL', 'sqlite:///rce_lab.db')
    LOG_FILE          = os.getenv('LOG_FILE', 'logs/attacks.log')
    OOB_HOST          = os.getenv('OOB_HOST', '127.0.0.1')
    OOB_PORT          = int(os.getenv('OOB_PORT', '8080'))
    DEBUG             = os.getenv('DEBUG', 'True') == 'True'
    CORS_ORIGINS      = ['http://localhost:3000']