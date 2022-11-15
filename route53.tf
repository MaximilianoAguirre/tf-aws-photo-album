data "aws_route53_zone" "public_zone" {
  count = var.route53_public_zone_id != null ? 1 : 0

  zone_id = var.route53_public_zone_id
}

resource "aws_route53_record" "cloudfront_alias" {
  count = var.route53_public_zone_id != null ? 1 : 0

  zone_id = data.aws_route53_zone.public_zone[0].zone_id
  name    = "${var.route53_subdomain}${data.aws_route53_zone.public_zone[0].name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend_cloudfront.domain_name
    zone_id                = aws_cloudfront_distribution.frontend_cloudfront.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "cert_validator" {
  for_each = var.route53_public_zone_id != null ? {
    for dvo in aws_acm_certificate.cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.public_zone[0].zone_id
}
