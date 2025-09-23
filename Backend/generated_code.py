
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv(r"C:\Users\ayush\AppData\Local\Temp\tmpgy4uwlnw.csv")

# 1. Handle Missing Values: 'Postal Code' has 11 missing values.  We'll fill with the mode.
postal_code_mode = df['Postal Code'].mode()[0]
df['Postal Code'] = df['Postal Code'].fillna(postal_code_mode)


# 2. Data Type Conversion: 'Order Date' and 'Ship Date' are objects; convert to datetime.
df['Order Date'] = pd.to_datetime(df['Order Date'], format='%m/%d/%Y', errors='coerce')
df['Ship Date'] = pd.to_datetime(df['Ship Date'], format='%d/%m/%Y', errors='coerce') #Note different format


# 3. Outlier Detection and Handling (example - Sales):  We could explore more sophisticated methods but a simple IQR approach is shown here.  This section is commented out as it may remove legitimate data.  Uncomment if desired.

# Q1 = df['Sales'].quantile(0.25)
# Q3 = df['Sales'].quantile(0.75)
# IQR = Q3 - Q1
# lower_bound = Q1 - 1.5 * IQR
# upper_bound = Q3 + 1.5 * IQR
# df = df[~((df['Sales'] < lower_bound) | (df['Sales'] > upper_bound))]


# 4. Check for and handle any remaining inconsistencies (e.g., unexpected values in categorical columns) -  This step would require domain knowledge of the data and is omitted here for brevity.


# 5. Duplicate Check (already reported as 0, but double-checking)
duplicates = df[df.duplicated(keep=False)]
if not duplicates.empty:
    print("Warning: Duplicates found. Consider removing or investigating.")
    #df.drop_duplicates(inplace=True) #Uncomment to remove duplicates if needed.


# Save the cleaned dataset
df.to_csv("output.csv", index=False)

# Print summary statistics after cleaning
print("Dataset Summary after Cleaning:")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])
print("Missing Counts:\n", df.isnull().sum())
print("Data Types:\n", df.dtypes)
