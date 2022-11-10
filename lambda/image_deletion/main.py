import boto3
import os
import urllib.parse


PHOTO_TABLE = os.environ.get("photo_table")
PHOTO_BUCKET = os.environ.get("photo_bucket")
PHOTO_ASSETS_BUCKET = os.environ.get("photo_assets_bucket")
TMP_DIR = "/tmp"
RESIZE_WIDTHS = [300, 768, 1280]

s3_resource = boto3.resource("s3")
s3_client = boto3.client("s3")
dynamo_client = boto3.client("dynamodb")


def delete_dynamo_item(key):
    dynamo_client.delete_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
    )


def delete_resized_images(key):
    for width in RESIZE_WIDTHS:
        s3_client.delete_object(Bucket=PHOTO_ASSETS_BUCKET, Key=f"{width}/{key}")


def lambda_handler(event, context):
    print(event)

    # Get the object from the event and show its content type
    key = urllib.parse.unquote_plus(
        event["Records"][0]["s3"]["object"]["key"], encoding="utf-8"
    )

    delete_resized_images(key)
    delete_dynamo_item(key)
