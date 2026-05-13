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
  import Legend from '$lib/components/Maps/Legend.svelte';
  import BigNumber from '$lib/components/Data/BigNumber.svelte';
  import Dashboard from '$lib/components/Data/Dashboard.svelte';
  import Progressbar from '$lib/components/Data/Progressbar.svelte';

  let { data } = $props();

  // Article metadata
  let headline = 'How Much Does A Can of Red Bull Cost in NYC?';
  let byline = 'Ashley Mowreader';
  let pubDate = '2026-05';
  let dek = 'An interactive data project mapping Red Bull can prices across New York City.';
  // NYC default center
  const NYC_LNG = -74.006;
  const NYC_LAT = 40.7128;
  const NYC_ZOOM = 10;

  // Reactive map state
  let mapLng = $state(NYC_LNG);
  let mapLat = $state(NYC_LAT);
  let mapZoom = $state(NYC_ZOOM);
  let hasResult = $state(false);

  // Category filter state
  let activeCategory = $state('all');

  // Extract unique categories from the data
  const categories = $derived([
    ...new Set(
      (data.redbull ?? [])
        .map((entry) => entry.Category && entry.Category.trim())
        .filter(Boolean)
    ),
  ]);

  function setCategory(category) {
    activeCategory = category;
  }

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

  const redbullBounds = $derived.by(() => {
    const coordinates = redbullPoints.features
      .map((feature) => feature.geometry?.coordinates)
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length === 2);

    if (!coordinates.length) return null;

    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);

    return [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ];
  });

    // Filter data based on active category
  const filteredData = $derived(
    activeCategory === 'all'
      ? data.redbull ?? []
      : (data.redbull ?? []).filter(
          (entry) => entry.Category && entry.Category.trim() === activeCategory
        )
  );

  // Compute stats for visible data
  const visibleCount = $derived(filteredData.length);
  const mostExpensivePrice = $derived(
    filteredData.length > 0
      ? Math.max(...filteredData.map((entry) => entry['Price (8.4oz)'] || 0))
      : null
  );
  const averagePrice = $derived(
    filteredData.length > 0
      ? (filteredData.reduce((sum, entry) => sum + (entry['Price (8.4oz)'] || 0), 0) / filteredData.length).toFixed(2)
      : null
  );

  // for progress bar
  const progressStats = $derived.by(() => {
    const total = data.redbull?.length || 0;
    const maxEntries = 100;
    return {
      value: (total / maxEntries) * 100,
      label: `${total} Red Bull Locations Mapped out of 100`,
    };
  });

 </script>

<!-- This sets the page title in the browser tab -->
<svelte:head>
  <title>{headline} | Ashley Mowreader </title>
  <meta
    name="description"
    content="An interactive map of New York City and relative Red Bull prices at various locations around the city."
  />
</svelte:head>

<!-- Your page content goes here -->
<!-- Full-width header that bleeds across the page -->
<div class="header-bleed">
  <Image src="/pope-redbull.svg" alt="Pope Francis holds a Red Bull can aloft" align="center"/>
</div>

