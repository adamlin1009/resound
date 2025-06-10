import getListings from "../actions/getListings";

export default async function TestSearchPage() {
  // Test various search scenarios
  const tests = [
    {
      name: "Radius search - Los Angeles 50mi",
      params: { city: "Los Angeles", state: "CA", radius: 50 }
    },
    {
      name: "Radius search - New York 25mi", 
      params: { city: "New York", state: "NY", radius: 25 }
    },
    {
      name: "Nationwide search",
      params: { nationwide: true }
    },
    {
      name: "City only - no radius",
      params: { city: "San Francisco", state: "CA" }
    },
    {
      name: "Category search with radius",
      params: { category: "Guitar", city: "Los Angeles", state: "CA", radius: 100 }
    }
  ];

  const results = await Promise.all(
    tests.map(async (test) => {
      const response = await getListings(test.params);
      return {
        ...test,
        count: response.listings.length,
        totalCount: response.totalCount
      };
    })
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Search Functionality Test</h1>
      
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded p-4">
            <h2 className="font-semibold text-lg">{result.name}</h2>
            <p className="text-sm text-gray-600">
              Parameters: {JSON.stringify(result.params)}
            </p>
            <p className="mt-2">
              Results: <span className="font-bold">{result.count}</span> listings
              (Total in database matching criteria: {result.totalCount})
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Test URL Parameters</h3>
        <p className="text-sm">Try these URLs to test the search on the main page:</p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>
            <code className="bg-gray-200 px-1">/?city=Los Angeles&state=CA&radius=50</code>
          </li>
          <li>
            <code className="bg-gray-200 px-1">/?city=New York&state=NY&radius=25</code>
          </li>
          <li>
            <code className="bg-gray-200 px-1">/?nationwide=true</code>
          </li>
          <li>
            <code className="bg-gray-200 px-1">/?city=San Francisco&state=CA&radius=10</code>
          </li>
        </ul>
      </div>
    </div>
  );
}