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
  layers                            = [aws_lambda_layer_version.python38_image_processor.arn]
  publish                           = true
  recreate_missing_package          = false
  ignore_source_code_hash           = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 900 // Max timeout to process images
  memory_size                       = 1024

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
  publish                           = true
  recreate_missing_package          = false
  ignore_source_code_hash           = true
  attach_policy_statements          = true
  cloudwatch_logs_retention_in_days = 14
  timeout                           = 240
  attach_policy                     = true
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

  function_name                     = "${local.dash_prefix}image-deletion"
  description                       = "Lambda to process objects deleted from photo bucket"
  handler                           = "main.lambda_handler"
  runtime                           = "python3.8"
  source_path                       = "${path.module}/lambda/image_deletion"
  artifacts_dir                     = "${path.module}/builds"
  publish                           = true
  recreate_missing_package          = false
  ignore_source_code_hash           = true
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
      actions   = ["dynamodb:DeleteItem"]
      resources = [aws_dynamodb_table.photo_tracker.arn]
    }
  }

  environment_variables = {
    photo_table         = aws_dynamodb_table.photo_tracker.id
    photo_bucket        = module.photo_bucket.s3_bucket_id
    photo_assets_bucket = module.photo_assets_bucket.s3_bucket_id
  }
}
