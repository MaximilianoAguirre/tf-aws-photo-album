import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Drawer, Spin, Button, Row, Col } from 'antd'
import { useNavigate } from "react-router-dom"

import { CustomImage } from "components"
import { useLocatedPhotos } from "api/dynamo"

export const ImageDrawer = forwardRef((props, ref) => {
    const [open, setOpen] = useState(false)
    const [hash, setHash] = useState(null)
    const { data, isLoading } = useLocatedPhotos(hash, { limit: 5, options: { enabled: Boolean(hash) } })
    const navigate = useNavigate()

    useImperativeHandle(ref, () => ({
        open() {
            setOpen(true)
        },
        setHash(hash) {
            setHash(hash)
        }
    }))

    const onClose = () => {
        setOpen(false);
    };

    return <Drawer
        title={<Button onClick={() => navigate(`/located/${hash}`)}>See all</Button>}
        placement="right"
        onClose={onClose}
        open={open}
    >
        {
            isLoading ?
                <Spin />
                :
                <Row
                    gutter={[5, 5]}
                    justify="center"
                    align="middle"
                >
                    {
                        data?.map(photo => <Col
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
    </Drawer>
})
