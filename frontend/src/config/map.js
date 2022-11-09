// At a particular map view, a set of big hashes is calculated to query all 
// photos in those regions. All responses are processed and joined in a big
// array of photos. A set of small hashes is also calculated, and all the 
// photos queried are grouped by small hash. This way, we make the less amount
// of queries and get a good precision when locating photos in the map (queries
// are reduced but browser processing is added).
export const zoom_to_char = {
    small: {
        4: 3,
        5: 3,
        6: 3,
        7: 4,
        8: 4,
        9: 4,
        10: 5,
        11: 5,
        12: 5,
        13: 6,
        14: 6,
        15: 7,
        16: 7,
        17: 8,
        18: 8
    },
    big: {
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 2,
        9: 2,
        10: 3,
        11: 3,
        12: 3,
        13: 4,
        14: 4,
        15: 5,
        16: 5,
        17: 6,
        18: 6
    }
}
