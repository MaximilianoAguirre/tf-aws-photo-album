import React, { useCallback } from "react"
import { Col, Row, Spin, Empty } from 'antd'
import { useParams } from "react-router-dom"

import { useLocatedPhotosInfinite } from "api/dynamo"
import { CustomImage, StickyHeader } from "components"
import { useImageSize } from "context"


export const Located = () => {
    let { geohash } = useParams()
    const { current: width } = useImageSize()
    const { data, isLoading, fetchNextPage, isFetchingNextPage } = useLocatedPhotosInfinite(geohash)

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

    return <>
        <StickyHeader title="Located photos" />
        <Row
            justify="center"
            align="middle"
            gutter={[15, 15]}
            style={{ marginTop: "15px", width: "100%" }}
        >
            {
                photos.map(photo => <Col
                    key={photo.name.S}
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
}
