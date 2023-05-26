import requests
from PIL import Image
import io
from dotenv import load_dotenv
import os
import aiohttp
import asyncio

load_dotenv()

min_long = -70.0732
min_lat = 45.074
max_long = -70.0494
max_lat = 45.0852

size_x = 300
size_y = 200

user = "woodjosh256"
map_url_token = "clgsi8rgf004d01qndd9p6z2r"
mapbox_api_key = os.getenv('MAPBOX_API_KEY')


async def get_response():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"https://api.mapbox.com/styles/v1/{user}/{map_url_token}/static/[{min_long},{min_lat},"
                               f"{max_long},{max_lat}]/{size_x}x{size_y}?access_token={mapbox_api_key}") as resp:
            a = io.BytesIO(await resp.read())
            image = Image.open(a)
            return image

test = asyncio.run(get_response())
test.show()
