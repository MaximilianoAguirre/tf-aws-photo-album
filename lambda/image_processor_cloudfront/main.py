import io
import boto3
from urllib.request import urlopen, HTTPError
from PIL import Image

from urllib.parse import urlparse, parse_qs

s3 = boto3.client('s3')

def lambda_handler(event, context):
    print(event)

    object_get_context = event['getObjectContext']
    request_route = object_get_context['outputRoute']
    request_token = object_get_context['outputToken']
    s3_url = object_get_context['inputS3Url']

    # Get object from S3
    try:
        original_image = Image.open(urlopen(s3_url))
    except HTTPError as err:
        s3.write_get_object_response(
            StatusCode=err.code,
            ErrorCode='HTTPError',
            ErrorMessage=err.reason,
            RequestRoute=request_route,
            RequestToken=request_token)
        return

    # Get width and height from query parameters
    user_request = event['userRequest']
    url = user_request['url']
    parsed_url = urlparse(url)
    query_parameters = parse_qs(parsed_url.query)

    try:
        width, height = int(query_parameters['w'][0]), int(query_parameters['h'][0])
    except (KeyError, ValueError):
        width, height = 0, 0

    # Transform object
    if width > 0 and height > 0:
        transformed_image = original_image.resize((width, height), Image.ANTIALIAS)
    else:
        transformed_image = original_image

    transformed_bytes = io.BytesIO()
    transformed_image.save(transformed_bytes, format='JPEG')

    # Write object back to S3 Object Lambda
    s3.write_get_object_response(
        Body=transformed_bytes.getvalue(),
        RequestRoute=request_route,
        RequestToken=request_token)

    return
