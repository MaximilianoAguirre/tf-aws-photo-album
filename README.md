# AWS S3 PHOTO ALBUM

This is a terraform module that deploys an end to end solution to host and consume your photos using AWS resources. The main resources deployed are:

- A bucket to host original photos
- A separate bucket to store assets, like miniature versions of your photos
- Serverless resources to process photos
  - Currently, photos are processed in order to get:
    - Geohash
    - Blurhash
    - Scaled versions of the photos
    - Date
    - Type
    - People in images (using AWS Rekognition)
- A DynamoDB table to track photos and properties
  - The table is designed to optimize queries
- Cognito services to manage access to your photos
- S3 bucket with a cloudfront distribution to host the app
  - A pipeline to build the frontend code fron the source code
  - An asynchronych process to rerun the pipeline if a new version of the module is applied

## Architecture diagram

![Architecture diagram](images/Diagram.drawio.svg)

## Usage

### Simple use case
```hcl
module "photo_album" {
  source = "git@github.com:MaximilianoAguirre/tf-aws-photo-album"

  prefix    = "simple"
  root_user = "example@mail.com"
}
```

### Using a domain alias (requires a valid public hosted zone in the same AWS account)
```hcl
module "photo_album_with_alias" {
  source = "git@github.com:MaximilianoAguirre/tf-aws-photo-album"

  prefix                 = "aliased"
  root_user              = "example@mail.com"
  route53_public_zone_id = "Z033333533Z6TUWXW57H5"
}
```
