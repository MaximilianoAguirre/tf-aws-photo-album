terraform {
  required_version = "~> 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.9.0"
    }

    awscc = {
      source  = "hashicorp/awscc"
      version = "= 0.51.0"
    }

    local = {
      source  = "hashicorp/local"
      version = "~> 2.1.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.3.0"
    }

    external = {
      source  = "hashicorp/external"
      version = ">= 1.0.0"
    }

    null = {
      source  = "hashicorp/null"
      version = ">= 2.0.0"
    }

    tls = {
      source  = "hashicorp/tls"
      version = ">= 4.0.4"
    }

    http = {
      source  = "hashicorp/http"
      version = ">= 3.3.0"
    }
  }
}
