import React, { useCallback } from "react"
import { Col, Row, Spin } from 'antd'
import { useParams } from "react-router-dom"

import { useLocatedPhotosInfinite } from "api/dynamo"
import { CustomImage } from "components/Image"


export const Located = () => {
    let { geohash } = useParams()
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

    return isLoading ?
        <Spin />
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
            {
                isFetchingNextPage && <Col
                    span={24}
                >
                    <Spin />
                </Col>
            }
            {/* Div to watch for scroll */}
            <div ref={scrollRef} />
        </Row>
}
