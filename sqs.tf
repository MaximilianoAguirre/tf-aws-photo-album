resource "aws_sqs_queue" "rekognition" {
  name                       = "${local.dash_prefix}photo-album-rekognition"
  fifo_queue                 = false
  tags                       = local.tags
  visibility_timeout_seconds = 480
}

resource "aws_sqs_queue_policy" "rekognition" {
  queue_url = aws_sqs_queue.rekognition.id

  policy = templatefile("${path.module}/iam/sqs_rekognition.json", {
    queue_arn = aws_sqs_queue.rekognition.arn
    topic_arn = aws_sns_topic.photo_album_create.arn
  })
}
