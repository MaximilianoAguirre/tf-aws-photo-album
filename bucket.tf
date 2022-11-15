########################################################
# PHOTO BUCKET
########################################################
module "photo_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}photo-bucket-"
  acl           = "private"
  tags          = var.tags
  force_destroy = true
}

module "photo_assets_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}photo-assets-bucket-"
  acl           = "private"
  tags          = var.tags
  force_destroy = true
}

########################################################
# WEBPAGE BUCKET
########################################################
module "web_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}web-host-bucket-"
  acl           = "private"
  tags          = var.tags
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
# WEBPAGE S3 OBJECTS
########################################################
locals {
  mime_types          = jsondecode(file("${path.module}/util/mime.json"))
  frontend_build_path = "${path.module}/frontend/build"

  frontend_config = <<EOF
var config = {
    "AWS_REGION": "${data.aws_region.current.name}",
    "DYNAMO_TABLE": "${aws_dynamodb_table.photo_tracker.id}",
    "PHOTO_BUCKET": "${module.photo_bucket.s3_bucket_id}",
    "PHOTO_ASSETS_BUCKET": "${module.photo_assets_bucket.s3_bucket_id}",
    "COGNITO_IDENTITY_POOL": "${aws_cognito_identity_pool.identitypool.id}",
    "COGNITO_USER_POOL": "${aws_cognito_user_pool.pool.id}",
    "COGNITO_USER_POOL_WEB_CLIENT": "${aws_cognito_user_pool_client.poolclient.id}"
}
EOF
}

resource "local_file" "react_config_dev" {
  filename = "${path.module}/frontend/public/config.js"
  content  = local.frontend_config
}

resource "aws_s3_object" "static_frontend_objects" {
  for_each = fileset(local.frontend_build_path, "**")

  bucket       = module.web_bucket.s3_bucket_id
  key          = each.key
  source       = "${local.frontend_build_path}/${each.key}"
  etag         = filemd5("${local.frontend_build_path}/${each.key}")
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.value), null)
}

resource "aws_s3_object" "static_frontend_config_file" {
  bucket       = module.web_bucket.s3_bucket_id
  key          = "config.js"
  content      = local.frontend_config
  etag         = md5(local.frontend_config)
  content_type = "application/json"
}
