########################################################
# APP IAM ROLES
########################################################
resource "aws_iam_role" "authenticated" {
  name = "${local.dash_prefix}authenticated"
  tags = local.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "admin" {
  name = "${local.dash_prefix}admin"
  tags = local.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "contributor" {
  name = "${local.dash_prefix}contributor"
  tags = local.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "reader" {
  name = "${local.dash_prefix}reader"
  tags = local.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "authenticated"
  })
}

resource "aws_iam_role" "unauthenticated" {
  name = "${local.dash_prefix}unauthenticated"
  tags = local.tags

  assume_role_policy = templatefile("${path.module}/iam/cognito_idp_assume.json", {
    aud = aws_cognito_identity_pool.identitypool.id
    amr = "unauthenticated"
  })
}

########################################################
# APP IAM POLICIES
########################################################
resource "aws_iam_policy" "reader" {
  name = "${local.dash_prefix}reader"
  tags = local.tags

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
  name = "${local.dash_prefix}contributor"
  tags = local.tags

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
  name = "${local.dash_prefix}admin"
  tags = local.tags

  policy = templatefile("${path.module}/iam/admin.json", {
    user_pool_arn = aws_cognito_user_pool.pool.arn
  })
}

resource "aws_iam_role_policy_attachment" "admin_manage" {
  role       = aws_iam_role.admin.name
  policy_arn = aws_iam_policy.admin.arn
}

########################################################
# PIPELINE IAM ROLE
########################################################
resource "aws_iam_role" "pipeline" {
  name               = "${local.dash_prefix}pipeline"
  assume_role_policy = file("${path.module}/iam/codepipeline_assume.json")
  tags               = local.tags
}

# IAM Policy replicated from policy created automatically in AWS console
resource "aws_iam_role_policy" "pipeline" {
  name   = "${local.dash_prefix}main"
  role   = aws_iam_role.pipeline.id
  policy = file("${path.module}/iam/codepipeline.json")
}

########################################################
# CODEBUILD IAM ROLE
########################################################
resource "aws_iam_role" "codebuild" {
  name               = "${local.dash_prefix}codebuild"
  assume_role_policy = file("${path.module}/iam/codebuild_assume.json")
  tags               = local.tags
}

resource "aws_iam_role_policy" "codebuild" {
  name = "${local.dash_prefix}main"
  role = aws_iam_role.codebuild.id

  policy = templatefile("${path.module}/iam/codebuild.json", {
    buckets = [module.web_build_bucket.s3_bucket_arn]
  })
}

########################################################
# EVENTS IAM ROLE
########################################################
resource "aws_iam_role" "events" {
  name               = "${local.dash_prefix}events-trigger"
  assume_role_policy = file("${path.module}/iam/events_assume.json")
  tags               = local.tags
}

resource "aws_iam_role_policy" "events" {
  name = "${local.dash_prefix}main"
  role = aws_iam_role.events.id

  policy = templatefile("${path.module}/iam/events.json", {
    pipeline = aws_codepipeline.codepipeline.arn
  })
}
