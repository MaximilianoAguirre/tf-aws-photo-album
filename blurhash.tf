########################################################
# BLURHASH
########################################################
resource "aws_lambda_layer_version" "python38_blurhash" {
  layer_name          = "blurhash-layer"
  filename            = "${path.module}/lambda_layers/blurhash/blurhash.zip"
  source_code_hash    = filebase64sha256("${path.module}/lambda_layers/blurhash/blurhash.zip")
  compatible_runtimes = ["python3.8"]
}

module "blurhash_lambda" {
  source = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name            = "blurhash_lambda"
  description              = "Lambda to add blurhash tag to s3 image objects"
  handler                  = "main.lambda_handler"
  runtime                  = "python3.8"
  source_path              = "${path.module}/lambda/blurhash"
  publish                  = true
  layers                   = [aws_lambda_layer_version.python38_blurhash.arn]
  artifacts_dir            = "${path.module}/builds"
  recreate_missing_package = false
  attach_policy_statements = true
  timeout                  = 120
  memory_size              = 512

  allowed_triggers = {
    BucketTrigger = {
      principal  = "s3.amazonaws.com"
      source_arn = module.photo_bucket.s3_bucket_arn
    }
  }

  policy_statements = {
    s3_read = {
      effect    = "Allow"
      actions   = ["s3:GetObject", "s3:GetObjectTagging", "s3:PutObjectTagging"]
      resources = ["${module.photo_bucket.s3_bucket_arn}/*"]
    }

    dynamodb = {
      effect    = "Allow"
      actions   = ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query", "dynamodb:UpdateItem"]
      resources = [aws_dynamodb_table.photo_info_table.arn]
    }
  }
}

resource "aws_s3_bucket_notification" "blurhash_trigger" {
  depends_on = [module.blurhash_lambda]

  bucket = module.photo_bucket.s3_bucket_id

  lambda_function {
    lambda_function_arn = module.blurhash_lambda.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }
}
