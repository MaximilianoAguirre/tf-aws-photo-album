########################################################
# PHOTO INFO TABLE
########################################################
resource "aws_dynamodb_table" "photo_tracker" {
  name             = "${local.dash_prefix}photo-tracker"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "hash_key"
  range_key        = "range_key"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  tags             = var.tags

  attribute {
    name = "hash_key"
    type = "S"
  }

  attribute {
    name = "range_key"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }
}
