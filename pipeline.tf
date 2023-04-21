########################################################
# PIPELINE
########################################################
resource "aws_codepipeline" "codepipeline" {
  name     = "${local.dash_prefix}frontend"
  role_arn = aws_iam_role.pipeline.arn

  artifact_store {
    location = module.web_build_bucket.s3_bucket_id
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "S3"
      version          = "1"
      output_artifacts = ["source"]

      configuration = {
        S3Bucket             = module.web_build_bucket.s3_bucket_id
        S3ObjectKey          = "frontend.zip"
        PollForSourceChanges = false
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source"]
      output_artifacts = ["built_code"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "S3"
      input_artifacts = ["built_code"]
      version         = "1"

      configuration = {
        BucketName = module.web_bucket.s3_bucket_id
        Extract    = true
      }
    }
  }

  stage {
    name = "InvalidateCache"

    action {
      name     = "Invoke"
      category = "Invoke"
      owner    = "AWS"
      provider = "Lambda"
      version  = "1"

      configuration = {
        FunctionName = module.cloudfront_invalidator.lambda_function_name
      }
    }
  }
}

########################################################
# BUILD
########################################################
resource "aws_codebuild_project" "build" {
  name         = "${local.dash_prefix}frontend"
  description  = "Photo album frontend build process"
  service_role = aws_iam_role.codebuild.arn
  tags         = local.tags

  source {
    type = "CODEPIPELINE"
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  cache {
    type     = "S3"
    location = module.web_build_bucket.s3_bucket_id
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }
}

########################################################
# AUTO TRIGGER
########################################################
resource "aws_cloudwatch_event_rule" "trigger_pipeline" {
  name        = "${local.dash_prefix}frontend-pipeline-trigger"
  description = "Event to trigger automatic builds of photo album frontend"
  tags        = local.tags

  event_pattern = templatefile("${path.module}/cw/pipeline_trigger.json", {
    bucket = module.web_build_bucket.s3_bucket_id
  })
}

resource "aws_cloudwatch_event_target" "pipeline" {
  target_id = "pipeline"
  rule      = aws_cloudwatch_event_rule.trigger_pipeline.name
  arn       = aws_codepipeline.codepipeline.arn
  role_arn  = aws_iam_role.events.arn
}
