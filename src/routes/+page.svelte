<!--
@component
This is your page!
-->
<script>
  // Import all the news furniture components
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import ArticleBody from '$lib/components/Article/ArticleBody.svelte';
  import MethodologyBox from '$lib/components/Article/MethodologyBox.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';

  let { data } = $props();

  // Article metadata
  let headline = 'Got RedBull?';
  let byline = 'Ashley Mowreader';
  let pubDate = '2026-05';
  // NYC default center
  const NYC_LNG = -74.006;
  const NYC_LAT = 40.7128;
  const NYC_ZOOM = 10;

  // Reactive map state
  let mapLng = $state(NYC_LNG);
  let mapLat = $state(NYC_LAT);
  let mapZoom = $state(NYC_ZOOM);
  let hasResult = $state(false);

  const redbullPoints = $derived.by(() => ({
    type: 'FeatureCollection',
    features: (data.redbull ?? []).map((entry) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [entry.Latitude, entry.Longitude],
      },
      properties: entry,
    })),
  }));
 </script>

<!-- This sets the page title in the browser tab -->
<svelte:head>
  <title>{headline} | Ashley Mowreader </title>
  <meta
    name="description"
    content="An interactive map of New York City and relative RedBull prices at various locations around the city."
  />
</svelte:head>

<!-- Your page content goes here -->
<div class="container">

  <Image src="/pope-redbull.svg" alt="Pope Francis holds a RedBull can aloft" size="medium" align="center"/>


  <!-- Article Header: Headline, byline, and publication date -->
  <ArticleHeader {headline} {byline} {pubDate} />

  <!-- Article Body: The main story text with proper typography -->
  <ArticleBody>
   <p> 
    As a native Washingtonian, there's few beverages that make me more nostalgic rainy, overcast days in the Puget Sound, surrounded by towering pine trees than a RedBull over ice. Coloquially called a "RedBull Italian soda," just about any drive-thru coffee shop in Washington, Oregon or Idaho can help you meet your craving for a sugar-loaded energy drink, plus extra sugar syrups, and maybe a splash of juice or lemonade (or heavy cream if you're literally insane). My go-to is strawberry and peach syrup and a splash of orange juice. 
    </p>
    <p>
      When I studied abroad in Argentina, RedBull cans became a go-to grab to quell homesickness, and since moving to the East Coast, RedBulls remain an afternoon pick-me-up, never wavering in their flavor in that tiny silver tube. 
    </p>
    <p>
      But one thing does change about RedBull at every purchase: the price. New York is known as an unaffordable city and the upcharge on my 8oz RedBull can has started to strain my wallet. So, like any good data journalist, I've decided to map out the price of RedBull across the city to figure out exactly steep the cost can rise.
      </p>
        <p>
          This data set is growing and evolving with every RedBull I purchase, check back in and see if I've explored your neighboorhood joint to quench my RedBull addiction.
        </p>
  
  </ArticleBody>

  <Map 
        longitude={mapLng}
        latitude={mapLat}
        zoom={mapZoom}
        theme="fiord"
        caption={hasResult
          ? `Showing results near ${mapLat.toFixed(4)}, ${mapLng.toFixed(4)}`
          : ''}
        credit="OpenFreeMap / OpenStreetMap contributors"
      >
        <MapLayer
          id="search-result-marker"
          type="circle"
          data={redbullPoints}
          paint={{
            'circle-radius': 10,
            'circle-color': '#D2003c',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          }}
        />
      </Map>

      <MethodologyBox title="Methodology">
      <p>
        All data was independently collected by the author through in-person visits to various locations across New York City. Prices were recorded in USD and reflect the cost of an 8oz can of RedBull at each location as of the date of purchase. Data collection is ongoing, and prices may vary over time due to promotions, location-based pricing, or changes in supplier costs.

        
        <a href="https://docs.google.com/spreadsheets/d/1ExMy09OCWdxAQUVO92dmCfXj5p3VVGZ_7wFrs9xuHDc/edit?usp=sharing">See the full dataset here</a> 
      </p>
      <p>
        If you find errors or have questions about this data, please contact us
        at
        <a href="mailto:a.mowreader32@journalism.cuny.edu"
          >a.mowreader32@journalism.cuny.edu</a
        >.
      </p>
    </MethodologyBox>

    <Image src="/crumpled-can.svg" alt="A crumpled RedBull can" size="small" style="max-width: 20px" />

</div>
