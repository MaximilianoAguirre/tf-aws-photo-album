output "photo_bucket" {
  value       = module.photo_bucket.s3_bucket_id
  description = "Bucket created to store photos"
}

output "cloudfront_dns" {
  value       = aws_cloudfront_distribution.frontend_cloudfront.domain_name
  description = "Default DNS provided by CloudFront, applies only when there is no alias set"
}
