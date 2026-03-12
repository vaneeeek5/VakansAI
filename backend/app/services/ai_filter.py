import openai
import os
import json
import asyncio

class AIFilter:
    def __init__(self, api_key: str, base_url: str, model: str):
        self._client = openai.AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        self.semaphore = asyncio.Semaphore(10) # 10 requests per minute limit

    async def filter_vacancy(self, topic_ai_description: str, message_text: str):
        async with self.semaphore:
            prompt = f"""
Ты HR-фильтр вакансий. Тебе дают текст сообщения из Telegram-канала и описание нужных вакансий.

Описание нужных вакансий: {topic_ai_description}

Сообщение:
{message_text}

Ответь строго в формате JSON без markdown:
{{
  "is_vacancy": true/false,
  "is_suitable": true/false,
  "topic": "название тематики или null",
  "reason": "краткое объяснение на русском"
}}

is_vacancy — является ли сообщение вакансией вообще
is_suitable — подходит ли под описание нужных вакансий
"""
            try:
                response = await self._client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "system", "content": "You are a professional HR assistant."}, 
                             {"role": "user", "content": prompt}],
                    response_format={ "type": "json_object" }
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                print(f"AI Filter Error: {e}")
                return None
            finally:
                await asyncio.sleep(6) # To stay within 10 requests per minute
