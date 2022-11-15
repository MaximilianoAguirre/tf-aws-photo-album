import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Image, Modal } from 'antd'
import { Blurhash } from "react-blurhash"

import { useOriginalPhotoURL } from "api/s3"
import { fallback_image } from "util/fallback_image"

export const ImagePreview = forwardRef(({ photo }, ref) => {
    const [open, setOpen] = useState(false)
    const { data: photoUrl } = useOriginalPhotoURL(photo.hash_key.S)

    useImperativeHandle(ref, () => ({
        open() {
            setOpen(true)
        }
    }))

    return <Modal
        title={photo.hash_key.S}
        open={open}
        onCancel={() => setOpen(false)}
        wrapClassName="fullscreen-modal"
    >
        <Image
            width={photo.width?.N}
            height={photo.height?.N}
            src={photoUrl}
            preview={false}
            fallback={fallback_image}
            placeholder={"blurhash" in photo &&
                <Blurhash
                    hash={photo.blurhash.S}
                    width={photo.width?.N}
                    height={photo.height?.N}
                />
            }
        />
    </Modal>
})
