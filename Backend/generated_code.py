
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv(r"C:\Users\ayush\AppData\Local\Temp\tmpbaj5k83g.csv")

# 1. Handle Missing Values: Impute missing 'Postal Code' with the mean.
df['Postal Code'] = df['Postal Code'].fillna(df['Postal Code'].mean())

# 2. Data Type Conversion: Convert 'Order Date' and 'Ship Date' to datetime objects.
df['Order Date'] = pd.to_datetime(df['Order Date'], format='%m/%d/%Y', errors='coerce')
df['Ship Date'] = pd.to_datetime(df['Ship Date'], format='%d/%m/%Y', errors='coerce')


# 3. Outlier Detection and Handling (Example: Sales):  This part needs more domain knowledge to determine appropriate thresholds.  Here, we'll just cap extremely high values.
#  A more sophisticated approach might involve using IQR or other statistical methods.
df['Sales'] = np.clip(df['Sales'], 0, df['Sales'].quantile(0.99)) #Cap values at the 99th percentile


# 4. Check for and handle any remaining inconsistencies (e.g., unexpected values in categorical columns).  This step is highly dependent on the data and requires careful examination.
#  For this example, we assume no other inconsistencies are present.



# Save the cleaned dataset
df.to_csv("output.csv", index=False)

# Print summary statistics after cleaning
print("Dataset Summary After Cleaning:")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])
print("Missing Counts:\n", df.isnull().sum())
print("Data Types:\n", df.dtypes)
