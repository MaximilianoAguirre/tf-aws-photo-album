#########################################################################################
# GENERAL
#########################################################################################
variable "prefix" {
  type        = string
  default     = "photoalbum"
  description = "Prefix to add to all resources"
}

locals {
  dash_prefix  = var.prefix != null && var.prefix != "" ? "${var.prefix}-" : ""
  slash_prefix = var.prefix != null && var.prefix != "" ? "/${var.prefix}/" : "/"
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags to apply to all resources"
}

locals {
  tags = merge(var.tags, {
    application = "Photo Album"
  })
}

#########################################################################################
# DEV
#########################################################################################
variable "enable_dev" {
  type        = bool
  default     = false
  description = "Configure resources to allow development"
}

#########################################################################################
# COGNITO
#########################################################################################
variable "root_user" {
  type        = string
  description = "Root user, must be a valid email"
}

variable "cognito_password_min_length" {
  type        = number
  default     = 10
  description = "Cognito password - minimum length"
}

variable "cognito_password_require_lower" {
  type        = bool
  default     = false
  description = "Cognito password - require lowercases"
}

variable "cognito_password_require_upper" {
  type        = bool
  default     = false
  description = "Cognito password - require uppercases"
}

variable "cognito_password_require_number" {
  type        = bool
  default     = false
  description = "Cognito password - require numbers"
}

variable "cognito_password_require_symbol" {
  type        = bool
  default     = false
  description = "Cognito password - require symbols"
}

variable "cognito_temporal_password_validity" {
  type        = number
  default     = 30
  description = "Validity in days of temporal passwords"
}

###############################################################
# ROUTE 53
###############################################################
variable "route53_public_zone_id" {
  type        = string
  default     = null
  description = "Zone to use to create cloudfront aliases, must be public and valid"
}

variable "route53_subdomain" {
  type        = string
  default     = ""
  description = "Subdomain to host frontend. For example, 'photoalbum.' will result in photoalbum.{domain}"
}
