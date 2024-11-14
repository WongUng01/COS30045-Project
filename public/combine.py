import os
import json
'''
This function is read through every files' name for each Continent Folders
Stored the files' name into an array an save as a js file.
To let the world.js able to do something like 'foreach' to the folder and draw the geo path
'''
# Directories containing JSON files
directoryEurope = './Europe'
directoryAsia = './Asia'
combined_directory = './Combined'

# Ensure the Combined directory exists
os.makedirs(combined_directory, exist_ok=True)

# Collect all JSON filenames in the Europe directory
if os.path.exists(directoryEurope):
    json_files_Europe = [f for f in os.listdir(directoryEurope) if f.endswith('.json')]
else:
    print(f"Directory {directoryEurope} not found.")
    json_files_Europe = []

# Write the Europe filenames to CombinedEurope.js
with open(os.path.join(combined_directory, "CombinedEurope.js"), 'w', encoding='utf-8') as outfile:
    json.dump(json_files_Europe, outfile)

# Collect all JSON filenames in the Asia directory
if os.path.exists(directoryAsia):
    json_files_Asia = [f for f in os.listdir(directoryAsia) if f.endswith('.json')]
else:
    print(f"Directory {directoryAsia} not found.")
    json_files_Asia = []

# Write the Asia filenames to CombinedAsia.js
with open(os.path.join(combined_directory, "CombinedAsia.js"), 'w', encoding='utf-8') as outfile:
    json.dump(json_files_Asia, outfile)

print("Filenames saved as CombinedEurope.js and CombinedAsia.js")
