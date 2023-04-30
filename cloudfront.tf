########################################################
# CLOUDFRONT DISTRIBUTION
########################################################
resource "aws_cloudfront_distribution" "frontend_cloudfront" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloudfront distribution serving photo album frontend"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  tags                = local.tags
  aliases             = var.route53_public_zone_id == null ? [] : ["${var.route53_subdomain}${data.aws_route53_zone.public_zone[0].name}"]

  origin {
    domain_name              = module.web_bucket.s3_bucket_bucket_regional_domain_name
    origin_id                = "frontendBucket"
    origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront_oac.id
  }

  origin {
    domain_name              = module.photo_bucket.s3_bucket_bucket_regional_domain_name
    origin_id                = "photoBucket"
    origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront_oac.id
  }

  origin {
    domain_name              = "${awscc_s3objectlambda_access_point.lambda_endpoint.alias.value}.s3.${data.aws_region.current.name}.amazonaws.com"
    origin_id                = "photoBucket2"
    origin_access_control_id = aws_cloudfront_origin_access_control.cloudfront_oac.id
  }

  viewer_certificate {
    cloudfront_default_certificate = var.route53_public_zone_id == null
    acm_certificate_arn            = var.route53_public_zone_id == null ? null : aws_acm_certificate_validation.cert_validator[0].certificate_arn
    minimum_protocol_version       = var.route53_public_zone_id == null ? "TLSv1" : "TLSv1.2_2021"
    ssl_support_method             = var.route53_public_zone_id == null ? null : "sni-only"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "frontendBucket"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.frontend_cache_policy.id
  }

  ordered_cache_behavior {
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "photoBucket2"
    viewer_protocol_policy   = "redirect-to-https"
    path_pattern             = "/images/*"
    cache_policy_id          = aws_cloudfront_cache_policy.photo_cache_policy.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.AllViewerExceptHostHeader.id
    # trusted_key_groups     = [aws_cloudfront_key_group.key_group.id]

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.path_processor.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "404"
    response_code         = "200"
    response_page_path    = "/index.html"
  }
}

data "aws_cloudfront_origin_request_policy" "AllViewerExceptHostHeader" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_cache_policy" "photo_cache_policy" {
  name    = "WidthHeightQueryStrings"
  min_ttl = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }

    query_strings_config {
      query_string_behavior = "whitelist"

      query_strings {
        items = ["resize", "crop", "format"]
      }
    }
  }
}

resource "aws_cloudfront_cache_policy" "frontend_cache_policy" {
  name    = "None"
  min_ttl = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_function" "path_processor" {
  name    = "process-path"
  runtime = "cloudfront-js-1.0"
  comment = "my function"
  publish = true
  code    = file("${path.module}/lambda/cloudfront_path_processor/main.js")
}

resource "aws_cloudfront_origin_access_control" "cloudfront_oac" {
  name                              = "cloudfront-oac"
  description                       = "Photoalbum OAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

########################################################
# CLOUDFRONT ACCESS KEYS
########################################################
resource "tls_private_key" "cloudfront_access_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "aws_cloudfront_public_key" "key" {
  name        = "${local.dash_prefix}access-key"
  comment     = "Access key to use for photo and assets buckets"
  encoded_key = tls_private_key.cloudfront_access_key.public_key_pem
}

resource "aws_cloudfront_key_group" "key_group" {
  name    = "${local.dash_prefix}access-key-group"
  comment = "Access key group to use for photo and assets buckets"
  items   = [aws_cloudfront_public_key.key.id]
}

resource "aws_secretsmanager_secret" "cloudfront_private_key" {
  name = "${local.dash_prefix}cloudfront-private-key"
  tags = local.tags
}

resource "aws_secretsmanager_secret_version" "cloudfront_private_key" {
  secret_id     = aws_secretsmanager_secret.cloudfront_private_key.id
  secret_string = tls_private_key.cloudfront_access_key.private_key_pem
}
