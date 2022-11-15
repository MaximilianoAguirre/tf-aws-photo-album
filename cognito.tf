########################################################
# USER POOL AND WEB CLIENT
########################################################
resource "aws_cognito_user_pool" "pool" {
  name                     = "${local.dash_prefix}photo-bucket"
  mfa_configuration        = "OFF"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  tags                     = var.tags

  admin_create_user_config {
    allow_admin_create_user_only = true

    invite_message_template {
      email_message = "Your username is {username} and temporary password is {####}"
      sms_message   = "Your username is {username} and temporary password is {####}"
      email_subject = "Photo album temporary password"
    }
  }

  password_policy {
    minimum_length                   = var.cognito_password_min_length
    require_lowercase                = var.cognito_password_require_lower
    require_uppercase                = var.cognito_password_require_upper
    require_numbers                  = var.cognito_password_require_number
    require_symbols                  = var.cognito_password_require_symbol
    temporary_password_validity_days = var.cognito_temporal_password_validity
  }
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
# COGNITO GROUPS
########################################################
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Photo album admins"
}

resource "aws_cognito_user_group" "contributor" {
  name         = "contributor"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Photo album contributors"
}

resource "aws_cognito_user_group" "reader" {
  name         = "reader"
  user_pool_id = aws_cognito_user_pool.pool.id
  description  = "Photo album readers"
}

########################################################
# IAM ROLES
########################################################
resource "aws_iam_role" "authenticated" {
  name = "${local.dash_prefix}photo-bucket-authenticated"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "admin" {
  name = "${local.dash_prefix}photo-bucket-admin"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "contributor" {
  name = "${local.dash_prefix}photo-bucket-contributor"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "reader" {
  name = "${local.dash_prefix}photo-bucket-reader"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "unauthenticated" {
  name = "${local.dash_prefix}photo-bucket-unauthenticated"
  tags = var.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "unauthenticated"
  })
}

########################################################
# IAM POLICIES
########################################################
resource "aws_iam_policy" "read" {
  name = "${local.dash_prefix}photo-bucket-read"

  policy = templatefile("${path.module}/iam/read.json", {
    photo_bucket        = module.photo_bucket.s3_bucket_arn
    photo_assets_bucket = module.photo_assets_bucket.s3_bucket_arn
    dynamodb_table      = aws_dynamodb_table.photo_tracker.arn
  })
}

resource "aws_iam_role_policy_attachment" "admin_read" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.read.arn
}

resource "aws_iam_role_policy_attachment" "contributor_read" {
  role       = aws_iam_role.contributor.name
  policy_arn = aws_iam_policy.read.arn
}

resource "aws_iam_role_policy_attachment" "reader_read" {
  role       = aws_iam_role.reader.name
  policy_arn = aws_iam_policy.read.arn
}


########################################################
# IAM ROLES ATTACHMENT
########################################################
resource "aws_cognito_identity_pool_roles_attachment" "role_attachment" {
  identity_pool_id = aws_cognito_identity_pool.identitypool.id

  role_mapping {
    identity_provider         = "cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.pool.id}:${aws_cognito_user_pool_client.poolclient.id}"
    ambiguous_role_resolution = "AuthenticatedRole"
    type                      = "Rules"

    mapping_rule {
      claim      = "cognito:groups"
      match_type = "Contains"
      value      = "admin"
      role_arn   = aws_iam_role.admin.arn
    }

    mapping_rule {
      claim      = "cognito:groups"
      match_type = "Contains"
      value      = "contributor"
      role_arn   = aws_iam_role.contributor.arn
    }

    mapping_rule {
      claim      = "cognito:groups"
      match_type = "Contains"
      value      = "reader"
      role_arn   = aws_iam_role.reader.arn
    }
  }

  roles = {
    "authenticated"   = aws_iam_role.authenticated.arn
    "unauthenticated" = aws_iam_role.unauthenticated.arn
  }
}

########################################################
# ROOT USER
########################################################
resource "aws_cognito_user" "root" {
  user_pool_id = aws_cognito_user_pool.pool.id
  username     = var.root_user

  attributes = {
    email = var.root_user
  }
}

resource "aws_cognito_user_in_group" "root_admin" {
  user_pool_id = aws_cognito_user_pool.pool.id
  group_name   = aws_cognito_user_group.admin.name
  username     = aws_cognito_user.root.username
}
