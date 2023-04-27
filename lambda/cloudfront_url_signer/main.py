import boto3
import os
from datetime import datetime, timedelta
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner

CERT_SECRET = os.environ.get("cert_secret")
KEY_ID = os.environ.get("key_id")
BASE_URL = os.environ.get("base_url")
TMP_FILE = "/tmp/key.pem"

secretsmanager_client = boto3.client("secretsmanager")

# https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/cloudfront.html#generate-a-signed-url-for-amazon-cloudfront
def rsa_signer(message):
    with open(TMP_FILE, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(), password=None, backend=default_backend()
        )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


def save_key(key):
    with open(TMP_FILE, "w+") as f:
        f.writelines(key)
        f.close()


cloudfront_signer = CloudFrontSigner(KEY_ID, rsa_signer)
key = secretsmanager_client.get_secret_value(
    SecretId=CERT_SECRET,
)
save_key(key["SecretString"])


def lambda_handler(event, context):
    s3_object = event.get("s3_object")
    validity = event.get("validity", 1)
    signed_url = cloudfront_signer.generate_presigned_url(
        f"{BASE_URL}/{s3_object}",
        date_less_than=datetime.now() + timedelta(hours=validity),
    )

    return signed_url
