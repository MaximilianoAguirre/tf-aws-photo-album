# DynamoDB schema information

## Indexes

| Name     | Hash key | Range key |
| -------- | -------- | --------- |
| Main     | PK       | SK        |
| Inverted | SK       | PK        |
| GSI1     | GSI1PK   | GSI1SK    |
| GSI2     | GSI2PK   | GSI2SK    |

## Access patterns

| Name                                  | Index    | Hash key            | Range key            |
| ------------------------------------- | -------- | ------------------- | -------------------- |
| Get s3 object                         | Main     | #METADATA           | #S3#<object_id>      |
| Get all s3 objects                    | Inverted | #METADATA           | begins_with(#S3)     |
| Get all s3 objects order by timestamp | GSI2     | #TIMESTAMP          |                      |
| Get all s3 objects by geohash         | GSI1     | #GEOHASH            | begins_with(<hash>)  |
| Get all faces in a s3 object          | Main     | #S3#<id>            | begins_with(#FACE)   |
| Get person                            | Inverted | #METADATA           | #PERSON#<person_id>  |
| Get person metadata and faces         | Main     | #PERSON#<person_id> |                      |
| Get all persons                       | Inverted | #METADATA           | begins_with(#PERSON) |
| Get all person by appearances         | GSI2     | #APPEARANCES        |                      |
| Get all photos of a person            | GSI1     | #PERSON#<id>        |                      |

## Write patterns

| Name               | PK                  | SK        | Expression      |
| ------------------ | ------------------- | --------- | --------------- |
| Change person name | #PERSON#<person_id> | #METADATA | SET name=<name> |

## Transactions

### Change person ID

| Operation | Type  | Name                          | Expression      |
| --------- | ----- | ----------------------------- | --------------- |
| 1         | Query | Get person metadata and faces | SET name=<name> |

