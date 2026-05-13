<!--
@component
MapLayer.svelte — Adds a GeoJSON source and layer to a parent Map

Must be placed as a child of a Map component. Uses Svelte context to
obtain the MapLibre GL map instance, then adds a GeoJSON source and a
styled layer. The layer is automatically removed when the component is
destroyed or when the map style changes and reloads.

Pass a `popup` template function to enable click popups. The function
receives the clicked feature and should return an HTML string.
When `popup` is set, the cursor changes to a pointer while hovering
over the layer so readers know it is interactive.

USAGE EXAMPLE:
<Map longitude={-74.006} latitude={40.7128} zoom={10}>
  <MapLayer
    id="my-points"
    type="circle"
    data={{
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
          properties: { name: 'NYC' },
        },
      ],
    }}
    paint={{ 'circle-radius': 8, 'circle-color': '#0033A1' }}
    popup={(feature) => `<strong>${feature.properties.name}</strong>`}
  />
</Map>
-->
<script>
  import { getContext, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';


  let {
    id, // Unique layer identifier (required)
    type = 'circle', // MapLibre layer type: 'circle' | 'fill' | 'line' | 'symbol'
    data = { type: 'FeatureCollection', features: [] }, // GeoJSON data
    paint = {}, // MapLibre paint properties
    layout = {}, // MapLibre layout properties
    popup = null, // Optional function (feature) => htmlString
    activeCategory = 'all', // Active category for filtering (default: 'all')
  } = $props();

  // Filter features by selected category
  const filteredFeatures = $derived(
    activeCategory === 'all'
      ? data.features || []
      : (data.features || []).filter(
          (f) => f.properties && f.properties.Category && f.properties.Category.trim() === activeCategory
        )
  );

  const filteredData = $derived({
    ...data,
    features: filteredFeatures,
  });

  const validatedId = $derived.by(() => {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('MapLayer requires a non-empty string "id" prop.');
    }

    return id;
  });

  const ctx = getContext('maplibre-map');
  if (!ctx) {
    throw new Error(
      'MapLayer must be placed inside a Map component. No map context found.'
    );
  }

  /** Tracks the currently-open popup so we can toggle it off when needed. */
  let openPopup = null;
  let openPopupKey = null;
  let suppressNextMapClick = false;

  const isCoarsePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const TAP_TOLERANCE_PX = isCoarsePointer ? 22 : 10;

  function getFeatureKey(feature) {
    if (!feature) return '';
    if (feature.id !== undefined && feature.id !== null) return String(feature.id);
    return JSON.stringify({ geometry: feature.geometry, properties: feature.properties });
  }

  function getFeatureLngLat(feature, fallbackLngLat) {
    const coords = feature?.geometry?.coordinates;
    if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return coords;
    }
    return [fallbackLngLat.lng, fallbackLngLat.lat];
  }

  function openOrTogglePopup(feature, lngLat) {
    const html = popup(feature);
    if (!html) return;

    const featureKey = getFeatureKey(feature);

    if (openPopup && openPopupKey === featureKey) {
      openPopup.remove();
      openPopup = null;
      openPopupKey = null;
      return;
    }

    if (openPopup) openPopup.remove();
    openPopup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
    })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(ctx.getMap());
    openPopupKey = featureKey;

    openPopup.on('close', () => {
      openPopup = null;
      openPopupKey = null;
    });
  }

  /** Handles click on the layer: builds an HTML popup from the template function. */
  function handlePopupClick(e) {
    if (!popup) return;
    const feature = e.features && e.features[0];
    if (!feature) return;

    if (e.originalEvent && typeof e.originalEvent.stopPropagation === 'function') {
      e.originalEvent.stopPropagation();
    }

    suppressNextMapClick = true;
    const lngLat = getFeatureLngLat(feature, e.lngLat);
    openOrTogglePopup(feature, lngLat);
  }

  /** Opens nearby feature popups on tap and closes popup on empty-map click. */
  function handleMapClickClose(e) {
    if (suppressNextMapClick) {
      suppressNextMapClick = false;
      return;
    }

    if (!popup || !e?.point) return;
    const map = ctx.getMap();
    if (!map) return;

    const p = e.point;
    const nearbyFeatures = map.queryRenderedFeatures(
      [
        [p.x - TAP_TOLERANCE_PX, p.y - TAP_TOLERANCE_PX],
        [p.x + TAP_TOLERANCE_PX, p.y + TAP_TOLERANCE_PX],
      ],
      { layers: [validatedId] }
    );

    const nearbyFeature = nearbyFeatures && nearbyFeatures[0];
    if (nearbyFeature) {
      const lngLat = getFeatureLngLat(nearbyFeature, e.lngLat);
      openOrTogglePopup(nearbyFeature, lngLat);
      return;
    }

    if (!openPopup) return;
    openPopup.remove();
    openPopup = null;
    openPopupKey = null;
  }

  /** Sets the cursor to a pointer while hovering over an interactive layer. */
  function handleCursorEnter() {
    if (!popup) return;
    const map = ctx.getMap();
    if (map) map.getCanvas().style.cursor = 'pointer';
  }

  /** Restores the default cursor when the hover ends. */
  function handleMouseLeave() {
    const map = ctx.getMap();
    if (map) map.getCanvas().style.cursor = '';
  }

  /** Adds the source, layer, and interaction handlers to the map. */
  function addLayer() {
    const map = ctx.getMap();
    if (!map) return;

    // Remove existing source/layer if already present (e.g. after style reload)
    if (map.getLayer(validatedId)) map.removeLayer(validatedId);
    if (map.getSource(validatedId)) map.removeSource(validatedId);


    // Only show filtered features
    map.addSource(validatedId, {
      type: 'geojson',
      data: filteredData,
    });

    map.addLayer({
      id: validatedId,
      type,
      source: validatedId,
      paint,
      layout,
    });

    if (popup) {
      map.on('click', validatedId, handlePopupClick);
      map.on('click', handleMapClickClose);
      map.on('mouseenter', validatedId, handleCursorEnter);
      map.on('mouseleave', validatedId, handleMouseLeave);
    }
  }

  /** Removes the source, layer, and any registered handlers from the map. */
  function removeLayer() {
    const map = ctx.getMap();
    if (!map) return;

    if (popup) {
      map.off('click', validatedId, handlePopupClick);
      map.off('click', handleMapClickClose);
      map.off('mouseenter', validatedId, handleCursorEnter);
      map.off('mouseleave', validatedId, handleMouseLeave);
    }

    if (map.getLayer(validatedId)) map.removeLayer(validatedId);
    if (map.getSource(validatedId)) map.removeSource(validatedId);

    if (openPopup) {
      openPopup.remove();
      openPopup = null;
      openPopupKey = null;
    }
  }

  // Re-add the layer whenever the map style reloads (e.g. theme change)
  function handleStyleLoad() {
    addLayer();
  }

  // Add the layer now (map is already ready because Map renders children
  // only after mapReady is true).
  addLayer();
  ctx.onStyleLoad(handleStyleLoad);

  // Reactively update the GeoJSON data when the data prop changes
  $effect(() => {
    const map = ctx.getMap();
    if (!map) return;
    const currentData = filteredData; // read reactive data + category state
    const source = map.getSource(validatedId);
    if (source) {
      source.setData(currentData);
    }
  });

  // Track previous paint keys so we can unset removed properties
  let previousPaintKeys = [];

  // Reactively update paint properties when paint prop changes
  $effect(() => {
    const map = ctx.getMap();
    if (!map || !map.getLayer(validatedId)) return;
    const currentPaint = paint; // read reactive prop
    const currentKeys = Object.keys(currentPaint);

    // Unset any paint properties that were removed
    for (const key of previousPaintKeys) {
      if (!(key in currentPaint)) {
        map.setPaintProperty(validatedId, key, undefined);
      }
    }

    // Apply current paint properties
    for (const [key, value] of Object.entries(currentPaint)) {
      map.setPaintProperty(validatedId, key, value);
    }

    previousPaintKeys = currentKeys;
  });

  // Keep circle dots visually consistent regardless of category selection.
  $effect(() => {
    const map = ctx.getMap();
    if (!map || !map.getLayer(validatedId)) return;
    // Only applies to circle layers
    if (type !== 'circle') return;

    map.setPaintProperty(validatedId, 'circle-color', '#f1d595');
    map.setPaintProperty(validatedId, 'circle-stroke-width', 3);
    map.setPaintProperty(validatedId, 'circle-stroke-color', '#D2003c');
  });

onDestroy(() => {
  ctx.offStyleLoad(handleStyleLoad);
  removeLayer();
});
</script>

