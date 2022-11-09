import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Drawer } from 'antd'

import { CustomImage } from "components/Image"
import { useLocatedPhotos } from "api/dynamo"

export const ImageDrawer = forwardRef((props, ref) => {
    const [open, setOpen] = useState(false)
    const [hash, setHash] = useState(null)
    const { data, isLoading } = useLocatedPhotos(hash, {enabled: Boolean(hash)})

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

    return <Drawer title={`Images for hash: ${hash}`} placement="right" onClose={onClose} open={open}>
        {
            isLoading ?
                "Loading..."
                :
                data?.map(photo =>
                    <CustomImage
                        photo={photo}
                        width={300}
                        key={photo.hash_key.S}
                        style={{marginBottom: "5px"}}
                    />)
        }
    </Drawer>
})
