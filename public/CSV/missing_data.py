import pandas as pd

# Load datasets
world_bank_data = pd.read_csv("World_Bank_Data.csv")
co2_emissions_data = pd.read_csv("OurData_co2_emissions_transport.csv")
fossil_fuels_data = pd.read_csv("OurData_fossil_fuels.csv")

# Rename columns to align for processing
world_bank_data.rename(columns={'Country Name': 'Country', 'Value': 'World Bank Value'}, inplace=True)
co2_emissions_data.rename(columns={'Entity': 'Country', 'Carbon dioxide emissions from transport': 'CO2 Emissions'}, inplace=True)
fossil_fuels_data.rename(columns={'Entity': 'Country', 'Fossil fuels (% equivalent primary energy)': 'Fossil Fuels'}, inplace=True)

# Define a function to update the World Bank data
def update_world_bank_data(row, co2_emissions_data, fossil_fuels_data):
    if pd.isna(row['World Bank Value']):  # Check if World Bank data is N/A
        country = row['Country']
        year = row['Year']
        # Look up the CO2 emissions value
        co2_value = co2_emissions_data.loc[
            (co2_emissions_data['Country'] == country) & (co2_emissions_data['Year'] == year), 'CO2 Emissions']
        if not co2_value.empty:
            return co2_value.values[0]
        
        # Look up the fossil fuels value if CO2 data is not available
        fossil_value = fossil_fuels_data.loc[
            (fossil_fuels_data['Country'] == country) & (fossil_fuels_data['Year'] == year), 'Fossil Fuels']
        if not fossil_value.empty:
            return fossil_value.values[0]
    return row['World Bank Value']  # Return the original value if not N/A or no update available

# Apply the function to update the World Bank data
world_bank_data['Updated Value'] = world_bank_data.apply(
    update_world_bank_data, axis=1, args=(co2_emissions_data, fossil_fuels_data))

# Save the updated World Bank data to a new CSV file
updated_file_path = "Updated_World_Bank_Data.csv"
world_bank_data.to_csv(updated_file_path, index=False)

print(f"Updated World Bank data saved to {updated_file_path}")
