try:
    import unzip_requirements
except ImportError:
    pass

from typing import Any, Dict

import boto3

from .common.api_responses import _400, _200


def handler(event: Dict[str, Any], context: Any) -> Dict:
    dynamodb = boto3.resource('dynamodb')
    print_orders_table = dynamodb.Table('orderTable-production')

    query_params = event["queryStringParameters"]
    try:
        print_id = query_params["print_id"]
    except Exception as e:
        print(e)
        return _400({"Error": f"Missing params.. {str(e)}"})

    response = print_orders_table.get_item(Key={'printId': print_id})
    if 'Item' not in response:
        return _400({"Error": "printID not found"})
    else:
        return _200(response['Item'])
