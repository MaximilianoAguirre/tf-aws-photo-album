########################################################
# PHOTO BUCKET
########################################################
module "photo_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}photos-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

resource "aws_s3_access_point" "lambda_endpoint" {
  bucket = module.photo_bucket.s3_bucket_id
  name   = "${local.dash_prefix}cloudfront-lambda"
}

resource "aws_s3control_access_point_policy" "lambda_endpoint" {
  access_point_arn = aws_s3_access_point.lambda_endpoint.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "s3:*"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Resource = [
        aws_s3_access_point.lambda_endpoint.arn,
        "${aws_s3_access_point.lambda_endpoint.arn}/object/*"
      ]
      Condition = {
        "ForAnyValue:StringEquals" = {
          "aws:CalledVia" = "s3-object-lambda.amazonaws.com"
        }
      }
    }]
  })
}

resource "awscc_s3objectlambda_access_point" "lambda_endpoint" {
  name = "${local.dash_prefix}cloudfront-object-lambda2"

  lifecycle {
    ignore_changes = [
      object_lambda_configuration
    ]
  }

  object_lambda_configuration = {
    supporting_access_point = aws_s3_access_point.lambda_endpoint.arn

    transformation_configurations = [
      {
        actions = ["GetObject"]

        content_transformation = {
          aws_lambda = {
            function_arn = module.image_processor_cloudfront.lambda_function_arn
          }
        }
      }
    ]
  }
}

resource "aws_s3control_object_lambda_access_point_policy" "lambda_endpoint" {
  name = awscc_s3objectlambda_access_point.lambda_endpoint.name

  policy = jsonencode({
    Version = "2008-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3-object-lambda:Get*"
      Resource = awscc_s3objectlambda_access_point.lambda_endpoint.arn

      Principal = {
        Service = "cloudfront.amazonaws.com"
      }

      Condition = {
        StringEquals = {
          "aws:SourceArn" = aws_cloudfront_distribution.frontend_cloudfront.arn
        }
      }
    }]
  })
}

resource "aws_s3_bucket_policy" "photo_bucket" {
  bucket = module.photo_bucket.s3_bucket_id

  policy = templatefile("${path.module}/iam/cloudfront_bucket_access.json", {
    cloudfront_distribution = aws_cloudfront_distribution.frontend_cloudfront.arn
    bucket                  = module.photo_bucket.s3_bucket_id
    account                 = data.aws_caller_identity.current.account_id
  })
}

resource "aws_s3_bucket_cors_configuration" "photo_bucket" {
  bucket = module.photo_bucket.s3_bucket_id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "HEAD", "GET", "DELETE"]
    allowed_origins = concat(["https://${local.dns}"], var.enable_dev ? ["http://localhost"] : [])
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Triggers
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
# ASSETS BUCKET
########################################################
module "photo_assets_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}assets-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "photo_assets_bucket" {
  bucket = module.photo_assets_bucket.s3_bucket_id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "HEAD", "GET", "DELETE"]
    allowed_origins = concat(["https://${local.dns}"], var.enable_dev ? ["http://localhost"] : [])
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

########################################################
# WEBPAGE HOST BUCKET
########################################################
module "web_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}web-host-"
  acl           = "private"
  tags          = local.tags
  force_destroy = true
}

resource "aws_s3_bucket_policy" "web_bucket_policy" {
  bucket = module.web_bucket.s3_bucket_id

  policy = templatefile("${path.module}/iam/cloudfront_bucket_access.json", {
    cloudfront_distribution = aws_cloudfront_distribution.frontend_cloudfront.arn
    bucket                  = module.web_bucket.s3_bucket_id
    account                 = data.aws_caller_identity.current.account_id
  })
}

########################################################
# WEBPAGE BUILD BUCKET
########################################################
module "web_build_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket_prefix = "${local.dash_prefix}web-build-"
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
# FRONTEND CONFIGURATION FILE
########################################################
locals {
  frontend_config_dev = templatefile("${path.module}/config/config.js", {
    aws_region                   = data.aws_region.current.name
    dynamo_table                 = aws_dynamodb_table.photo_tracker.id
    photo_bucket                 = module.photo_bucket.s3_bucket_id
    photo_assets_bucket          = module.photo_assets_bucket.s3_bucket_id
    cognito_identity_pool        = aws_cognito_identity_pool.identitypool.id
    cognito_user_pool            = aws_cognito_user_pool.pool.id
    cognito_user_pool_web_client = aws_cognito_user_pool_client.poolclient.id
    dev                          = "true"
  })

  frontend_config_prod = templatefile("${path.module}/config/config.js", {
    aws_region                   = data.aws_region.current.name
    dynamo_table                 = aws_dynamodb_table.photo_tracker.id
    photo_bucket                 = module.photo_bucket.s3_bucket_id
    photo_assets_bucket          = module.photo_assets_bucket.s3_bucket_id
    cognito_identity_pool        = aws_cognito_identity_pool.identitypool.id
    cognito_user_pool            = aws_cognito_user_pool.pool.id
    cognito_user_pool_web_client = aws_cognito_user_pool_client.poolclient.id
    dev                          = "false"
  })
}

resource "local_file" "react_config_dev" {
  count = var.enable_dev ? 1 : 0

  filename = "${path.module}/frontend/public/config.js"
  content  = local.frontend_config_dev
}

resource "aws_s3_object" "static_frontend_config_file" {
  bucket       = module.web_bucket.s3_bucket_id
  key          = "config.js"
  content      = local.frontend_config_prod
  etag         = md5(local.frontend_config_prod)
  content_type = "application/javascript"
  tags         = local.tags
}
