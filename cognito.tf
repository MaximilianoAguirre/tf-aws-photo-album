########################################################
# USER POOL AND WEB CLIENT
########################################################
resource "aws_cognito_user_pool" "pool" {
  name                     = "${local.dash_prefix}photo-bucket"
  mfa_configuration        = "OFF"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  tags                     = var.tags
}

resource "aws_cognito_user_pool_client" "poolclient" {
  name                                 = "${local.dash_prefix}photo-bucket"
  user_pool_id                         = aws_cognito_user_pool.pool.id
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  allowed_oauth_flows                  = ["code"]
  callback_urls                        = ["http://localhost:3000"]
  logout_urls                          = ["http://localhost:3000"]
}

resource "aws_cognito_identity_pool" "identitypool" {
  identity_pool_name               = "${local.dash_prefix}photo-bucket"
  allow_unauthenticated_identities = false
  tags                             = var.tags

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.poolclient.id
    provider_name           = "cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.pool.id}"
    server_side_token_check = false
  }
}

########################################################
# IAM ROLES
########################################################
resource "aws_iam_role" "identitypool_authenticated_role" {
  name = "${local.dash_prefix}photo-bucket-authenticated"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "identitypool_unauthenticated_role" {
  name = "${local.dash_prefix}photo-bucket-unauthenticated"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "unauthenticated"
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "role_attachment" {
  identity_pool_id = aws_cognito_identity_pool.identitypool.id

  roles = {
    "authenticated"   = aws_iam_role.identitypool_authenticated_role.arn
    "unauthenticated" = aws_iam_role.identitypool_unauthenticated_role.arn
  }
}
