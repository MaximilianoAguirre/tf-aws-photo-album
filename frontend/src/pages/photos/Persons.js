import React from 'react'
import { Empty, Col, Row, Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllPersonsByAppearanceInfinite, useChangePersonName } from 'api/dynamo'
import { StickyHeader, WrappedSpinner, CustomSpinner, PersonAvatar } from 'components'

const { Paragraph } = Typography

export const AllPersons = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useAllPersonsByAppearanceInfinite()
  const navigate = useNavigate()

  // Process all pages returned by DynamoDB and create a single list of photos
  const persons = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
  }, [])

  return (
    <>
      <StickyHeader chooseSize={false} title='People' />
      {isLoading ? (
        <WrappedSpinner />
      ) : !persons.length ? (
        <Empty style={{ margin: '15px' }} description='No persons detected' />
      ) : (
        <InfiniteScroll
          style={{ width: '100%', padding: '15px' }}
          height='calc(100vh - 56px)'
          dataLength={persons.length}
          hasChildren={persons.length}
          hasMore={hasNextPage}
          next={() => fetchNextPage()}
          loader={<CustomSpinner />}
        >
          <Row justify='space-around' gutter={[15, 15]} style={{ marginRight: 0, marginLeft: 0, width: '100%' }}>
            {persons.map((person) => (
              <Col key={person.PK.S}>
                <Card
                  style={{ width: '150px' }}
                  // title={}
                  cover={
                    <PersonAvatar
                      onClick={() => navigate(`/person/${encodeURIComponent(person.PK.S)}`)}
                      size={150}
                      person_id={person.PK.S}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                >
                  <PersonName id={person.PK.S} name={person.name.S} />
                  Photos: {person.GSI2SK.N}
                </Card>
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      )}
    </>
  )
}

const PersonName = ({ id, name }) => {
  const changeName = useChangePersonName()

  return (
    <Paragraph
      strong
      ellipsis={{ tooltip: true }}
      editable={{
        onChange: (name) => changeName.mutate({ id, name }),
        tooltip: false,
        autoSize: { maxRows: 1 }
      }}
    >
      {name}
    </Paragraph>
  )
}
