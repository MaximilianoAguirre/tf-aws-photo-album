import React from "react"
import { Button, Spin, Empty, List, Avatar } from 'antd'
import { useNavigate } from "react-router-dom"

import { useAllPersons } from "api/dynamo"
import { StickyHeader } from "components"

export const AllPersons = () => {
    const { data: persons, isLoading } = useAllPersons()
    const navigate = useNavigate()


    if (isLoading) return <Spin />
    if (!persons.length) return <Empty style={{ marginTop: "15px" }} description="No persons detected" />

    return <>
        <StickyHeader chooseSize={false} title="People" />
        <List
            itemLayout="horizontal"
            style={{ margin: "15px" }}
            dataSource={persons}
            renderItem={item => <List.Item
                actions={[
                    <Button
                        type="primary"
                        onClick={() => navigate(`/person/${encodeURIComponent(item.PK.S)}`)}
                    >
                        See all
                    </Button>
                ]}
            >
                <List.Item.Meta
                    avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                    title={item.PK.S.replace('#PERSON#', '')}
                />
            </List.Item>}
        />
    </>
}
