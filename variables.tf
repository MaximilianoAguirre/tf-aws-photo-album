#########################################################################################
# GENERAL
#########################################################################################
variable "prefix" {
  type        = string
  default     = null
  description = "Prefix to add to all resources"
}

locals {
  dash_prefix  = var.prefix != null ? "${var.prefix}-" : ""
  slash_prefix = var.prefix != null ? "/${var.prefix}/" : "/"
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags to apply to all resources"
}
