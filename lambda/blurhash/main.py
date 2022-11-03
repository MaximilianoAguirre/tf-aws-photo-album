import blurhash
import boto3
import io
import PIL
import urllib.parse

s3_resource = boto3.resource('s3')
s3_client = boto3.client('s3')
dynamo_client = boto3.client('dynamodb')

def lambda_handler(event, context):
    print(event)

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')


    try:
        # Check current tags not containing blurhash
        tags = s3_client.get_object_tagging(
            Bucket=bucket,
            Key=key,
        ).get("TagSet", [])

        # Get and download object
        s3_object = s3_resource.Object(bucket, key)
        image = io.BytesIO()
        s3_object.download_fileobj(image)

        # Get size
        pillow_image = PIL.Image.open(image)
        width,height = pillow_image.size

        # Add size tag
        tags.append({
            'Key': 'size',
            'Value': f"{width}x{height}"
        })

        # Calculate blurhash
        hash = blurhash.encode(image, x_components=4, y_components=3)

        # Add blurhash tag
        tags.append({
            'Key': 'blurhash',
            'Value': hash.encode().hex() # Encode in utf-8 and convert to hex to avoid special characters
        })

        # Set object new tags
        print("New tags: ", tags)
        s3_client.put_object_tagging(
            Bucket=bucket,
            Key=key,    
            Tagging={
                'TagSet': tags
            }
        )

    except Exception as e:
        print(e)
        raise e
