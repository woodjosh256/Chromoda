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
    table = dynamodb.Table('orderTable-production')

    query_params = event["queryStringParameters"]
    try:
        print_id = query_params["print_id"]
        order_id = query_params["order_id"]
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
        location_icon = str(query_params["locationIcon"])
        location_color = str(query_params["locationColor"])
        location_x = Decimal(query_params["location_x"]) if query_params["location_x"] != "null" else None
        location_y = Decimal(query_params["location_y"]) if query_params["location_y"] != "null" else None
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
                "orderId": order_id,
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
                "locationIcon": location_icon,
                "locationColor": location_color,
                "location_x": location_x,
                "location_y": location_y
            }
        )
    except ClientError as e:
        print(e)
        return _500({"Error": "Error adding item to DynamoDB"})

    return _200({"Success": "Item added successfully"})

# url?print_id=1243&order_id=125153&tl_lon=123&tl_lat=15151