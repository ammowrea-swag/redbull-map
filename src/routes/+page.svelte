<!--
@component
This is your page!
-->
<script>
  // Import all the news furniture components
  import { onMount } from 'svelte';
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import ArticleBody from '$lib/components/Article/ArticleBody.svelte';
  import MethodologyBox from '$lib/components/Article/MethodologyBox.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import BigNumber from '$lib/components/Data/BigNumber.svelte';
  import Dashboard from '$lib/components/Data/Dashboard.svelte';
  import Progressbar from '$lib/components/Data/Progressbar.svelte';
  import Card from '$lib/components/Data/Card.svelte';
  import CardGrid from '$lib/components/Data/CardGrid.svelte';

  let { data } = $props();
  const entries = $derived.by(() => data.redbull ?? []);

  // Article metadata
  let headline = 'How Much Does A Can of Red Bull Cost in NYC?';
  let byline = 'Ashley Mowreader';
  let pubDate = '2026-05';
  let dek =
    'An interactive data project mapping Red Bull can prices across New York City.';
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

  let mapSection;
  let MapComponent = $state(null);
  let MapLayerComponent = $state(null);
  let mapLoadError = $state('');

  async function loadMapComponents() {
    if (MapComponent && MapLayerComponent) return;

    try {
      const [{ default: Map }, { default: MapLayer }] = await Promise.all([
        import('$lib/components/Maps/Map.svelte'),
        import('$lib/components/Maps/MapLayer.svelte'),
      ]);

      MapComponent = Map;
      MapLayerComponent = MapLayer;
    } catch (error) {
      console.error('Failed to load map components', error);
      mapLoadError = 'The interactive map could not be loaded.';
    }
  }

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') {
      loadMapComponents();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        loadMapComponents();
        observer.disconnect();
      },
      { rootMargin: '200px 0px' }
    );

    if (mapSection) {
      observer.observe(mapSection);
    } else {
      loadMapComponents();
    }

    return () => observer.disconnect();
  });

  // Extract unique categories from the data
  const categories = $derived([
    ...new Set(
      entries
        .map((entry) => entry.Category && entry.Category.trim())
        .filter(Boolean)
    ),
  ]);

  function setCategory(category) {
    activeCategory = category;
  }

  const redbullPoints = $derived.by(() => ({
    type: 'FeatureCollection',
    features: entries.map((entry) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        // Note: dataset fields are named `Longitude` and `Latitude` but
        // contain latitude and longitude values respectively. GeoJSON
        // requires [longitude, latitude], so swap the fields here.
        coordinates: [entry.Latitude, entry.Longitude],
      },
      properties: entry,
    })),
  }));

  const redbullBounds = $derived.by(() => {
    const coordinates = redbullPoints.features
      .map((feature) => feature.geometry?.coordinates)
      .filter(
        (coordinate) => Array.isArray(coordinate) && coordinate.length === 2
      );

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
      ? entries
      : entries.filter(
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
      ? (
          filteredData.reduce(
            (sum, entry) => sum + (entry['Price (8.4oz)'] || 0),
            0
          ) / filteredData.length
        ).toFixed(2)
      : null
  );

  // for progress bar
  const progressStats = $derived.by(() => {
    const total = entries.length;
    const maxEntries = 100;
    return {
      value: (total / maxEntries) * 100,
      label: `${total} Red Bull Locations Mapped out of 100`,
    };
  });
</script>

<!-- This sets the page title in the browser tab -->
<svelte:head>
  <title>{headline} | Ashley Mowreader</title>
  <meta
    name="description"
    content="An interactive map of New York City and relative Red Bull prices at various locations around the city."
  />
</svelte:head>

<!-- Your page content goes here -->
<!-- Full-width header that bleeds across the page -->
<div class="header-bleed">
  <Image
    src="/redbull-nyc-dots.svg"
    alt="A can of Red Bull replaces the Empire State Building in the NYC skyline."
    align="center"
  />
</div>

<div class="container">
  <!-- Article Header: Headline, byline, and publication date -->
  <ArticleHeader {headline} {byline} {pubDate} {dek} />

  <!-- Article Body: The main story text with proper typography -->

  <ArticleBody>
    <p>
      How much does nostalgia cost in New York City? According to my reporting,
      about {averagePrice ? `$${averagePrice}` : '$TK'}.
    </p>

    <p>
      One of my favorite caffeinated beverages is an 8 oz can of Red Bull
      (original flavor, always.) But while the flavor of Red Bull doesn't waver,
      the price sure does across New York's five borough. So, like any good data
      journalist, I've decided to map out the price of Red Bull across the city
      to figure out exactly steep the cost can rise.
    </p>
    <p>
      This data set is growing and evolving with every Red Bull I purchase,
      check back in and see if I've explored your neighborhood joint to quench
      my Red Bull addiction.
    </p>
  </ArticleBody>

  <Image
    src="/Header.svg"
    alt="An illustrated Red Bull Can logo and bull"
    size="large"
    align="center"
  />


  <Dashboard>
    <BigNumber number={visibleCount} label="Red Bull Purchases" />

    <BigNumber
      number={averagePrice ? `$${averagePrice}` : '$TK'}
      label="Average Red Bull Price"
    />

    <BigNumber
      number={mostExpensivePrice ? `$${mostExpensivePrice.toFixed(2)}` : '$TK'}
      label="Most Expensive Red Bull"
    />
  </Dashboard>

    <div class="description" align="center">
    <p style="font-style: italic;">
      Hover over a dot to see details of my Red Bull purchases across the city,
      including date of purchase, neighborhood and price. Or, sort the data by the establishment it was purchased at and see how trends differ.
    </p>
  </div>

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

    {#each categories as category (category)}
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

  <div class="map-container" bind:this={mapSection}>
    {#if MapComponent && MapLayerComponent}
      <MapComponent
        longitude={mapLng}
        latitude={mapLat}
        zoom={mapZoom}
        bounds={redbullBounds}
        interactive={true}
        zoomControl={true}
        disableGestures={true}
        theme="fiord"
        caption={hasResult
          ? `Showing results near ${mapLat.toFixed(4)}, ${mapLng.toFixed(4)}`
          : ''}
        credit="OpenFreeMap / OpenStreetMap contributors"
      >
        <MapLayerComponent
          id="search-result-marker"
          type="circle"
          data={redbullPoints}
          {activeCategory}
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
      </MapComponent>
    {:else}
      <div class="map-placeholder" aria-live="polite">
        {#if mapLoadError}
          <p>{mapLoadError}</p>
        {:else}
          <p>Loading interactive map…</p>
        {/if}
      </div>
    {/if}
  </div>

  <CardGrid> 

      <Card>
      <h3> Project Notes </h3>
      <p> This is an on-going interactive dataset, auto-updating each Sunday with GitActions. Data is not meant to be comprehensive or a reflection of pricing trends of Red Bull, but rather a portfolio piece for a budding data nerd.
      </p>
    </Card>
    <Card> 
      <h3>Got RedBull?</h3>
     <p> For my fellow Red Bull drinkers or data enthusiasts (or both!), if you purchased a Red Bull in New York City that's unrepresented on my map, please send me the details to see your purchase reflected in the map. <a href="https://forms.gle/kg7fX1V1Z9zRmsHG9" target="_blank">Complete this form to add your data</a>.</p>
  <p></p>

    </Card>

</CardGrid>

  <ArticleBody>
  <h2> Why Does This Project Matter? </h2>
  <p>
    It's a grade, according to Ben Welsh. But for you, as a consumer, it's a snapshot of the ways different neighborhoods and establishments across the city price the same product. Grocery prices are historically murky, and between <a href="https://www.nytimes.com/2026/05/14/nyregion/nyc-grocery-stores-surveillance-pricing.html"> dynamic pricing algorithms</a> in the city, rising inflation and <a href="https://www.spglobal.com/energy/en/news-research/latest-news/metals/041426-north-american-aluminum-sector-nearing-supply-crisis-after-middle-east-disruptions">an aluminum shortage</a>, my Red Bull's sticker price is under threat.</p>

    <h2>Why Red Bull?</h2>
    <p>
      As a native Washingtonian, there's few beverages that make me feel nostaligic for rainy, overcast days in the Puget Sound, surrounded by towering pine trees, than a Red Bull over ice. Coloquially called a "Red Bull Italian soda," just about any drive-thru coffee shop in Washington, Oregon or Idaho (and increasingly, Arizona and California) can help you meet your craving for a sugar-loaded energy drink. In addition to 24 plus ounces of your energy drink of choice, you get a dozen pumps of sticky flavored syrups, paired with juice or lemonade (or heavy cream if you're literally insane) and topped with whipped cream if you're extra. My go-to is Red Bull with strawberry and peach syrup and a splash of orange juice.
    </p>

     <p>
      When I studied abroad in Argentina, Red Bull cans became a go-to grab to
      quell homesickness, and since moving to the East Coast, Red Bulls remain a mid-day pick-me-up, bringing me right back to those rainy afternoons in Puyallup. It's also given me a ridiculous caffeine tolerance, but that's a different issue. 
    </p>

<Image
      src="/cans.svg"
      alt="Two full Red Bull cans and a crumpled empty can"
      size="medium"
      align="center"
    />

    <h2>What's Next?</h2>

    <p>
      I'm hoping to track data on 100 Red Bull can prices! I invite you to
      bookmark this page (or keep it open forever in your browser, if that's how
      you operate) and revisit as I make progress toward my goal.
    </p>

    <Progressbar value={progressStats.value} label={progressStats.label} />
  </ArticleBody>
  
  <MethodologyBox title="Methodology">
    <p>
      All data was independently collected by the author through in-person
      visits to various locations across New York City. Prices were recorded in
      USD and reflect the cost of an 8oz can of RedBull at each location as of
      the date of purchase. Data collection is ongoing, and prices may vary over
      time due to promotions, location-based pricing, or changes in supplier
      costs.

      <a
        href="https://docs.google.com/spreadsheets/d/1ExMy09OCWdxAQUVO92dmCfXj5p3VVGZ_7wFrs9xuHDc/edit?usp=sharing"
        >See the full dataset here</a>
    </p>
    <p>
      If you find errors or have questions about this data, please contact us at
      <a href="mailto:a.mowreader32@journalism.cuny.edu"
        >a.mowreader32@journalism.cuny.edu</a>.
    </p>
  </MethodologyBox>

 
<div class="footer"> 
  <p style="font-style: italic;" align="center">
    All trademark rights to images, logos and fonts used belong to Red Bull;
    this webpage content is intended for educational and informational purposes
    only.
  </p>
  </div>
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
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast);
  }

  button.active {
    background: var(--color-dark-red);
    color: var(--color-white);
    border-color: var(--color-dark-red);
  }

  button:hover {
    border-color: var(--color-dark-red);
  }

  .map-placeholder {
    min-height: 320px;
    display: grid;
    place-items: center;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm, 4px);
  }
</style>
