#########################################################################################
# GENERAL
#########################################################################################
variable "bucket_name" {
  type        = string
  description = "Bucket name"
}

variable "tags" {
  default     = {}
  type        = map(string)
  description = "Tags to apply to all resources"
}
