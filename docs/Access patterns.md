# DynamoDB schema information

## Indexes

| Name     | Hash key | Range key |
| -------- | -------- | --------- |
| Main     | PK       | SK        |
| Inverted | SK       | PK        |
| GSI1     | GSI1PK   | GSI1SK    |
| GSI2     | GSI2PK   | GSI2SK    |


## Access patterns

| Name                                  | Index    | Hash key   | Range key         |
| ------------------------------------- | -------- | ---------- | ----------------- |
| Get all s3 objects                    | Inverted | #METADATA  | begins_with(#S3)  |
| Get all s3 objects order by timestamp | GSI2     | #TIMESTAMP |                   |
| Get all s3 objects by geohash         | GSI1     | #GEOHASH   | begins_with(hash) |
