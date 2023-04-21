import React from 'react'
import { Empty, Col, Row, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllPersonsInfinite, useAllPersonsByAppearanceInfinite } from 'api/dynamo'
import { StickyHeader, WrappedSpinner, CustomSpinner, PersonAvatar } from 'components'

const { Meta } = Card

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
          <Row gutter={[10, 10]} style={{ margin: 0, width: '100%' }}>
            {persons.map((person) => (
              <Col key={person.PK.S}>
                <Card
                  onClick={() => navigate(`/person/${encodeURIComponent(person.PK.S)}`)}
                  style={{ width: '100px', cursor: 'pointer' }}
                  title={person.PK.S.replace('#PERSON#', '')}
                >
                  <Meta avatar={<PersonAvatar person_id={person.PK.S} />} />
                </Card>
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      )}
    </>
  )
}
