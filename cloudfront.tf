resource "aws_cloudfront_distribution" "frontend_cloudfront" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Cloudfront distribution serving photo album frontend"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  tags                = var.tags
  aliases             = var.route53_public_zone_id == null ? [] : ["${var.route53_subdomain}${data.aws_route53_zone.public_zone[0].name}"]

  origin {
    domain_name = module.web_bucket.s3_bucket_bucket_regional_domain_name
    origin_id   = "frontendBucket"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.photo_album.cloudfront_access_identity_path
    }
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

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
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

  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "403"
    response_code         = "200"
    response_page_path    = "/index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "photo_album" {
  comment = "OAI for photo album distribution"
}
