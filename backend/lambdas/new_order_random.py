import random
import string

try:
    import unzip_requirements
except ImportError:
    pass

from botocore.exceptions import ClientError

from typing import Any, Dict
import boto3

from .common.api_responses import _200, _500

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
        "url": f"https://www.acromodapacks.com/{print_id}",
        "internal": f"https://drybag-internal-tool.d1065fsy0rl8xl.amplifyapp.com/{print_id}"
    })
