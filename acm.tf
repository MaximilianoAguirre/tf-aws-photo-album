resource "aws_acm_certificate" "cert" {
  count = var.route53_public_zone_id != null ? 1 : 0

  domain_name       = "${var.route53_subdomain}${data.aws_route53_zone.public_zone[0].name}"
  validation_method = "DNS"
  tags              = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert_validator" {
  count = var.route53_public_zone_id != null ? 1 : 0

  certificate_arn         = aws_acm_certificate.cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validator : record.fqdn]
}
