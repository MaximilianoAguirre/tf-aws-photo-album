########################################################
# IMAGE PROCESSOR
########################################################
resource "aws_lambda_layer_version" "python38_image_processor" {
  layer_name          = "${local.dash_prefix}image-processor"
  filename            = "${path.module}/lambda_layers/image_processor/image_processor.zip"
  source_code_hash    = filebase64sha256("${path.module}/lambda_layers/image_processor/image_processor.zip")
  compatible_runtimes = ["python3.8"]
}

module "image_processor" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name            = "${local.dash_prefix}image-processor"
  description              = "Lambda to process new images uploaded to the bucket"
  handler                  = "main.lambda_handler"
  runtime                  = "python3.8"
  source_path              = "${path.module}/lambda/image_processor"
  artifacts_dir            = "${path.module}/builds"
  layers                   = [aws_lambda_layer_version.python38_image_processor.arn]
  publish                  = true
  recreate_missing_package = false
  attach_policy_statements = true
  timeout                  = 120
  memory_size              = 1024

  allowed_triggers = {
    BucketTrigger = {
      principal  = "s3.amazonaws.com"
      source_arn = module.photo_bucket.s3_bucket_arn
    }
  }

  policy_statements = {
    s3_read = {
      effect    = "Allow"
      actions   = ["s3:GetObject", "s3:HeadObject"]
      resources = ["${module.photo_bucket.s3_bucket_arn}/*"]
    }

    s3_write = {
      effect    = "Allow"
      actions   = ["s3:PutObject"]
      resources = ["${module.photo_assets_bucket.s3_bucket_arn}/*"]
    }

    dynamodb = {
      effect    = "Allow"
      actions   = ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query", "dynamodb:UpdateItem"]
      resources = [aws_dynamodb_table.photo_tracker.arn]
    }
  }

  environment_variables = {
    photo_table         = aws_dynamodb_table.photo_tracker.id
    photo_bucket        = module.photo_bucket.s3_bucket_id
    photo_assets_bucket = module.photo_assets_bucket.s3_bucket_id
  }
}

resource "aws_s3_bucket_notification" "image_processor_trigger" {
  bucket = module.photo_bucket.s3_bucket_id

  lambda_function {
    lambda_function_arn = module.image_processor.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }
}
