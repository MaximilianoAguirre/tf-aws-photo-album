resource "aws_sns_topic" "photo_album_create" {
  name = "${local.dash_prefix}photo-album-create"
  tags = var.tags
}

resource "aws_sns_topic_policy" "photo_album_create" {
  arn = aws_sns_topic.photo_album_create.arn

  policy = templatefile("${path.module}/iam/sns_photo_bucket.json", {
    topic_name = "${local.dash_prefix}photo-album-create"
    bucket_arn = module.photo_bucket.s3_bucket_arn
  })
}

resource "aws_sns_topic_subscription" "sqs_rekognition" {
  topic_arn = aws_sns_topic.photo_album_create.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.rekognition.arn
}

resource "aws_sns_topic_subscription" "sqs_processor_lambda" {
  topic_arn = aws_sns_topic.photo_album_create.arn
  protocol  = "lambda"
  endpoint  = module.image_processor.lambda_function_arn
}
