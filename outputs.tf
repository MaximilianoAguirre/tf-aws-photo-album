output "photo_bucket" {
  value       = module.photo_bucket.s3_bucket_id
  description = "Bucket created to store photos"
}
