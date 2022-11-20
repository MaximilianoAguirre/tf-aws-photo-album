import React from "react"
import { Radio } from "antd"

import { useImageSize } from "context"

export const ChooseSizeRadio = ({ style }) => {
    const { current, available, set_size, size_to_label } = useImageSize()

    return <Radio.Group
        optionType="button"
        buttonStyle="solid"
        style={style}
        value={current}
        onChange={(e) => set_size(e.target.value)}
        options={available.map(size => {
            return {
                label: size_to_label(size),
                value: size
            }
        })}
    />
}