<div class="container">

  <!-- Article Header: Headline, byline, and publication date -->
  <ArticleHeader {headline} {byline} {pubDate} {dek} />

  <!-- Article Body: The main story text with proper typography -->
  
  <ArticleBody>

    <p> How much does nostalgia cost in New York City? According to my reporting, about $3.89.</p>

     <p> One of my favorite caffeinated beverages is an 8 oz can of Red Bull (original flavor, always.) But while the flavor of Red Bull doesn't waver, the price sure does across New York's five borough. So, like any good data journalist, I've decided to map out the price of Red Bull across the city to figure out exactly steep the cost can rise.
      </p>
        <p>
          This data set is growing and evolving with every Red Bull I purchase, check back in and see if I've explored your neighborhood joint to quench my Red Bull addiction.
        </p>
  </ArticleBody>
  
  <Image src="/header.svg" alt="An illustrated Red Bull Can logo and bull" q size="large" align="center"/>

  <div class= "description" align="center"> 
  <p style="font-style: italic;"> Hover over a dot to see details of my Red Bull purchases across the city, including date of purchase, neighborhood and price. Or, sort the data by purchase location and see how trends differ.</p>
  </div>

  <Dashboard>
    <BigNumber
      number={visibleCount}
      label="Red Bull Purchases Logged"
    />

 <BigNumber
      number={averagePrice ? `$${averagePrice}` : '$TK'}
      label="Average Red Bull Price"
    />

    <BigNumber 
      number={mostExpensivePrice ? `$${mostExpensivePrice.toFixed(2)}` : '$TK'}
      label="Most Expensive Red Bull"
    />
   
  </Dashboard>

  <!-- Category filter pills -->
  <div class="category-filters" aria-label="Map categories">
    <button
      type="button"
      class:active={activeCategory === 'all'}
      onclick={() => setCategory('all')}
      align="center"
    >
      All
    </button>

    {#each categories as category}
      <button
        type="button"
        class:active={activeCategory === category}
        onclick={() => setCategory(category)}
      >
        {category}
      </button>
    {/each}
  </div>

   <!-- Map component with interactive MapLayer and popups -->

   <div class="map-container">
  <Map 
        longitude={mapLng}
        latitude={mapLat}
        zoom={mapZoom}
        bounds={redbullBounds}
        interactive={false}
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
          activeCategory={activeCategory}
          paint={{
            'circle-radius': 10,
            'circle-color': '#f1d595',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#D2003c',
          }}
           popup={(feature) => {
            const p = feature.properties ?? {};
            const location = p.Location ?? 'RedBull stop';
            const category = p.Category ? p.Category.trim() : '';
            const neighborhood = p.neighborhood ? p.neighborhood.trim() : '';
            const price = p['Price (8.4oz)'] ?? 'N/A';
            const purchaseDate = p.Purchase_date
              ? new Date(p.Purchase_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '';

            return `
              <strong>${location}</strong><br/>
              ${category ? `${category}<br/>` : ''}
              Price: $${price}<br/>
              ${neighborhood ? `Neighborhood: ${neighborhood}<br/>` : ''}
              ${purchaseDate ? `Purchased: ${purchaseDate}` : ''}
            `;
  }}
        />
      </Map>
    </div>

    <MethodologyBox title="Methodology">
      <p>
        All data was independently collected by the author through in-person visits to various locations across New York City.  Prices were recorded in USD and reflect the cost of an 8oz can of RedBull at each location as of the date of purchase. Data collection is ongoing, and prices may vary over time due to promotions, location-based pricing, or changes in supplier costs.

        
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

    <ArticleBody>

      <h2> Why Red Bull? </h2>
   <p> 
    As a native Washingtonian, there's few beverages that make me more nostalgic rainy, overcast days in the Puget Sound, surrounded by towering pine trees than a Red Bull over ice. Coloquially called a "Red Bull Italian soda," just about any drive-thru coffee shop in Washington, Oregon or Idaho can help you meet your craving for a sugar-loaded energy drink, plus extra sugar syrups, and maybe a splash of juice or lemonade (or heavy cream if you're literally insane). My go-to is strawberry and peach syrup and a splash of orange juice. 
    </p>
    <p>
      When I studied abroad in Argentina, RedBull cans became a go-to grab to quell homesickness, and since moving to the East Coast, RedBulls remain an afternoon pick-me-up, never wavering in their flavor in that tiny silver tube. 
    </p>
  

    <Image src="/cans.svg" alt="Two full Red Bull cans and a crumpled empty can" size="medium" align="center"/>

    <h2> What's Next? </h2>

    <p> I'm hoping to track data on 100 Red Bull can prices! I invite you to bookmark this page (or keep it open forever in your browser, if that's how you operate) and revisit as I make progress toward my goal. </p>

    <Progressbar 
      value={progressStats.value}
      label={progressStats.label} />

  </ArticleBody>



        <p> 

        </p>

<p style="font-style: italic;" align="center"> All trademark rights to images, logos and fonts used belong to Red Bull; this webpage content is intended for educational and informational purposes only.  </p>
</div>

<style lang="scss">
  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    justify-content: center;
  }

  button {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full, 9999px);
    background: var(--color-surface);
    color: var(--color-text);
    padding: var(--spacing-xs) var(--spacing-sm);
    font: inherit;
    cursor: pointer;
    transition: background-color var(--transition-fast),
      color var(--transition-fast), border-color var(--transition-fast);
  }

  button.active {
    background: var(--color-dark-red);
    color: var(--color-background);
    border-color: var(--color-dark-red);
  }

  button:hover {
    border-color: var(--color-dark-red);
  }
</style>
