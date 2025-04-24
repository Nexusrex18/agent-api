import asyncio
import logging
import os
from typing import Dict, Optional

import httpx
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=".env")

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai"
RETELL_BASE_URL = "https://api.retellai.com"

app = FastAPI(title="Unified Agent Creation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VOICE_MAPPING = {
    "emma": {"vapi": "en-US-EmmaNeural", "retell": "11labs-Adrian"},
    "aria": {"vapi": "en-US-AriaNeural", "retell": "openai-Alloy"},
    "guy": {"vapi": "en-US-GuyNeural", "retell": "deepgram-Angus"},
}


class CreateAgentRequest(BaseModel):
    platform: str
    agent_name: Optional[str] = None
    voice: str  
    prompt: Optional[str] = None
    language: Optional[str] = "en"  # Standardized language (e.g., "en", "es")
    voicemail_message: Optional[str] = None
    retell_llm_config: Optional[Dict] = None  # Optional Retell LLM config


# Response model for standardized output
class CreateAgentResponse(BaseModel):
    agent_id: str
    agent_name: Optional[str]
    voice: str
    language: str


async def call_vapi_api(payload: dict) -> dict:
    if not VAPI_API_KEY:
        raise HTTPException(status_code=500, detail="Vapi API key not configured")
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json",
    }
    logger.info(
        f"Sending Vapi request with headers: {headers['Authorization'][:15]}..."
    )
    logger.info(f"Vapi request payload: {payload}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{VAPI_BASE_URL}/assistant", json=payload, headers=headers
        )
        logger.info(f"Vapi response status: {response.status_code}")
        if response.status_code != 201:
            logger.error(f"Vapi error response: {response.text}")
        response.raise_for_status()
        return response.json()


async def create_retell_llm(
    prompt: str, retell_llm_config: Optional[Dict] = None
) -> str:
    """Create a Retell LLM Response Engine and return its llm_id."""
    if not RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="Retell API key not configured")
    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o",
        "model_temperature": 0,
        "general_prompt": prompt or "You are a helpful assistant.",
        "begin_message": "Hello! How can I assist you today?",
        "general_tools": [
            {
                "type": "end_call",
                "name": "end_call",
                "description": "End the call with user.",
            }
        ],
    }
    if retell_llm_config:
        payload.update(retell_llm_config)

    logger.info(f"Creating Retell LLM with payload: {payload}")

    # Try synchronous request with requests library
    logger.info("Attempting synchronous request for Retell LLM...")
    try:
        response = requests.post(
            f"{RETELL_BASE_URL}/create-retell-llm",
            json=payload,
            headers=headers,
            timeout=30,
        )
        logger.info(f"Retell LLM synchronous response status: {response.status_code}")
        if response.status_code not in [200, 201]:
            logger.error(f"Retell LLM synchronous error response: {response.text}")
        response.raise_for_status()
        return response.json()["llm_id"]
    except requests.Timeout as e:
        logger.warning(f"Retell LLM synchronous timeout: {str(e)}")
    except requests.RequestException as e:
        logger.error(f"Retell LLM synchronous error: {str(e)}")

    # Fall back to async httpx with retries
    logger.info("Falling back to async httpx for Retell LLM...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(3):
            try:
                response = await client.post(
                    f"{RETELL_BASE_URL}/create-retell-llm",
                    json=payload,
                    headers=headers,
                )
                logger.info(f"Retell LLM response status: {response.status_code}")
                if response.status_code not in [200, 201]:
                    logger.error(f"Retell LLM error response: {response.text}")
                response.raise_for_status()
                return response.json()["llm_id"]
            except httpx.ConnectTimeout as e:
                logger.warning(
                    f"Retell LLM attempt {attempt + 1} failed: ConnectTimeout - {str(e)}"
                )
                if attempt == 2:
                    logger.error(f"All attempts to create Retell LLM failed: {str(e)}")
                    raise HTTPException(
                        status_code=503, detail=f"Failed to create Retell LLM: {str(e)}"
                    )
                await asyncio.sleep(2)
            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Retell LLM HTTP error: {e.response.status_code} - {e.response.text}"
                )
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Retell LLM API error: {e.response.text}",
                )
            except Exception as e:
                logger.error(f"Unexpected error in Retell LLM creation: {str(e)}")
                raise HTTPException(
                    status_code=500, detail=f"Unexpected error in Retell LLM: {str(e)}"
                )


async def call_retell_api(payload: dict) -> dict:
    if not RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="Retell API key not configured")
    headers = {
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json",
    }
    logger.info(
        f"Sending Retell request with headers: {headers['Authorization'][:15]}..."
    )
    logger.info(f"Retell request payload: {payload}")

    # Try synchronous request with requests library
    logger.info("Attempting synchronous request with requests library...")
    try:
        response = requests.post(
            f"{RETELL_BASE_URL}/create-agent", json=payload, headers=headers, timeout=30
        )
        logger.info(f"Requests response status: {response.status_code}")
        if response.status_code not in [200, 201]:
            logger.error(f"Requests error response: {response.text}")
        response.raise_for_status()
        return response.json()
    except requests.Timeout as e:
        logger.warning(f"Synchronous requests timeout: {str(e)}")
    except requests.RequestException as e:
        logger.error(f"Synchronous requests error: {str(e)}")

    # Fall back to async httpx
    logger.info("Falling back to async httpx request...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(3):
            try:
                response = await client.post(
                    f"{RETELL_BASE_URL}/create-agent", json=payload, headers=headers
                )
                logger.info(f"Retell response status: {response.status_code}")
                if response.status_code not in [200, 201]:
                    logger.error(f"Retell error response: {response.text}")
                response.raise_for_status()
                return response.json()
            except httpx.ConnectTimeout as e:
                logger.warning(
                    f"Retell attempt {attempt + 1} failed: ConnectTimeout - {str(e)}"
                )
                if attempt == 2:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Failed to connect to Retell API: {str(e)}",
                    )
                await asyncio.sleep(2)
            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Retell HTTP error: {e.response.status_code} - {e.response.text}"
                )
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Retell API error: {e.response.text}",
                )
            except Exception as e:
                logger.error(f"Unexpected error in Retell API call: {str(e)}")
                raise HTTPException(
                    status_code=500, detail=f"Unexpected error in Retell API: {str(e)}"
                )


