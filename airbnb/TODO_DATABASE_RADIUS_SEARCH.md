# Database-Level Radius Search Implementation

## Current Implementation
The current radius search in `getListings.ts` fetches all listings with coordinates from the database and then filters by distance in JavaScript. This is inefficient for large datasets and breaks pagination.

## Recommended Solution

### Option 1: MongoDB Geospatial Queries (Recommended)
MongoDB supports native geospatial queries that can efficiently filter by radius at the database level.

```javascript
// Update Prisma schema to add a 2dsphere index
model Listing {
  // ... existing fields
  location: Json? @db.Json // Store as GeoJSON Point
  @@index([location], map: "location_2dsphere", type: "2dsphere")
}

// Example query
const listings = await prisma.listing.findRaw({
  filter: {
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    }
  }
});
```

### Option 2: PostgreSQL with PostGIS
If migrating to PostgreSQL, use PostGIS extension for advanced geographic queries.

```sql
-- Example query with PostGIS
SELECT * FROM listings
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
  ?
)
ORDER BY ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography);
```

## Implementation Steps

1. **Add location field as GeoJSON**:
   - Store coordinates as MongoDB GeoJSON Point: `{ type: "Point", coordinates: [lng, lat] }`
   - Create 2dsphere index on the location field

2. **Migration script**:
   - Convert existing latitude/longitude to GeoJSON format
   - Populate the new location field for all listings

3. **Update queries**:
   - Use MongoDB's `$nearSphere` operator for radius searches
   - This will properly handle pagination with radius filtering at the database level

4. **Benefits**:
   - Efficient database-level filtering
   - Proper pagination support
   - Distance sorting capability
   - Significantly better performance for large datasets

## Temporary Workaround
The current implementation in `getListings.ts` has been optimized to:
- Only fetch listings with coordinates when doing radius search
- Apply pagination after radius filtering
- Return accurate counts for pagination

This works for small to medium datasets but should be replaced with proper geospatial queries for production scale.