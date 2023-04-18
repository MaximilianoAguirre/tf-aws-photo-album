########################################################
# PHOTO BUCKET
########################################################
module "photo_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}photo-bucket-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

module "photo_assets_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}photo-assets-bucket-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

########################################################
# PHOTO BUCKET TRIGGERS
########################################################
resource "aws_s3_bucket_notification" "s3_triggers" {
  bucket = module.photo_bucket.s3_bucket_id

  topic {
    topic_arn = aws_sns_topic.photo_album_create.arn
    events    = ["s3:ObjectCreated:*"]
  }

  lambda_function {
    lambda_function_arn = module.image_deletion.lambda_function_arn
    events              = ["s3:ObjectRemoved:*"]
  }
}

########################################################
# WEBPAGE HOST BUCKET
########################################################
module "web_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}web-host-bucket-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

resource "aws_s3_bucket_policy" "web_bucket_policy" {
  bucket = module.web_bucket.s3_bucket_id

  policy = templatefile("${path.module}/iam/web_bucket_policy.json", {
    cloudfront_oai = aws_cloudfront_origin_access_identity.photo_album.iam_arn
    bucket_arn     = module.web_bucket.s3_bucket_arn
  })
}

########################################################
# WEBPAGE BUILD BUCKET
########################################################
module "web_build_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}web-build-bucket-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
  versioning    = { status = true }
}

data "archive_file" "frontend_source" {
  type        = "zip"
  source_dir  = "${path.module}/frontend"
  output_path = "${path.module}/builds/frontend.zip"
  excludes    = ["public/config.js", "frontend.zip", "node_modules", "build"]
}

resource "aws_s3_object" "frontend_build_source" {
  bucket       = module.web_build_bucket.s3_bucket_id
  source       = data.archive_file.frontend_source.output_path
  source_hash  = data.archive_file.frontend_source.output_base64sha256
  key          = "frontend.zip"
  content_type = "application/zip"
  tags         = local.tags
}

########################################################
# WEBPAGE HOST S3 OBJECTS
########################################################
locals {
  mime_types          = jsondecode(file("${path.module}/util/mime.json"))
  frontend_build_path = "${path.module}/frontend/build"

  frontend_config = templatefile("${path.module}/config/config.js", {
    aws_region                   = data.aws_region.current.name
    dynamo_table                 = aws_dynamodb_table.photo_tracker.id
    photo_bucket                 = module.photo_bucket.s3_bucket_id
    photo_assets_bucket          = module.photo_assets_bucket.s3_bucket_id
    cognito_identity_pool        = aws_cognito_identity_pool.identitypool.id
    cognito_user_pool            = aws_cognito_user_pool.pool.id
    cognito_user_pool_web_client = aws_cognito_user_pool_client.poolclient.id
  })
}

resource "local_file" "react_config_dev" {
  count = var.create_dev_config_file ? 1 : 0

  filename = "${path.module}/frontend/public/config.js"
  content  = local.frontend_config
}

resource "aws_s3_object" "static_frontend_config_file" {
  bucket       = module.web_bucket.s3_bucket_id
  key          = "config.js"
  content      = local.frontend_config
  etag         = md5(local.frontend_config)
  content_type = "application/javascript"
  tags         = local.tags
}
