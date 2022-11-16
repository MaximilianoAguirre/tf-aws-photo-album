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
resource "aws_iam_policy" "reader" {
  name = "${local.dash_prefix}photo-bucket-reader"
  tags = var.tags

  policy = templatefile("${path.module}/iam/reader.json", {
    photo_bucket        = module.photo_bucket.s3_bucket_arn
    photo_assets_bucket = module.photo_assets_bucket.s3_bucket_arn
    dynamodb_table      = aws_dynamodb_table.photo_tracker.arn
  })
}

resource "aws_iam_role_policy_attachment" "admin_read" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.reader.arn
}

resource "aws_iam_role_policy_attachment" "contributor_read" {
  role       = aws_iam_role.contributor.name
  policy_arn = aws_iam_policy.reader.arn
}

resource "aws_iam_role_policy_attachment" "reader_read" {
  role       = aws_iam_role.reader.name
  policy_arn = aws_iam_policy.reader.arn
}

resource "aws_iam_policy" "contributor" {
  name = "${local.dash_prefix}photo-bucket-contributor"
  tags = var.tags

  policy = templatefile("${path.module}/iam/contributor.json", {
    bucket_arn = module.photo_bucket.s3_bucket_arn
  })
}

resource "aws_iam_role_policy_attachment" "admin_write" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.contributor.arn
}

resource "aws_iam_role_policy_attachment" "contributor_write" {
  role       = aws_iam_role.contributor.name
  policy_arn = aws_iam_policy.contributor.arn
}

resource "aws_iam_policy" "admin" {
  name = "${local.dash_prefix}photo-bucket-admin"
  tags = var.tags

  policy = templatefile("${path.module}/iam/admin.json", {
    user_pool_arn = aws_cognito_user_pool.pool.arn
  })
}

resource "aws_iam_role_policy_attachment" "admin_manage" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.admin.arn
}
