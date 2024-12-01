import json
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

'''
This function is for the json file which some of the countries will crash the svg from GADM webstie level 0,
Using GDAM to download the level 1 map will include the cities's geo path
So by remove the path, using this function, we can get the only country's geo path
'''

# Load the GeoJSON  Level 1 file
with open("Big.json", encoding="utf-8") as geojson_file:
    data = json.load(geojson_file)

# Merge all geometries into a single outer boundary
all_shapes = [shape(feature['geometry']) for feature in data['features']]
merged_shape = unary_union(all_shapes)

# Convert the merged shape back to GeoJSON format
merged_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": mapping(merged_shape),
            "properties": {"name": "India Outline"}
        }
    ]
}

# Save the result to a new file
with open("Timor-Leste.json", "w", encoding="utf-8") as outline_file:
    json.dump(merged_geojson, outline_file)
