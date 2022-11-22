import React from "react"
import { Empty, Row, Col } from 'antd'
import { useParams } from "react-router-dom"

import { usePersonPhotosInfinite } from "api/dynamo"
import { CustomImageFromId, Frame, StickyHeader, WrappedSpinner } from "components"
import { useImageSize } from "context"

export const Person = () => {
    const { id } = useParams()
    const { data, isLoading } = usePersonPhotosInfinite(id)

    const photos = data?.pages.reduce((acc, curr) => {
        return acc.concat(curr.Items)
    }, [])

    return <>
        <StickyHeader title="Person photos" />
        {
            isLoading ?
                <WrappedSpinner />
                :
                !photos.length ?
                    <Empty style={{ marginTop: "15px" }} description="No data" />
                    :
                    <Row
                        justify="center"
                        align="middle"
                        gutter={[15, 15]}
                        style={{ marginTop: "15px", width: "100%" }}
                    >
                        {
                            photos.map(photo => <PersonPhoto key={photo.PK.S} photo={photo} />)
                        }
                    </Row>

        }
    </>
}

const PersonPhoto = ({ photo }) => {
    const { current: width } = useImageSize()

    const box = JSON.parse(photo.bounding_box.S)
    const boundaries = {
        top: box.Top * 100,
        left: box.Left * 100,
        bottom: (box.Top + box.Height) * 100,
        rigth: (box.Left + box.Width) * 100
    }

    return <Col
        key={photo.PK.S}
        style={{ position: "relative" }}
    >
        <CustomImageFromId
            photoId={photo.PK.S}
            width={width}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
            }}
        />
        <Frame width={width} {...boundaries} />
    </Col>
}