def map_to_vapi_params(request: CreateAgentRequest) -> dict:
    supported_languages = ["en", "es", "fr", "de", "it", "ja", "ko", "pt", "zh", "ru"]
    if request.language not in supported_languages:
        raise HTTPException(
            status_code=400, detail=f"Unsupported language: {request.language}"
        )

    if request.voice not in VOICE_MAPPING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported voice: {request.voice}. Supported voices: {list(VOICE_MAPPING.keys())}",
        )

    payload = {
        "name": request.agent_name,
        "voice": {"provider": "azure", "voiceId": VOICE_MAPPING[request.voice]["vapi"]},
        "transcriber": {"provider": "assembly-ai", "language": request.language},
        "firstMessage": request.prompt
        if request.prompt
        else "Hello! How can I help you today?",
        "voicemailMessage": request.voicemail_message,
    }
    return {k: v for k, v in payload.items() if v is not None}


async def map_to_retell_params(request: CreateAgentRequest) -> dict:
    supported_languages = [
    "en-US", "en-GB", "es-ES", "fr-FR", "de-DE", "multi",
    "en-IN", "en-AU", "en-NZ", "es-419", "hi-IN", "fr-CA",
    "ja-JP", "pt-PT", "pt-BR", "zh-CN", "ru-RU", "it-IT",
    "ko-KR", "nl-NL", "pl-PL", "tr-TR", "vi-VN", "ro-RO",
    "bg-BG", "ca-ES", "da-DK", "fi-FI", "el-GR", "hu-HU",
    "id-ID", "no-NO", "sk-SK", "sv-SE"
    ]
    language_mapping = {"en": "en-US", "es": "es-ES", "fr": "fr-FR", "de": "de-DE", "hi": "hi-IN", "ja": "ja-JP", "pt": "pt-PT", "zh": "zh-CN", "ru": "ru-RU", "it": "it-IT", "ko": "ko-KR", "nl": "nl-NL", "pl": "pl-PL", "tr": "tr-TR", "vi": "vi-VN", "ro": "ro-RO", "bg": "bg-BG", "ca": "ca-ES", "da": "da-DK", "fi": "fi-FI", "el": "el-GR", "hu": "hu-HU", "id": "id-ID", "no": "no-NO", "sk": "sk-SK", "sv": "sv-SE"}
    retell_language = language_mapping.get(request.language, "en-US")

    if retell_language not in supported_languages:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language for Retell: {request.language}",
        )

    if request.voice not in VOICE_MAPPING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported voice: {request.voice}. Supported voices: {list(VOICE_MAPPING.keys())}",
        )

    # Create a new Retell LLM if prompt or retell_llm_config is provided
    llm_id = "llm_587545622cc03980ff4c957e794a"  # Default llm_id
    if request.prompt or request.retell_llm_config:
        try:
            llm_id = await create_retell_llm(request.prompt, request.retell_llm_config)
        except Exception as e:
            logger.warning(
                f"Falling back to default llm_id due to LLM creation failure: {str(e)}"
            )
            llm_id = "llm_587545622cc03980ff4c957e794a"  # Fallback to default

    payload = {
        "voice_id": VOICE_MAPPING[request.voice]["retell"],
        "agent_name": request.agent_name,
        "language": retell_language,
        "voicemail_message": request.voicemail_message,
        "response_engine": {"type": "retell-llm", "llm_id": llm_id},
    }
    return {k: v for k, v in payload.items() if v is not None}


@app.post("/create-agent", response_model=CreateAgentResponse)
async def create_agent(request: CreateAgentRequest):
    """Create an AI agent using Vapi or Retell AI based on platform."""
    if request.platform not in ["vapi", "retell"]:
        raise HTTPException(
            status_code=400, detail="Invalid platform. Use 'vapi' or 'retell'."
        )

    if request.platform == "vapi":
        if not VAPI_API_KEY:
            raise HTTPException(status_code=500, detail="Vapi API key not configured")
        payload = map_to_vapi_params(request)
        response = await call_vapi_api(payload)
        return CreateAgentResponse(
            agent_id=response["id"],
            agent_name=response.get("name"),
            voice=request.voice,
            language=response["transcriber"]["language"],
        )
    else:  # retell
        if not RETELL_API_KEY:
            raise HTTPException(status_code=500, detail="Retell API key not configured")
        payload = await map_to_retell_params(request)
        response = await call_retell_api(payload)
        return CreateAgentResponse(
            agent_id=response["agent_id"],
            agent_name=response.get("agent_name"),
            voice=request.voice,
            language=response["language"],
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
