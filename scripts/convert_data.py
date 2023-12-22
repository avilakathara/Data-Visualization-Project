import pandas as pd

# Read the CSV file
df = pd.read_csv('data.csv')

# Remove commas and dollar signs from the 'gdp' column and convert it to numeric
df['gdp'] = pd.to_numeric(df['gdp'].replace('[\$,]', '', regex=True), errors='coerce')

# Convert GDP to billions
df['gdp'] = df['gdp'] / 1e9

df.to_csv('your_file.csv', index=False)
