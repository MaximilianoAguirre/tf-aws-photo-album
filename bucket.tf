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
