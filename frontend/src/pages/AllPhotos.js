import React from "react"
import { Col, Row } from 'antd'
import { useSearchParams } from 'react-router-dom'

import { useAllPhotos } from "api/dynamo"
import { CustomImage } from "components/Image"


export const AllPhotos = () => {
    const { data: photos, isLoading } = useAllPhotos()
    const [searchParams] = useSearchParams()

    const hash = searchParams.get("hash")

    return isLoading ?
        "Loading..."
        :
        <Row
            justify="center"
            align="middle"
            gutter={[15, 15]}
            style={{ marginTop: "15px", width: "100%" }}
        >
            {
                photos.map(photo => <Col
                    key={photo.hash_key.S}
                >
                    <CustomImage
                        photo={photo}
                        width={300}
                    />
                </Col>)
            }
        </Row>
}
