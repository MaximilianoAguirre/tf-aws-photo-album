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

  function_name                     = "${local.dash_prefix}image-processor"
  description                       = "Lambda to process new images uploaded to the bucket"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/image_processor"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  publish                           = true
  recreate_missing_package          = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 900 // Max timeout to process images
  memory_size                       = 1024

  layers = [
    aws_lambda_layer_version.python38_image_processor.arn,
    "arn:aws:lambda:${data.aws_region.current.name}:017000801446:layer:AWSLambdaPowertoolsPythonV2:31"
  ]

  allowed_triggers = {
    sns = {
      principal  = "sns.amazonaws.com"
      source_arn = aws_sns_topic.photo_album_create.arn
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
      actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
      resources = [aws_dynamodb_table.photo_tracker.arn, "${aws_dynamodb_table.photo_tracker.arn}/index/*"]
    }
  }

  environment_variables = {
    photo_table               = aws_dynamodb_table.photo_tracker.id
    photo_bucket              = module.photo_bucket.s3_bucket_id
    photo_assets_bucket       = module.photo_assets_bucket.s3_bucket_id
    rekognition_collection_id = aws_cloudformation_stack.rekognition.outputs.collectionId
  }
}

########################################################
# IMAGE PROCESSOR CLOUDFRONT
########################################################
resource "aws_lambda_layer_version" "image_magick" {
  layer_name          = "${local.dash_prefix}image-magick"
  description         = "Built from https://github.com/serverlesspub/imagemagick-aws-lambda-2"
  filename            = "${path.module}/lambda_layers/imagemagick/imagemagick.zip"
  source_code_hash    = filebase64sha256("${path.module}/lambda_layers/imagemagick/imagemagick.zip")
  compatible_runtimes = ["python3.8", "nodejs16.x"]
}

resource "aws_lambda_layer_version" "image_processor_cloudfront" {
  layer_name          = "${local.dash_prefix}image-processor-cloudfront"
  filename            = "${path.module}/lambda_layers/image_processor_cloudfront/image_processor_cloudfront.zip"
  source_code_hash    = filebase64sha256("${path.module}/lambda_layers/image_processor_cloudfront/image_processor_cloudfront.zip")
  compatible_runtimes = ["nodejs16.x"]
}

module "image_processor_cloudfront" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name                     = "${local.dash_prefix}image-processor-cloudfront"
  description                       = "Lambda to process images requested by cloudfront"
  handler                           = "main.resizer"
  runtime                           = "nodejs16.x"
  source_path                       = "${path.module}/lambda/image_processor_cloudfront"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  publish                           = true
  recreate_missing_package          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 900 // Max timeout to process images
  memory_size                       = 1024

  layers = [
    aws_lambda_layer_version.image_magick.arn,
    aws_lambda_layer_version.image_processor_cloudfront.arn
  ]

  allowed_triggers = {
    cloudfront = {
      principal = "cloudfront.amazonaws.com"
    }
  }
}

resource "aws_iam_role_policy" "image_processor_cloudfront_WriteGetObjectResponse" {
  role = module.image_processor_cloudfront.lambda_role_name

  policy = templatefile("${path.module}/iam/lambda_s3_object_lambda.json", {
    s3_object_lambda_access_point = awscc_s3objectlambda_access_point.lambda_endpoint.arn
  })
}

########################################################
# IMAGE REKOGNITION PROCESSING
########################################################
module "image_processor_rekognition" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name                     = "${local.dash_prefix}image-processor-rekognition"
  description                       = "Lambda to process with rekognition new images uploaded to the bucket"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/image_rekognition"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  layers                            = ["arn:aws:lambda:${data.aws_region.current.name}:017000801446:layer:AWSLambdaPowertoolsPythonV2:31"]
  publish                           = true
  recreate_missing_package          = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 240
  attach_policy                     = true
  reserved_concurrent_executions    = 1
  policy                            = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"

  event_source_mapping = {
    sqs = {
      event_source_arn = aws_sqs_queue.rekognition.arn
      batch_size       = 1
    }
  }

  allowed_triggers = {
    sqs = {
      principal  = "sqs.amazonaws.com"
      source_arn = aws_sqs_queue.rekognition.arn
    }
  }

  policy_statements = {
    s3_read = {
      effect    = "Allow"
      actions   = ["s3:GetObject"]
      resources = ["${module.photo_bucket.s3_bucket_arn}/*"]
    }

    dynamodb = {
      effect    = "Allow"
      actions   = ["dynamodb:PutItem", "dynamodb:Query", "dynamodb:UpdateItem"]
      resources = [aws_dynamodb_table.photo_tracker.arn, "${aws_dynamodb_table.photo_tracker.arn}/index/*"]
    }

    rekognition = {
      effect    = "Allow"
      actions   = ["rekognition:IndexFaces", "rekognition:SearchFaces"]
      resources = [aws_cloudformation_stack.rekognition.outputs.collectionArn]
    }
  }

  environment_variables = {
    photo_table               = aws_dynamodb_table.photo_tracker.id
    photo_bucket              = module.photo_bucket.s3_bucket_id
    rekognition_collection_id = aws_cloudformation_stack.rekognition.outputs.collectionId
  }
}

