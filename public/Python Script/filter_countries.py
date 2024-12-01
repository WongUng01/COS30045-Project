import pandas as pd
'''
As there is a dataset contains the countries in the wolrd, for the effeciency, removing the unnecessary countries that only left the countryis which in Europe and Asian
By chencking the Country ISO code, we can determine the region of the country, then we can remove the countries that only left in Europe and Asia
Beside that, we also seperate the Asian and European Countries into two different csv files.

Input: Dataset in csv file
Output: Asian Dataset, European Dataset, and the dataset contain both Asian and European Countries
'''
# Load the dataset (replace 'xxx.csv' with the path to your actual file)
df = pd.read_csv('Air quality and health.csv')

# Asian Countries ISO code
Asia = [
    "AFG", "ARM", "AZE", "BHR", "BGD", "BTN", "BRN", "KHM", "CHN", "CYP",
    "GEO", "HKG", "IND", "IDN", "IRN", "IRQ", "ISR", "JPN", "JOR", "KAZ", "KWT",
    "KGZ", "LAO", "LBN", "MYS", "MDV", "MNG", "MMR", "NPL", "PRK", "OMN",
    "PAK", "PHL", "QAT", "SAU", "SGP", "KOR", "LKA", "SYR", 
    "TJK", "THA", "TLS", "TUR", "TKM", "ARE", "UZB", "VNM", "YEM", "MAC"
]

# European Countries ISO code
Europe = [
    "ALB", "AND", "AUT", "BLR", "BEL", "BIH", "BGR", "HRV",
    "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN",
    "ISL", "IRL", "ITA", "XKX", "LVA", "LIE", "LTU", "LUX", "MLT",
    "MDA", "MCO", "MNE", "NLD", "MKD", "NOR", "POL", "PRT", "ROU", "RUS",
    "SMR", "SRB", "SVK", "SVN", "ESP", "SWE", "CHE", "UKR", "GBR",
    "FRO", "IMN", "XKX"
]

# Choose out rows where 'ISO' matches 
filtered_europe = df[df['ISO'].isin(Europe)]
filtered_asia = df[df['ISO'].isin(Asia)]
filtered_all = df[df['ISO'].isin(Asia + Europe)]

# Display the filtered dataset
print(filtered_europe)
print(filtered_asia)

# Save the filtered data to a new CSV file
filtered_europe.to_csv('Continent_CSV/europe_dataset.csv', index=False)
filtered_asia.to_csv('Continent_CSV/asia_dataset.csv', index=False)
filtered_all.to_csv('Filtered_AirQuality_CSV/filtered_dataset.csv', index=False)
