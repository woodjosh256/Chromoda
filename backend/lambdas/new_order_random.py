import string
from random import random

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
    table = dynamodb.Table('availableDrybagOrders-production')

    # generate random string 30 characters long
    print_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=30))

    try:
        table.put_item(
            Item={
                "printId": print_id,
            }
        )
    except ClientError as e:
        print(e)
        return _500({"Error": "Error adding item to DynamoDB"})

    return _200({
        "print_id": print_id,
        "url": f"https://acromodapacks.com/{print_id}"
    })

# GET https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/generateTopo?
#     tl_lon=-94.9213&tl_lat=49.4823&tr_lon=-73.7544&tr_lat=49.4822&bl_lon=-94.9214&bl_lat=39.4275&br_lon=-73.7545&
#     br_lat=39.4274&lines=25&lines=25&width=1000

# the url for this lambda is: https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/saveOrder
# this is a url with query parameters filled out for testing purposes:
# https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/saveOrder?print_id=123&tl_lon=-94.9213&tl_lat=49.4823&tr_lon=-73.7544&tr_lat=49.4822&bl_lon=-94.9214&bl_lat=39.4275&br_lon=-73.7545&br_lat=39.4274&color_a=FFFFFF&color_b=FF0000&gradient=true&secondary=true&text=hello&coordinates=true
