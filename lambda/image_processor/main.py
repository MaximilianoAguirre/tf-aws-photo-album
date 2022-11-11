import blurhash
import boto3
import os
import urllib.parse
import pygeohash as pgh

from PIL import Image as pil_image, ImageOps
from exif import Image as exif_image
from pathlib import Path
from datetime import datetime

PHOTO_TABLE = os.environ.get("photo_table")
PHOTO_BUCKET = os.environ.get("photo_bucket")
PHOTO_ASSETS_BUCKET = os.environ.get("photo_assets_bucket")
TMP_DIR = "/tmp"
RESIZE_WIDTHS = [100, 300, 768, 1280]

s3_resource = boto3.resource("s3")
s3_client = boto3.client("s3")
dynamo_client = boto3.client("dynamodb")


def create_dynamo_item(key):
    dynamo_client.update_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
    )


def set_image_size_and_date(image, key):
    # Get date
    img = pil_image.open(image)
    img_date = img._getexif()[36867]
    img_timestamp = datetime.strptime(img_date, "%Y:%m:%d %H:%M:%S").strftime("%s")

    # Get size
    img = ImageOps.exif_transpose(img)
    width, height = img.size

    # Update dynamoDB item
    dynamo_client.update_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
        UpdateExpression=f"SET width = :width, height = :height, #timestamp = :timestamp",
        ExpressionAttributeValues={
            ":width": {"N": str(width)},
            ":height": {"N": str(height)},
            ":timestamp": {"N": str(img_timestamp)},
        },
        ExpressionAttributeNames={"#timestamp": "timestamp"},
    )

    return width, height


def create_resized_images(image, key, content_type):
    img = pil_image.open(image)
    img = ImageOps.exif_transpose(img)
    width, height = img.size

    new_widths = [size for size in RESIZE_WIDTHS if size < width]

    for new_width in new_widths:
        new_height = round((new_width / width) * height)
        resized_img = img.resize((new_width, new_height), pil_image.ANTIALIAS)
        Path(f"{TMP_DIR}/{new_width}").mkdir(parents=True, exist_ok=True)
        resized_img.save(f"{TMP_DIR}/{new_width}/{key}", quality=95, optimize=True)

        s3_resource.Bucket(PHOTO_ASSETS_BUCKET).upload_file(
            f"{TMP_DIR}/{new_width}/{key}",
            f"{new_width}/{key}",
            ExtraArgs={"ContentType": content_type},
        )

    # Update dynamoDB item
    dynamo_client.update_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
        UpdateExpression=f"SET resized = :resized",
        ExpressionAttributeValues={":resized": {"BOOL": True}},
    )


def set_blurhash(image, key):
    # Calculate blurhash
    hash = blurhash.encode(image, x_components=4, y_components=3)

    # Update dynamoDB item
    dynamo_client.update_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
        UpdateExpression=f"SET blurhash = :b",
        ExpressionAttributeValues={":b": {"S": hash}},
    )

    return hash


def decimal_coords(coords, ref):
    decimal_degrees = coords[0] + coords[1] / 60 + coords[2] / 3600
    if ref == "S" or ref == "W":
        decimal_degrees = -decimal_degrees
    return decimal_degrees


def set_image_geohash(image, key):
    img = exif_image(image)

    if img.has_exif:
        try:
            latitude, longitude = (
                decimal_coords(img.gps_latitude, img.gps_latitude_ref),
                decimal_coords(img.gps_longitude, img.gps_longitude_ref),
            )

            geohash = pgh.encode(latitude=latitude, longitude=longitude)

            # Update dynamoDB item
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
                UpdateExpression=f"SET latitude = :latitude, longitude = :longitude, geohash = :geohash",
                ExpressionAttributeValues={
                    ":latitude": {"N": str(latitude)},
                    ":longitude": {"N": str(longitude)},
                    ":geohash": {"S": geohash},
                },
            )

            return geohash, latitude, longitude

        except Exception as e:
            print("No coordinates")
            print(e)
    else:
        print("The Image has no EXIF information")


def set_object_type(key):
    metadata = s3_client.head_object(Bucket=PHOTO_BUCKET, Key=key)
    content_type = metadata.get("ContentType", "")

    # Update dynamoDB item
    dynamo_client.update_item(
        TableName=PHOTO_TABLE,
        Key={"hash_key": {"S": key}, "range_key": {"S": "image"}},
        UpdateExpression=f"SET content_type = :content_type",
        ExpressionAttributeValues={":content_type": {"S": content_type}},
    )

    return content_type


def lambda_handler(event, context):
    print(event)

    # Get the object from the event and show its content type
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = urllib.parse.unquote_plus(
        event["Records"][0]["s3"]["object"]["key"], encoding="utf-8"
    )

    # Create base item in dynamoDB
    create_dynamo_item(key)
    content_type = set_object_type(key)

    # Download image
    tmp_image = f"{TMP_DIR}/{key}"
    s3_client.download_file(bucket, key, tmp_image)

    # Set image size
    set_image_size_and_date(tmp_image, key)

    # Set image blurhash
    set_blurhash(tmp_image, key)

    # Create resized images
    create_resized_images(tmp_image, key, content_type)

    # Set image geohash
    set_image_geohash(tmp_image, key)
