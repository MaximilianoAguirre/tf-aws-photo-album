# Workaround to create Rekognition resources
# https://github.com/hashicorp/terraform-provider-aws/pull/26053
resource "aws_cloudformation_stack" "rekognition" {
  name = "${local.dash_prefix}photo-album-rekognition"
  tags = local.tags

  template_body = templatefile("${path.module}/cloudformation/rekognition.yaml", {
    collection_name = "${local.dash_prefix}photo-album"
  })
}
