try:
    import unzip_requirements
except ImportError:
    pass

from _decimal import Decimal

from botocore.exceptions import ClientError

from typing import Any, Dict
import boto3

from .common.api_responses import _200, _400, _500

def handler(event: Dict[str, Any], context: Any) -> Dict:
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('drybagOrders-production')

    query_params = event["queryStringParameters"]
    """
        - print_id: string
		- bl_lat: float
		- bl_lon: float
		- br_lat: float
		- bl_lon: float
		- tr_lat: float
		- tr_lon: float
		- tl_lat: float
		- tl_lon: float
		- color_a: string
		- color_b: string
		- gradient: bool
		- secondary: bool
		- text: string
		- coordinates: bool
    """
    try:
        print_id = query_params["print_id"]
        tl_lon = Decimal(query_params["tl_lon"])
        tl_lat = Decimal(query_params["tl_lat"])
        tr_lon = Decimal(query_params["tr_lon"])
        tr_lat = Decimal(query_params["tr_lat"])
        bl_lon = Decimal(query_params["bl_lon"])
        bl_lat = Decimal(query_params["bl_lat"])
        br_lon = Decimal(query_params["br_lon"])
        br_lat = Decimal(query_params["br_lat"])
        color_a = query_params["color_a"]
        color_b = query_params["color_b"]
        gradient = query_params["gradient"] == "true"
        secondary = query_params["secondary"] == "true"
        text = str(query_params["text"]) if "text" in query_params else None
        coordinates = query_params["coordinates"] == "true"
    except Exception as e:
        print(e)
        return _400({"Error": f"Missing params.. {str(e)}"})

    try:
        response = table.get_item(Key={'printId': print_id})
        if 'Item' in response:
            return _400({"Error": "printID already exists"})
    except ClientError as e:
        print(e)
        return _500({"Error": "Error accessing DynamoDB"})

    try:
        table.put_item(
            Item={
                "printId": print_id,
                "tl_lon": tl_lon,
                "tl_lat": tl_lat,
                "tr_lon": tr_lon,
                "tr_lat": tr_lat,
                "bl_lon": bl_lon,
                "bl_lat": bl_lat,
                "br_lon": br_lon,
                "br_lat": br_lat,
                "color_a": color_a,
                "color_b": color_b,
                "gradient": gradient,
                "secondary": secondary,
                "text": text,
                "coordinates": coordinates
            }
        )
    except ClientError as e:
        print(e)
        return _500({"Error": "Error adding item to DynamoDB"})

    return _200({"Success": "Item added successfully"})

# GET https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/generateTopo?
#     tl_lon=-94.9213&tl_lat=49.4823&tr_lon=-73.7544&tr_lat=49.4822&bl_lon=-94.9214&bl_lat=39.4275&br_lon=-73.7545&
#     br_lat=39.4274&lines=25&lines=25&width=1000

# the url for this lambda is: https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/saveOrder
# this is a url with query parameters filled out for testing purposes:
# https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/saveOrder?print_id=123&tl_lon=-94.9213&tl_lat=49.4823&tr_lon=-73.7544&tr_lat=49.4822&bl_lon=-94.9214&bl_lat=39.4275&br_lon=-73.7545&br_lat=39.4274&color_a=FFFFFF&color_b=FF0000&gradient=true&secondary=true&text=hello&coordinates=true
