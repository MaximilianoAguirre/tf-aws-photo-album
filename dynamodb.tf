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

  global_secondary_index {
    name            = "inverted"
    hash_key        = "range_key"
    range_key       = "hash_key"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "geohash"
    hash_key        = "range_key"
    range_key       = "geohash"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "timestamp"
    hash_key        = "range_key"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  attribute {
    name = "hash_key"
    type = "S"
  }

  attribute {
    name = "range_key"
    type = "S"
  }

  attribute {
    name = "geohash"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  server_side_encryption {
    enabled = true
  }
}
