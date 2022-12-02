import boto3
import os
import urllib.parse


PHOTO_TABLE = os.environ.get("photo_table")
PHOTO_BUCKET = os.environ.get("photo_bucket")
PHOTO_ASSETS_BUCKET = os.environ.get("photo_assets_bucket")
REKOGNITION_COLLECTION = os.environ.get("rekognition_collection_id")
TMP_DIR = "/tmp"
RESIZE_WIDTHS = [300, 768, 1280]

s3_resource = boto3.resource("s3")
s3_client = boto3.client("s3")
dynamo_client = boto3.client("dynamodb")
rekognition_client = boto3.client("rekognition")


def delete_dynamo_item(key):
    dynamo_client.delete_item(
        TableName=PHOTO_TABLE,
        Key={"PK": {"S": f"#S3#{key}"}, "SK": {"S": "#METADATA"}},
    )


def delete_faces(key):
    query = dynamo_client.query(
        TableName=PHOTO_TABLE,
        KeyConditionExpression="PK=:PK AND begins_with(SK, :SK)",
        ExpressionAttributeValues={":PK": {"S": f"#S3#{key}"}, ":SK": {"S": "#FACE"}},
    )

    rekognition_client.delete_faces(
        CollectionId=REKOGNITION_COLLECTION,
        FaceIds=list(map(lambda x: x["SK"]["S"].replace("#FACE#", ""), query["Items"])),
    )

    for face in query["Items"]:
        dynamo_client.delete_item(
            TableName=PHOTO_TABLE,
            Key={"PK": face["PK"], "SK": face["SK"]},
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
    delete_faces(key)
    delete_dynamo_item(key)
