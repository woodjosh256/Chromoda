try:
    import unzip_requirements
except ImportError:
    pass

from typing import Any, Dict

import boto3

from .common.api_responses import _400, _200


def handler(event: Dict[str, Any], context: Any) -> Dict:
    dynamodb = boto3.resource('dynamodb')
    available_prints_table = dynamodb.Table('availablePrintsTable')
    print_orders_table = dynamodb.Table('orderTable')

    query_params = event["queryStringParameters"]
    try:
        print_id = query_params["print_id"]
    except Exception as e:
        print(e)
        return _400({"Error": f"Missing params.. {str(e)}"})

    try:
        response = available_prints_table.get_item(Key={'printId': print_id})
        if 'Item' not in response:
            return _200({"state": "invalid"})
        else:
            print_order_response = print_orders_table.get_item(Key={'printId': print_id})
            if 'Item' not in print_order_response:
                return _200({"state": "open"})
            else:
                return _200({"state": "closed"})

    except Exception as e:
        print(e)
        return _400({"Error": f"Error accessing DynamoDB.. {str(e)}"})
