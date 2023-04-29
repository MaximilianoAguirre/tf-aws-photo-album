import boto3
import time
import json
import os

from aws_lambda_powertools.utilities.parser.models import S3Model
from aws_lambda_powertools.utilities.parser import parse, envelopes

PHOTO_TABLE = os.environ.get("photo_table")
PHOTO_BUCKET = os.environ.get("photo_bucket")
REKOGNITION_COLLECTION = os.environ.get("rekognition_collection_id")

dynamo_client = boto3.client("dynamodb")
rekognition_client = boto3.client("rekognition")


def process_with_rekognition(key):
    print("Processing image with rekognition")
    response = rekognition_client.index_faces(
        CollectionId=REKOGNITION_COLLECTION,
        Image={"S3Object": {"Bucket": PHOTO_BUCKET, "Name": key}},
        ExternalImageId=key,
    )

    # Iterate faces and process faces found in image
    for face in response["FaceRecords"]:
        face_id = face["Face"]["FaceId"]
        confidence = face["Face"]["Confidence"]
        bounding_box = json.dumps(face["Face"]["BoundingBox"])
        print(f"Face with id {face_id} found")

        # Create a record for the face in the image
        dynamo_client.update_item(
            TableName=PHOTO_TABLE,
            Key={"PK": {"S": f"#S3#{key}"}, "SK": {"S": f"#FACE#{face_id}"}},
            UpdateExpression=f"SET confidence=:confidence, bounding_box=:bounding_box",
            ExpressionAttributeValues={
                ":confidence": {"S": str(confidence)},
                ":bounding_box": {"S": bounding_box},
            },
        )

        # Wait a couple of seconds to allow Rekognition to process the face
        time.sleep(2)
        # Find which person this face belongs to
        match = rekognition_client.search_faces(
            CollectionId=REKOGNITION_COLLECTION, MaxFaces=1, FaceId=face_id
        ).get("FaceMatches")

        if len(match) > 0:
            # If there is a match, find person definition for the match
            print(
                f"Found a match for face {face_id} with id: {match[0]['Face']['FaceId']}"
            )
            person = dynamo_client.query(
                TableName=PHOTO_TABLE,
                IndexName="inverted",
                KeyConditionExpression="begins_with(PK,:PK) AND SK=:SK",
                ExpressionAttributeValues={
                    ":PK": {"S": "#PERSON"},
                    ":SK": {"S": f"#FACE#{match[0]['Face']['FaceId']}"},
                },
            ).get("Items")[0]
            print(f"Person associated with match is: {person.get('PK').get('S')}")

            # Update person number of appearances
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={"PK": person.get("PK"), "SK": {"S": "#METADATA"}},
                UpdateExpression=f"SET GSI2SK = GSI2SK + :GSI2SK",
                ExpressionAttributeValues={
                    ":GSI2SK": {"N": "1"},
                },
            )

            # Update face record with person information (for GSI1)
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={"PK": {"S": f"#S3#{key}"}, "SK": {"S": f"#FACE#{face_id}"}},
                UpdateExpression=f"SET GSI1PK=:GSI1PK, GSI1SK=:GSI1SK",
                ExpressionAttributeValues={
                    ":GSI1PK": person.get("PK"),
                    ":GSI1SK": {"S": f"#S3#{key}"},
                },
            )

            # Create a record for the face in the person
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={
                    "PK": person.get("PK"),
                    "SK": {"S": f"#FACE#{face_id}"},
                },
                UpdateExpression=f"SET confidence=:confidence",
                ExpressionAttributeValues={
                    ":confidence": {"S": str(match[0]["Face"]["Confidence"])},
                },
            )

        else:
            # If not matches, create new person
            # Set metadata record and record to link with face id
            # Use face ID as Person ID
            # Use confidence = 100
            print("Match not found, creating new person")
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={"PK": {"S": f"#PERSON#{face_id}"}, "SK": {"S": "#METADATA"}},
                UpdateExpression=f"SET #name=:name, GSI2PK=:GSI2PK, GSI2SK=:GSI2SK",
                ExpressionAttributeValues={
                    ":name": {"S": face_id},
                    ":GSI2PK": {"S": "#APPEARANCES"},
                    ":GSI2SK": {"N": "1"},
                },
                ExpressionAttributeNames={"#name": "name"},
            )

            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={
                    "PK": {"S": f"#PERSON#{face_id}"},
                    "SK": {"S": f"#FACE#{face_id}"},
                },
                UpdateExpression=f"SET confidence=:confidence",
                ExpressionAttributeValues={
                    ":confidence": {"S": str(100)},
                },
            )

            # Update face record with person information (for GSI1)
            dynamo_client.update_item(
                TableName=PHOTO_TABLE,
                Key={"PK": {"S": f"#S3#{key}"}, "SK": {"S": f"#FACE#{face_id}"}},
                UpdateExpression=f"SET GSI1PK=:GSI1PK, GSI1SK=:GSI1SK",
                ExpressionAttributeValues={
                    ":GSI1PK": {"S": f"#PERSON#{face_id}"},
                    ":GSI1SK": {"S": f"#S3#{key}"},
                },
            )


def lambda_handler(event, context):
    print(event)
    parsed_event = parse(model=S3Model, envelope=envelopes.SnsSqsEnvelope, event=event)

    for s3_object in parsed_event[0].Records:
        print(f"Processing image {s3_object.s3.object.key}")
        process_with_rekognition(s3_object.s3.object.key)
