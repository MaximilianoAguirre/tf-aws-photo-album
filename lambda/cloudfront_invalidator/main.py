import boto3
import os
from datetime import datetime

CF_DISTRIBUTION = os.environ.get("cf_distribution")

cloudfront_client = boto3.client("cloudfront")
codepipeline_client = boto3.client("codepipeline")


def lambda_handler(event, context):

    cloudfront_client.create_invalidation(
        DistributionId=CF_DISTRIBUTION,
        InvalidationBatch={
            "Paths": {
                "Quantity": 1,
                "Items": [
                    "/*",
                ],
            },
            "CallerReference": str(round(datetime.now().timestamp())),
        },
    )

    codepipeline_client.put_job_success_result(jobId=event["CodePipeline.job"]["id"])
