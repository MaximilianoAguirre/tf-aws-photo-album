########################################################
# PHOTO BUCKET
########################################################
module "photo_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "3.4.0"

  bucket        = var.bucket_name
  acl           = "private"
  tags          = var.tags
  force_destroy = true
}