########################################################
# IMAGE DELETION
########################################################
module "image_deletion" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name                     = "${local.dash_prefix}image-deletion-handler"
  description                       = "Lambda to process objects deleted from photo bucket"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/image_deletion"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  layers                            = ["arn:aws:lambda:${data.aws_region.current.name}:017000801446:layer:AWSLambdaPowertoolsPythonV2:31"]
  publish                           = true
  recreate_missing_package          = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 120

  allowed_triggers = {
    BucketTrigger = {
      principal  = "s3.amazonaws.com"
      source_arn = module.photo_bucket.s3_bucket_arn
    }
  }

  policy_statements = {
    s3_delete = {
      effect    = "Allow"
      actions   = ["s3:DeleteObject"]
      resources = ["${module.photo_assets_bucket.s3_bucket_arn}/*"]
    }

    dynamodb = {
      effect    = "Allow"
      actions   = ["dynamodb:DeleteItem", "dynamodb:Query"]
      resources = [aws_dynamodb_table.photo_tracker.arn, "${aws_dynamodb_table.photo_tracker.arn}/index/*"]
    }

    rekognition = {
      effect    = "Allow"
      actions   = ["rekognition:DeleteFaces"]
      resources = [aws_cloudformation_stack.rekognition.outputs.collectionArn]
    }
  }

  environment_variables = {
    photo_table               = aws_dynamodb_table.photo_tracker.id
    photo_bucket              = module.photo_bucket.s3_bucket_id
    photo_assets_bucket       = module.photo_assets_bucket.s3_bucket_id
    rekognition_collection_id = aws_cloudformation_stack.rekognition.outputs.collectionId
  }
}

########################################################
# CLOUDFRONT INVALIDATOR
########################################################
module "cloudfront_invalidator" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name                     = "${local.dash_prefix}cloudfront-invalidator"
  description                       = "Lambda to invalidate cloudfront cache when the frontend is built"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/cloudfront_invalidator"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  publish                           = true
  recreate_missing_package          = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 120

  policy_statements = {
    cloudfront = {
      effect    = "Allow"
      actions   = ["cloudfront:CreateInvalidation"]
      resources = [aws_cloudfront_distribution.frontend_cloudfront.arn]
    }

    pipeline = {
      effect    = "Allow"
      actions   = ["codepipeline:PutJobFailureResult", "codepipeline:PutJobSuccessResult"]
      resources = ["*"]
    }
  }

  environment_variables = {
    cf_distribution = aws_cloudfront_distribution.frontend_cloudfront.id
  }
}

########################################################
# CLOUDFRONT URL SIGNER
########################################################
module "cloudfront_url_signer" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "4.2.0"

  function_name                     = "${local.dash_prefix}cloudfront-url-signer"
  description                       = "Lambda to sign cloudfront private URLs"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/cloudfront_url_signer"
  artifacts_dir                     = "${path.module}/builds"
  tags                              = local.tags
  publish                           = true
  recreate_missing_package          = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 120
  layers                            = [local.cryptography_layer]

  policy_statements = {
    secrets = {
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue"]
      resources = [aws_secretsmanager_secret.cloudfront_private_key.arn]
    }
  }

  environment_variables = {
    cert_secret = aws_secretsmanager_secret.cloudfront_private_key.name
    key_id      = aws_cloudfront_public_key.key.id
    base_url    = "https://${local.dns}"
  }
}

data "http" "latest_layers" {
  url = "https://api.klayers.cloud/api/v2/p3.8/layers/latest/${data.aws_region.current.name}/"

  request_headers = {
    Accept = "application/json"
  }
}

locals {
  layers             = jsondecode(data.http.latest_layers.response_body)
  cryptography_layer = [for layer in local.layers : layer.arn if layer.package == "cryptography"][0]
}
