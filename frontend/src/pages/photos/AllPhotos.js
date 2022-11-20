import React, { useCallback } from "react"
import { Button, Col, Row, Spin, Empty } from 'antd'

import { useAllPhotosInfinite } from "api/dynamo"
import { CustomImage, StickyHeader, ChooseSizeRadio } from "components"
import { useImageSize } from "context"


export const AllPhotos = () => {
    const { current: width } = useImageSize()
    const { data, isLoading, fetchNextPage, isFetchingNextPage } = useAllPhotosInfinite()

    // Process all pages returned by DynamoDB and create a single list of photos
    const photos = data?.pages.reduce((acc, curr) => {
        return acc.concat(curr.Items)
    }, [])

    // useCallback required cause the ref is null in the first render
    // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const scrollRef = useCallback(node => {
        if (node !== null) {
            const observer = new IntersectionObserver(([target]) => {
                if (target.isIntersecting) {
                    fetchNextPage()
                }
            })

            observer.observe(node)
        }
    }, [])

    if (isLoading) return <Spin />
    if (!photos.length) return <Empty style={{ marginTop: "15px" }} description="No media uploaded" />

    return (
        <>
            <StickyHeader title={"All photos"} />
            <Row
                justify="center"
                align="middle"
                gutter={[15, 15]}
                style={{ marginTop: "15px", width: "100%" }}
            >
                {
                    photos.map(photo => <Col
                        key={photo.PK.S}
                    >
                        <CustomImage
                            photo={photo}
                            width={width}
                        />
                    </Col>)
                }
                {
                    isFetchingNextPage && <Col span={24} >
                        <Spin />
                    </Col>
                }
                {/* Div to watch for scroll */}
                <div ref={scrollRef} />
            </Row>
        </>
    )
}
